// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "./TriviaQToken.sol";

// Soneium-only fork of TriviaQuest.sol — DO NOT deploy this on Celo or Base.
//
// Divergence from TriviaQuest.sol: every native-currency payout (prize transfers
// in finishRound(), the protocol fee transfer in joinRound()) uses a low-level
// .call{value:} with a pull-pattern fallback instead of Solidity's payable(...).
// transfer(), which forwards a fixed 2300-gas stipend.
//
// Why this matters on Soneium and not on Celo/Base: every recipient inside the
// Startale Mini App host is an ERC-4337 smart account, never an EOA — "every user
// who signs in gets an ERC-4337 smart account, and it's always the signer"
// (docs.startale.com/concepts/smart-accounts). A bare .transfer() to a smart
// account very often reverts (2300 gas is rarely enough for a contract's
// receive()/fallback(), and reverts outright if it has none). On the original
// TriviaQuest.sol, that revert takes the entire finishRound() tx down with it —
// on Soneium, where nearly every winner is a smart account, that's not an edge
// case, it's the common case, and it would have frozen the round-rotation cron
// permanently. Celo/Base players are overwhelmingly EOAs, so this was a genuine
// edge case there and TriviaQuest.sol is left exactly as deployed, unmodified.
//
// Fix: try the direct .call{value:} first (works for EOAs and any smart account
// with a working receive()/fallback() — the common case, no UX change). If it
// fails, credit pendingWithdrawals[recipient] instead of reverting the whole tx,
// and the recipient calls withdraw() themselves whenever they want. Every
// finishRound() call now succeeds regardless of what the winners' addresses are.
contract TriviaQuestSoneium is Ownable, ReentrancyGuard {

    TriviaQToken public trivqToken;
    uint256 public constant TRIVQ_PER_POINT = 100 * 1e18;

    // ── Protocol fee ──────────────────────────────────────
    address public treasury;
    uint256 public protocolFeeBps = 1000; // 10% (basis points)
    uint256 public totalFeesCollected;

    // ── Pull-pattern fallback for failed pushes (see contract header) ────
    mapping(address => uint256) public pendingWithdrawals;

    struct Player {
        uint256 score;
        uint256 totalWinnings;
        uint256 totalPoints;
        uint256 gamesPlayed;
        uint256 bestScore;
        bool exists;
    }

    struct Round {
        uint256 id;
        uint256 prizePool;
        uint256 startTime;
        uint256 endTime;
        address[] topWinners;
        bool finished;
    }

    struct LeaderboardEntry {
        address player;
        uint256 totalPoints;
        uint256 bestScore;
        uint256 gamesPlayed;
    }

    uint256 public entryFee = 0.01 ether;
    uint256 public currentRoundId;
    uint256 public roundDuration = 1 days;

    mapping(address => Player) public players;
    mapping(uint256 => Round) public rounds;
    mapping(uint256 => mapping(address => uint256)) public roundScores;

    address[] public playerList;
    uint256 public constant MAX_LEADERBOARD = 10;

    event PlayerJoined(address indexed player, uint256 roundId);
    event ScoreSubmitted(address indexed player, uint256 score, uint256 points, uint256 roundId);
    event RoundFinished(uint256 roundId, address[] winners, uint256[] prizes);
    event NewRoundStarted(uint256 roundId);
    event FeeCollected(uint256 amount, address treasury);
    event TreasuryUpdated(address oldTreasury, address newTreasury);
    event ProtocolFeeUpdated(uint256 oldFee, uint256 newFee);
    event PaymentCredited(address indexed to, uint256 amount); // push failed, pulled into pendingWithdrawals
    event Withdrawn(address indexed to, uint256 amount);

    constructor() Ownable(msg.sender) {
        treasury = msg.sender;
        _startNewRound();
    }

    function joinRound() external payable nonReentrant {
        require(msg.value == entryFee, "Wrong entry fee");
        Round storage round = rounds[currentRoundId];
        require(block.timestamp < round.endTime, "Round ended");
        require(roundScores[currentRoundId][msg.sender] == 0, "Already joined");

        // ── Protocol fee ──────────────────────────────────
        uint256 fee = (msg.value * protocolFeeBps) / 10000;
        uint256 netAmount = msg.value - fee;

        if (fee > 0 && treasury != address(0)) {
            totalFeesCollected += fee;
            _payOrCredit(treasury, fee);
            emit FeeCollected(fee, treasury);
        }

        round.prizePool += netAmount;
        // ─────────────────────────────────────────────────

        if (!players[msg.sender].exists) {
            players[msg.sender] = Player(0, 0, 0, 0, 0, true);
            playerList.push(msg.sender);
        }

        roundScores[currentRoundId][msg.sender] = 1;
        emit PlayerJoined(msg.sender, currentRoundId);
    }

    function submitScore(address player, uint256 score, uint256 points) external onlyOwner {
        require(roundScores[currentRoundId][player] > 0, "Player not in round");
        roundScores[currentRoundId][player] = score;
        players[player].score = score;
        players[player].totalPoints += points;
        players[player].gamesPlayed += 1;
        if (score > players[player].bestScore) {
            players[player].bestScore = score;
        }
        emit ScoreSubmitted(player, score, points, currentRoundId);

        if (
            address(trivqToken) != address(0) &&
            score > 0 &&
            trivqToken.rewardsRemaining() >= score * TRIVQ_PER_POINT
        ) {
            trivqToken.mintReward(player, score * TRIVQ_PER_POINT);
        }
    }

    function finishRound(address[] calldata topWinners) external onlyOwner nonReentrant {
        require(topWinners.length > 0 && topWinners.length <= 3, "Need 1-3 winners");
        Round storage round = rounds[currentRoundId];
        require(!round.finished, "Already finished");
        require(block.timestamp >= round.endTime, "Round not over yet");

        round.finished = true;
        round.topWinners = topWinners;

        uint256 prize = round.prizePool;
        round.prizePool = 0;

        uint256[] memory prizes = new uint256[](topWinners.length);

        if (topWinners.length == 1) {
            prizes[0] = prize;
            players[topWinners[0]].totalWinnings += prize;
            _payOrCredit(topWinners[0], prize);
        } else if (topWinners.length == 2) {
            prizes[0] = (prize * 60) / 100;
            prizes[1] = (prize * 40) / 100;
            for (uint256 i = 0; i < 2; i++) {
                players[topWinners[i]].totalWinnings += prizes[i];
                _payOrCredit(topWinners[i], prizes[i]);
            }
        } else {
            prizes[0] = (prize * 50) / 100;
            prizes[1] = (prize * 30) / 100;
            prizes[2] = (prize * 20) / 100;
            for (uint256 i = 0; i < 3; i++) {
                players[topWinners[i]].totalWinnings += prizes[i];
                _payOrCredit(topWinners[i], prizes[i]);
            }
        }

        emit RoundFinished(currentRoundId, topWinners, prizes);
        _startNewRound();
    }

    // ── Hybrid push/pull payout ────────────────────────────
    // Tries a direct call{value:} first (all the gas the call needs, unlike the
    // old fixed 2300-gas .transfer()). If the recipient reverts or has no payable
    // entry point at all, credit them instead of reverting the caller's tx —
    // finishRound() and joinRound() must never fail because of what a winner's or
    // the treasury's address happens to be.
    function _payOrCredit(address to, uint256 amount) internal {
        if (amount == 0) return;
        (bool success, ) = payable(to).call{value: amount}("");
        if (!success) {
            pendingWithdrawals[to] += amount;
            emit PaymentCredited(to, amount);
        }
    }

    // Recipient-initiated pull for anything that couldn't be pushed — failed
    // prize payouts, failed treasury fee transfers. Zeroes the balance before the
    // external call (checks-effects-interactions), on top of nonReentrant.
    function withdraw() external nonReentrant {
        uint256 amount = pendingWithdrawals[msg.sender];
        require(amount > 0, "Nothing to withdraw");
        pendingWithdrawals[msg.sender] = 0;
        (bool success, ) = payable(msg.sender).call{value: amount}("");
        require(success, "Withdraw failed");
        emit Withdrawn(msg.sender, amount);
    }

    function getLeaderboard() external view returns (LeaderboardEntry[] memory) {
        if (playerList.length == 0) {
            return new LeaderboardEntry[](0);
        }

        uint256 count = playerList.length < MAX_LEADERBOARD ? playerList.length : MAX_LEADERBOARD;
        LeaderboardEntry[] memory entries = new LeaderboardEntry[](count);

        for (uint256 i = 0; i < playerList.length; i++) {
            address p = playerList[i];
            LeaderboardEntry memory entry = LeaderboardEntry({
                player: p,
                totalPoints: players[p].totalPoints,
                bestScore: players[p].bestScore,
                gamesPlayed: players[p].gamesPlayed
            });

            if (i < count) {
                entries[i] = entry;
                for (uint256 j = i; j > 0; j--) {
                    if (entries[j].totalPoints > entries[j-1].totalPoints) {
                        LeaderboardEntry memory temp = entries[j-1];
                        entries[j-1] = entries[j];
                        entries[j] = temp;
                    } else {
                        break;
                    }
                }
            } else {
                if (entry.totalPoints > entries[count-1].totalPoints) {
                    entries[count-1] = entry;
                    for (uint256 j = count-1; j > 0; j--) {
                        if (entries[j].totalPoints > entries[j-1].totalPoints) {
                            LeaderboardEntry memory temp = entries[j-1];
                            entries[j-1] = entries[j];
                            entries[j] = temp;
                        } else {
                            break;
                        }
                    }
                }
            }
        }

        return entries;
    }

    function _startNewRound() internal {
        currentRoundId++;
        address[] memory emptyWinners;
        rounds[currentRoundId] = Round({
            id: currentRoundId,
            prizePool: 0,
            startTime: block.timestamp,
            endTime: block.timestamp + roundDuration,
            topWinners: emptyWinners,
            finished: false
        });
        emit NewRoundStarted(currentRoundId);
    }

    // ── Admin ─────────────────────────────────────────────

    function setEntryFee(uint256 fee) external onlyOwner {
        entryFee = fee;
    }

    function setRoundDuration(uint256 duration) external onlyOwner {
        roundDuration = duration;
    }

    function setTrivqToken(address _trivqToken) external onlyOwner {
        require(_trivqToken != address(0), "zero address");
        trivqToken = TriviaQToken(_trivqToken);
    }

    function setTreasury(address _treasury) external onlyOwner {
        require(_treasury != address(0), "zero address");
        emit TreasuryUpdated(treasury, _treasury);
        treasury = _treasury;
    }

    function setProtocolFee(uint256 _feeBps) external onlyOwner {
        require(_feeBps <= 2000, "Max 20%");
        emit ProtocolFeeUpdated(protocolFeeBps, _feeBps);
        protocolFeeBps = _feeBps;
    }

    // ── Views ─────────────────────────────────────────────

    function getCurrentRound() external view returns (
        uint256 id,
        uint256 prizePool,
        uint256 startTime,
        uint256 endTime,
        address[] memory topWinners,
        bool finished
    ) {
        Round storage r = rounds[currentRoundId];
        return (r.id, r.prizePool, r.startTime, r.endTime, r.topWinners, r.finished);
    }

    function getPlayerScore(address player) external view returns (uint256) {
        return roundScores[currentRoundId][player];
    }

    function getPlayerStats(address player) external view returns (Player memory) {
        return players[player];
    }

    function getTotalPlayers() external view returns (uint256) {
        return playerList.length;
    }
}
