// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract TriviaQToken is ERC20, Ownable {

    uint256 public constant REWARDS_ALLOC   = 500_000_000 * 1e18;
    uint256 public constant LIQUIDITY_ALLOC = 200_000_000 * 1e18;
    uint256 public constant TEAM_ALLOC      = 150_000_000 * 1e18;
    uint256 public constant ECOSYSTEM_ALLOC = 100_000_000 * 1e18;
    uint256 public constant MARKETING_ALLOC =  50_000_000 * 1e18;

    // ── Multi-minters ─────────────────────────────────────
    mapping(address => bool) public minters;
    uint256 public rewardsMinted;

    event MinterAdded(address indexed minter);
    event MinterRemoved(address indexed minter);
    event RewardMinted(address indexed player, uint256 amount);

    modifier onlyMinter() {
        require(minters[msg.sender], "TRIVQ: not minter");
        _;
    }

    constructor(
        address liquidityWallet,
        address teamWallet,
        address ecosystemWallet,
        address marketingWallet
    ) ERC20("TriviaQ Token", "TRIVQ") Ownable(msg.sender) {
        _mint(liquidityWallet,  LIQUIDITY_ALLOC);
        _mint(teamWallet,       TEAM_ALLOC);
        _mint(ecosystemWallet,  ECOSYSTEM_ALLOC);
        _mint(marketingWallet,  MARKETING_ALLOC);
    }

    // ── Owner: gérer les minters ──────────────────────────
    function addMinter(address _minter) external onlyOwner {
        require(_minter != address(0), "TRIVQ: zero address");
        minters[_minter] = true;
        emit MinterAdded(_minter);
    }

    function removeMinter(address _minter) external onlyOwner {
        minters[_minter] = false;
        emit MinterRemoved(_minter);
    }

    // Compatibilité avec l'ancien setMinter
    function setMinter(address _minter) external onlyOwner {
        require(_minter != address(0), "TRIVQ: zero address");
        minters[_minter] = true;
        emit MinterAdded(_minter);
    }

    function isMinter(address _minter) external view returns (bool) {
        return minters[_minter];
    }

    function mintReward(address player, uint256 amount) external onlyMinter {
        require(rewardsMinted + amount <= REWARDS_ALLOC, "TRIVQ: cap reached");
        rewardsMinted += amount;
        _mint(player, amount);
        emit RewardMinted(player, amount);
    }

    function rewardsRemaining() external view returns (uint256) {
        return REWARDS_ALLOC - rewardsMinted;
    }
}