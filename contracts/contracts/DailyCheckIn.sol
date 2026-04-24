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
    uint256 public constant STREAK_FREEZE_DURATION = 7 days; // Max freeze period
    uint256 public constant FREEZE_COOLDOWN = 7 days; // How often can freeze

    struct PlayerData {
        uint256 lastCheckIn;
        uint256 streak;
        uint256 totalCheckIns;
        bool weekBadgeMinted;
        uint256 freezeEndTime; 
        uint256 lastFreezeTime;
    }

    mapping(address => PlayerData) public players;
    mapping(uint256 => string) private _tokenURIs;
    mapping(uint256 => uint256[]) public categoryTokens;
    mapping(uint256 => uint256) public categoryMintIndex;
    mapping(address => uint256) public freezeCount;

    event CheckedIn(address indexed player, uint256 streak, uint256 reward);
    event WeekBonusClaimed(address indexed player, uint256 bonus);
    event BadgeMinted(address indexed player, uint256 tokenId, uint256 categoryId);
    event StreakFrozen(address indexed player, uint256 freezeUntil);
    event StreakRestored(address indexed player, uint256 recoveredStreak);

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

        bool isFrozen = now_ < p.freezeEndTime;
        bool isLate = p.lastCheckIn > 0 && now_ > p.lastCheckIn + (COOLDOWN * 2);

        if (isLate && !isFrozen) {
            p.streak = 0;  // Only reset if NOT frozen
        } else if (isLate && isFrozen) {
            // Streak protected by freeze, just update lastCheckIn without penalty
            p.lastCheckIn = now_;
            p.totalCheckIns += 1;
            // Mint badge but NO daily reward? Or reduced reward?
            _mintCategoryBadge(msg.sender, categoryId);
            emit CheckedIn(msg.sender, p.streak, 0); // No reward during freeze
            return;
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
    function freezeStreak(uint256 daysToFreeze) external nonReentrant {
        require(daysToFreeze > 0 && daysToFreeze <= 7, "Freeze 1-7 days max");
    
        PlayerData storage p = players[msg.sender];
        uint256 now_ = block.timestamp;
    
        // Can only freeze if not already frozen
        require(p.freezeEndTime <= now_, "Already frozen");
    
        // Cooldown between freezes
        require(now_ >= p.lastFreezeTime + FREEZE_COOLDOWN, "Freeze cooldown active");
    
        // Max 3 freezes total per player (anti-abuse)
        require(freezeCount[msg.sender] < 3, "Max freezes used");
    
        uint256 freezeUntil = now_ + (daysToFreeze * 1 days);
        p.freezeEndTime = freezeUntil;
        p.lastFreezeTime = now_;
        freezeCount[msg.sender]++;
    
        emit StreakFrozen(msg.sender, freezeUntil);
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
