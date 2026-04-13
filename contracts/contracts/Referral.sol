// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "./TriviaQToken.sol";

contract Referral is Ownable {

    TriviaQToken public trivqToken;

    uint256 public constant REFERRER_REWARD = 500 * 1e18;  // 500 TRIVQ au referrer
    uint256 public constant REFEREE_REWARD  = 250 * 1e18;  // 250 TRIVQ au nouveau

    mapping(address => address) public referredBy;
    mapping(address => uint256) public totalReferrals;
    mapping(address => uint256) public totalEarned;
    mapping(address => bool) public hasBeenReferred;

    event ReferralRegistered(address indexed referrer, address indexed referee);
    event ReferralRewardPaid(address indexed referrer, address indexed referee, uint256 referrerAmount, uint256 refereeAmount);

    constructor(address _trivqToken) Ownable(msg.sender) {
        trivqToken = TriviaQToken(_trivqToken);
    }

    function registerReferral(address referrer) external {
        require(referrer != address(0), "Invalid referrer");
        require(referrer != msg.sender, "Cannot refer yourself");
        require(!hasBeenReferred[msg.sender], "Already referred");
        require(referredBy[msg.sender] == address(0), "Already has referrer");

        referredBy[msg.sender] = referrer;
        hasBeenReferred[msg.sender] = true;
        totalReferrals[referrer]++;

        emit ReferralRegistered(referrer, msg.sender);

        // Mint rewards
        if (trivqToken.rewardsRemaining() >= REFERRER_REWARD + REFEREE_REWARD) {
            trivqToken.mintReward(referrer, REFERRER_REWARD);
            trivqToken.mintReward(msg.sender, REFEREE_REWARD);
            totalEarned[referrer] += REFERRER_REWARD;
            emit ReferralRewardPaid(referrer, msg.sender, REFERRER_REWARD, REFEREE_REWARD);
        }
    }

    function getReferralStats(address user) external view returns (
        uint256 refs,
        uint256 earned,
        bool referred,
        address referrer
    ) {
        return (
            totalReferrals[user],
            totalEarned[user],
            hasBeenReferred[user],
            referredBy[user]
        );
    }

    function setTrivqToken(address _trivqToken) external onlyOwner {
        trivqToken = TriviaQToken(_trivqToken);
    }
}