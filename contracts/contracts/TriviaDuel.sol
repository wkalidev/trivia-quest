// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";

/**
 * @title TriviaDuel
 * @notice Duel 1v1 — deux joueurs misent du CELO, le meilleur score remporte la cagnotte
 * @dev Contrat indépendant de TriviaQuest.sol
 */
contract TriviaDuel is Ownable, ReentrancyGuard {

    // ── Constants ─────────────────────────────────────────
    uint256 public protocolFeeBps = 1000; // 10%
    address public treasury;
    uint256 public totalFeesCollected;
    uint256 public duelCounter;
    address public gameSigner;  // Backend signer wallet
    bool public useVerifiedOnly = false;

    // ── Duel states ───────────────────────────────────────
    enum DuelStatus { Open, Active, Finished, Cancelled }

    struct Duel {
        uint256 id;
        address playerA;
        address playerB;
        uint256 wager;        // Mise par joueur (en wei)
        uint256 scoreA;
        uint256 scoreB;
        bool scoreASubmitted;
        bool scoreBSubmitted;
        address winner;
        DuelStatus status;
        uint256 createdAt;
        uint256 expiresAt;    // Si pas rejoint dans 24h → annulé
    }

    mapping(bytes32 => bool) public usedNonces;  // Prevent replay attacks
    mapping(uint256 => Duel) public duels;
    mapping(address => uint256[]) public playerDuels; // historique par joueur

    // ── Events ────────────────────────────────────────────
    event DuelCreated(uint256 indexed duelId, address indexed playerA, uint256 wager);
    event DuelJoined(uint256 indexed duelId, address indexed playerB);
    event ScoreSubmitted(uint256 indexed duelId, address indexed player, uint256 score, bytes32 nonce);
    event DuelFinished(uint256 indexed duelId, address indexed winner, uint256 prize);
    event DuelCancelled(uint256 indexed duelId, address indexed playerA);
    event DuelTie(uint256 indexed duelId, uint256 refundEach);

    // ── Errors ────────────────────────────────────────────
    error InvalidSignature();

    struct ScoreProof {
        uint256 duelId;
        address player;
        uint256 score;
        bytes32 nonce;
        bytes signature;
    }

    // ── Create duel ───────────────────────────────────────
    /**
     * @notice Crée un duel et mise du CELO
     * @dev Le montant envoyé devient la mise (wager)
     */
    function createDuel() external payable nonReentrant returns (uint256) {
        require(msg.value >= 0.001 ether, "Wager too low (min 0.001 CELO)");

        duelCounter++;
        uint256 duelId = duelCounter;

        duels[duelId] = Duel({
            id: duelId,
            playerA: msg.sender,
            playerB: address(0),
            wager: msg.value,
            scoreA: 0,
            scoreB: 0,
            scoreASubmitted: false,
            scoreBSubmitted: false,
            winner: address(0),
            status: DuelStatus.Open,
            createdAt: block.timestamp,
            expiresAt: block.timestamp + 24 hours
        });

        playerDuels[msg.sender].push(duelId);

        emit DuelCreated(duelId, msg.sender, msg.value);
        return duelId;
    }

    // ── Join duel ─────────────────────────────────────────
    /**
     * @notice Rejoindre un duel ouvert avec la même mise
     */
    function joinDuel(uint256 duelId) external payable nonReentrant {
        Duel storage duel = duels[duelId];

        require(duel.status == DuelStatus.Open, "Duel not open");
        require(duel.playerA != address(0), "Duel not found");
        require(msg.sender != duel.playerA, "Cannot duel yourself");
        require(msg.value == duel.wager, "Wrong wager amount");
        require(block.timestamp < duel.expiresAt, "Duel expired");

        duel.playerB = msg.sender;
        duel.status = DuelStatus.Active;

        playerDuels[msg.sender].push(duelId);

        emit DuelJoined(duelId, msg.sender);
    }

    // ── Submit score ──────────────────────────────────────
    /**
     * @notice Soumet le score d'un joueur (appelé par le owner/backend)
     * @param duelId ID du duel
     * @param player Adresse du joueur
     * @param score Score obtenu (0-10)
     */
    function submitScore(
        uint256 duelId,
        address player,
        uint256 score
    ) external onlyOwner nonReentrant {
        Duel storage duel = duels[duelId];
        require(!useVerifiedOnly || gameSigner == address(0), "Use submitScoreVerified instead");
        require(duel.status == DuelStatus.Active, "Duel not active");
        require(score <= 10, "Score max is 10");
        require(
            player == duel.playerA || player == duel.playerB,
            "Player not in duel"
        );

        if (player == duel.playerA) {
            require(!duel.scoreASubmitted, "Score already submitted");
            duel.scoreA = score;
            duel.scoreASubmitted = true;
        } else {
            require(!duel.scoreBSubmitted, "Score already submitted");
            duel.scoreB = score;
            duel.scoreBSubmitted = true;
        }

        emit ScoreSubmitted(duelId, player, score, bytes32(0));

        //  Résout le duel si les deux scores sont soumis
        if (duel.scoreASubmitted && duel.scoreBSubmitted) {
            _resolveDuel(duelId);
        }
    }

    function submitScoreVerified(ScoreProof calldata proof) external nonReentrant {
        require(gameSigner != address(0), "Game signer not set");
        
        // 1. Verify signature
        bytes32 messageHash = keccak256(abi.encodePacked(
            proof.duelId,
            proof.player,
            proof.score,
            proof.nonce,
            block.chainid,  // Prevent cross-chain replay
            address(this)    // Prevent cross-contract replay
        ));
        
        address recoveredSigner = ECDSA.recover(
        keccak256(abi.encodePacked("\x19Ethereum Signed Message:\n32", messageHash)),
        proof.signature
        );
        
        if (recoveredSigner != gameSigner) revert InvalidSignature();
        require(!usedNonces[proof.nonce], "Nonce already used");
        
        // 2. Mark nonce as used
        usedNonces[proof.nonce] = true;
        
        // 3. Submit the score
        Duel storage duel = duels[proof.duelId];
        require(duel.status == DuelStatus.Active, "Duel not active");
        require(proof.score <= 10, "Score max is 10");
        require(
            proof.player == duel.playerA || proof.player == duel.playerB,
            "Player not in duel"
        );
        
        if (proof.player == duel.playerA) {
            require(!duel.scoreASubmitted, "Score already submitted");
            duel.scoreA = proof.score;
            duel.scoreASubmitted = true;
        } else {
            require(!duel.scoreBSubmitted, "Score already submitted");
            duel.scoreB = proof.score;
            duel.scoreBSubmitted = true;
        }
        
        emit ScoreSubmitted(proof.duelId, proof.player, proof.score, proof.nonce);
        
        // Resolve if both scores are submitted
        if (duel.scoreASubmitted && duel.scoreBSubmitted) {
            _resolveDuel(proof.duelId);
        }
    }

    // ── Resolve duel ──────────────────────────────────────
    function _resolveDuel(uint256 duelId) internal {
        Duel storage duel = duels[duelId];
        duel.status = DuelStatus.Finished;

        uint256 totalPrize = duel.wager * 2;
        uint256 fee = (totalPrize * protocolFeeBps) / 10000;
        uint256 netPrize = totalPrize - fee;

        // Envoie les frais au treasury
        if (fee > 0 && treasury != address(0)) {
            totalFeesCollected += fee;
            payable(treasury).transfer(fee);
        }

        // ✅ Égalité — remboursement (- frais partagés)
        if (duel.scoreA == duel.scoreB) {
            uint256 refundEach = netPrize / 2;
            payable(duel.playerA).transfer(refundEach);
            payable(duel.playerB).transfer(refundEach);
            emit DuelTie(duelId, refundEach);
            return;
        }

        // ✅ Vainqueur
        address winner = duel.scoreA > duel.scoreB ? duel.playerA : duel.playerB;
        duel.winner = winner;
        payable(winner).transfer(netPrize);

        emit DuelFinished(duelId, winner, netPrize);
    }

    // ── Cancel expired duel ───────────────────────────────
    /**
     * @notice Annule un duel expiré et rembourse playerA
     */
    function cancelExpiredDuel(uint256 duelId) external nonReentrant {
        Duel storage duel = duels[duelId];

        require(duel.status == DuelStatus.Open, "Duel not open");
        require(
            block.timestamp >= duel.expiresAt || msg.sender == duel.playerA,
            "Not expired yet"
        );

        duel.status = DuelStatus.Cancelled;
        payable(duel.playerA).transfer(duel.wager);

        emit DuelCancelled(duelId, duel.playerA);
    }

    // ── Views ─────────────────────────────────────────────
    function getDuel(uint256 duelId) external view returns (Duel memory) {
        return duels[duelId];
    }

    function getPlayerDuels(address player) external view returns (uint256[] memory) {
        return playerDuels[player];
    }

    function getOpenDuels(uint256 limit) external view returns (Duel[] memory) {
        uint256 count = 0;
        for (uint256 i = 1; i <= duelCounter && count < limit; i++) {
            if (duels[i].status == DuelStatus.Open) count++;
        }
        Duel[] memory result = new Duel[](count);
        uint256 idx = 0;
        for (uint256 i = 1; i <= duelCounter && idx < count; i++) {
            if (duels[i].status == DuelStatus.Open) {
                result[idx++] = duels[i];
            }
        }
        return result;
    }

    // ── Admin ─────────────────────────────────────────────
    function setTreasury(address _treasury) external onlyOwner {
        require(_treasury != address(0), "zero address");
        treasury = _treasury;
    }

    function setProtocolFee(uint256 _feeBps) external onlyOwner {
        require(_feeBps <= 2000, "Max 20%");
        protocolFeeBps = _feeBps;
    }

    function setGameSigner(address _signer) external onlyOwner {
        require(_signer != address(0), "Zero address");
        gameSigner = _signer;
    }

    function setVerifiedOnly(bool _enabled) external onlyOwner {
        useVerifiedOnly = _enabled;
    }

    constructor() Ownable(msg.sender) {
        treasury = msg.sender;
    }
}
