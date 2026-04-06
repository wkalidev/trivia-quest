// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "./TriviaQToken.sol";

contract TriviaQuest is Ownable, ReentrancyGuard {

    TriviaQToken public trivqToken;
    uint256 public constant TRIVQ_PER_POINT = 100 * 1e18;

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

    constructor() Ownable(msg.sender) {
        _startNewRound();
    }

    function joinRound() external payable nonReentrant {
        require(msg.value == entryFee, "Wrong entry fee");
        Round storage round = rounds[currentRoundId];
        require(block.timestamp < round.endTime, "Round ended");
        require(roundScores[currentRoundId][msg.sender] == 0, "Already joined");

        round.prizePool += msg.value;

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
            payable(topWinners[0]).transfer(prize);
        } else if (topWinners.length == 2) {
            prizes[0] = (prize * 60) / 100;
            prizes[1] = (prize * 40) / 100;
            for (uint256 i = 0; i < 2; i++) {
                players[topWinners[i]].totalWinnings += prizes[i];
                payable(topWinners[i]).transfer(prizes[i]);
            }
        } else {
            prizes[0] = (prize * 50) / 100;
            prizes[1] = (prize * 30) / 100;
            prizes[2] = (prize * 20) / 100;
            for (uint256 i = 0; i < 3; i++) {
                players[topWinners[i]].totalWinnings += prizes[i];
                payable(topWinners[i]).transfer(prizes[i]);
            }
        }

        emit RoundFinished(currentRoundId, topWinners, prizes);
        _startNewRound();
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