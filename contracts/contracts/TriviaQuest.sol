// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract TriviaQuest is Ownable, ReentrancyGuard {

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
        address winner;
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
<<<<<<< HEAD
    event ScoreSubmitted(address indexed player, uint256 score, uint256 points, uint256 roundId);
    event RoundFinished(uint256 roundId, address winner, uint256 prize);
=======
    event ScoreSubmitted(address indexed player, uint256 score, uint256 roundId);
    event RoundFinished(uint256 roundId, address[] winners, uint256[] prizes);
>>>>>>> 3be4c1b73d80a2a70ba0178abc56e20d41eec661
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

    function finishRound(address winner) external onlyOwner nonReentrant {
        Round storage round = rounds[currentRoundId];
        require(!round.finished, "Already finished");
        require(block.timestamp >= round.endTime, "Round not over yet");

        round.finished = true;
        round.winner = winner;

        uint256 prize = round.prizePool;
        round.prizePool = 0;

        players[winner].totalWinnings += prize;
        payable(winner).transfer(prize);

<<<<<<< HEAD
        emit RoundFinished(currentRoundId, winner, prize);
=======
       emit RoundFinished(currentRoundId, winners, prizes);

>>>>>>> 3be4c1b73d80a2a70ba0178abc56e20d41eec661
        _startNewRound();
    }

    function _startNewRound() internal {
        currentRoundId++;
        rounds[currentRoundId] = Round({
            id: currentRoundId,
            prizePool: 0,
            startTime: block.timestamp,
            endTime: block.timestamp + roundDuration,
            winner: address(0),
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

    function getCurrentRound() external view returns (Round memory) {
        return rounds[currentRoundId];
    }

    function getPlayerScore(address player) external view returns (uint256) {
        return roundScores[currentRoundId][player];
    }
<<<<<<< HEAD

    function getPlayerStats(address player) external view returns (Player memory) {
        return players[player];
    }

    function getTotalPlayers() external view returns (uint256) {
        return playerList.length;
    }
}
=======
}
>>>>>>> 3be4c1b73d80a2a70ba0178abc56e20d41eec661
