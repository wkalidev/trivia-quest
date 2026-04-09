// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "./TriviaQToken.sol";

contract DailyCheckIn is ERC1155, Ownable, ReentrancyGuard {

    TriviaQToken public trivqToken;

    uint256 public constant DAILY_REWARD = 100 * 1e18;
    uint256 public constant WEEK_BONUS   = 2000 * 1e18;
    uint256 public constant COOLDOWN     = 24 hours;

    struct PlayerData {
        uint256 lastCheckIn;
        uint256 streak;
        uint256 totalCheckIns;
        bool weekBadgeMinted;
    }

    mapping(address => PlayerData) public players;
    mapping(uint256 => string) private _tokenURIs;
    mapping(uint256 => uint256[]) public categoryTokens;
    mapping(uint256 => uint256) public categoryMintIndex;

    event CheckedIn(address indexed player, uint256 streak, uint256 reward);
    event WeekBonusClaimed(address indexed player, uint256 bonus);
    event BadgeMinted(address indexed player, uint256 tokenId, uint256 categoryId);

    constructor(address _trivqToken) ERC1155("") Ownable(msg.sender) {
        trivqToken = TriviaQToken(_trivqToken);
    }

    // ── Owner ─────────────────────────────────────────────

    function setTokenURI(uint256 tokenId, string calldata tokenUri) external onlyOwner {
        _tokenURIs[tokenId] = tokenUri;
    }

    function setBatchTokenURIs(
        uint256[] calldata tokenIds,
        string[] calldata tokenUris
    ) external onlyOwner {
        require(tokenIds.length == tokenUris.length, "Length mismatch");
        for (uint256 i = 0; i < tokenIds.length; i++) {
            _tokenURIs[tokenIds[i]] = tokenUris[i];
        }
    }

    function setCategoryTokens(
        uint256 categoryId,
        uint256[] calldata tokenIds
    ) external onlyOwner {
        categoryTokens[categoryId] = tokenIds;
        categoryMintIndex[categoryId] = 0;
    }

    // ── URI ───────────────────────────────────────────────

    function uri(uint256 tokenId) public view override returns (string memory) {
        return _tokenURIs[tokenId];
    }

    // ── Check-in ──────────────────────────────────────────

    function checkIn(uint256 categoryId) external nonReentrant {
        require(categoryId >= 1 && categoryId <= 6, "Invalid category");

        PlayerData storage p = players[msg.sender];
        uint256 now_ = block.timestamp;

        require(now_ >= p.lastCheckIn + COOLDOWN, "Already checked in today");

        // Reset streak si plus de 48h sans check-in
        if (p.lastCheckIn > 0 && now_ > p.lastCheckIn + (COOLDOWN * 2)) {
            p.streak = 0;
        }

        p.lastCheckIn = now_;
        p.streak += 1;
        p.totalCheckIns += 1;

        uint256 totalReward = DAILY_REWARD;

        // Bonus jour 7
        if (p.streak == 7 && !p.weekBadgeMinted) {
            totalReward += WEEK_BONUS;
            p.weekBadgeMinted = true;
            emit WeekBonusClaimed(msg.sender, WEEK_BONUS);
        }

        // Permet de re-gagner le bonus à chaque cycle de 7
        if (p.streak > 7) {
            p.weekBadgeMinted = false;
        }

        // Mint TRIVQ
        if (trivqToken.rewardsRemaining() >= totalReward) {
            trivqToken.mintReward(msg.sender, totalReward);
        }

        // Mint badge NFT
        _mintCategoryBadge(msg.sender, categoryId);

        emit CheckedIn(msg.sender, p.streak, totalReward);
    }

    // ── Internal ──────────────────────────────────────────

    function _mintCategoryBadge(address player, uint256 categoryId) internal {
        uint256[] storage tokens = categoryTokens[categoryId];
        if (tokens.length == 0) return;

        uint256 idx = categoryMintIndex[categoryId] % tokens.length;
        uint256 tokenId = tokens[idx];
        categoryMintIndex[categoryId]++;

        _mint(player, tokenId, 1, "");
        emit BadgeMinted(player, tokenId, categoryId);
    }

    // ── Views ─────────────────────────────────────────────

    function getPlayerData(address player) external view returns (
        uint256 lastCheckIn,
        uint256 streak,
        uint256 totalCheckIns,
        bool checkInAvailable,
        uint256 secondsUntilNext
    ) {
        PlayerData storage p = players[player];
        uint256 next = p.lastCheckIn + COOLDOWN;
        bool available = block.timestamp >= next;
        return (
            p.lastCheckIn,
            p.streak,
            p.totalCheckIns,
            available,
            available ? 0 : next - block.timestamp
        );
    }

    function getStreak(address player) external view returns (uint256) {
        return players[player].streak;
    }

    function isCheckInAvailable(address player) external view returns (bool) {
        return block.timestamp >= players[player].lastCheckIn + COOLDOWN;
    }
}