// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract TriviaQuest is Ownable, ReentrancyGuard {
    
    // ── Types ──────────────────────────────────────────────
    struct Player {
        uint256 score;
        uint256 totalWinnings;
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

    // ── State ──────────────────────────────────────────────
    uint256 public entryFee = 0.01 ether;  // ~0.01 CELO
    uint256 public currentRoundId;
    uint256 public roundDuration = 1 days;

    mapping(address => Player) public players;
    mapping(uint256 => Round) public rounds;
    mapping(uint256 => mapping(address => uint256)) public roundScores;

    // ── Events ─────────────────────────────────────────────
    event PlayerJoined(address indexed player, uint256 roundId);
    event ScoreSubmitted(address indexed player, uint256 score, uint256 roundId);
    event RoundFinished(uint256 roundId, address[] winners, uint256[] prizes);
    event NewRoundStarted(uint256 roundId);
    

    // ── Constructor ────────────────────────────────────────
    constructor() Ownable(msg.sender) {
        _startNewRound();
    }

    // ── Join a round ───────────────────────────────────────
    function joinRound() external payable nonReentrant {
        require(msg.value == entryFee, "Wrong entry fee");
        Round storage round = rounds[currentRoundId];
        require(block.timestamp < round.endTime, "Round ended");
        require(roundScores[currentRoundId][msg.sender] == 0, "Already joined");

        round.prizePool += msg.value;

        if (!players[msg.sender].exists) {
            players[msg.sender] = Player(0, 0, true);
        }

        roundScores[currentRoundId][msg.sender] = 1; // marque comme inscrit

        emit PlayerJoined(msg.sender, currentRoundId);
    }

    // ── Submit score (owner only pour sécurité) ────────────
    function submitScore(address player, uint256 score) external onlyOwner {
        require(roundScores[currentRoundId][player] > 0, "Player not in round");
        roundScores[currentRoundId][player] = score;
        players[player].score = score;

        emit ScoreSubmitted(player, score, currentRoundId);
    }

    // ── Finish round & pay winner ──────────────────────────
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

       emit RoundFinished(currentRoundId, winners, prizes);

        _startNewRound();
    }

    // ── Internal: start new round ──────────────────────────
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

    // ── Admin ──────────────────────────────────────────────
    function setEntryFee(uint256 fee) external onlyOwner {
        entryFee = fee;
    }

    function setRoundDuration(uint256 duration) external onlyOwner {
        roundDuration = duration;
    }

    // ── Getters ────────────────────────────────────────────
    function getCurrentRound() external view returns (Round memory) {
        return rounds[currentRoundId];
    }

    function getPlayerScore(address player) external view returns (uint256) {
        return roundScores[currentRoundId][player];
    }
}
