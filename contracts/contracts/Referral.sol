// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "./TriviaQToken.sol";

contract Referral is Ownable {

    using ECDSA for bytes32;

    TriviaQToken public trivqToken;

    uint256 public constant REFERRER_REWARD = 500 * 1e18;  // 500 TRIVQ au referrer
    uint256 public constant REFEREE_REWARD  = 250 * 1e18;  // 250 TRIVQ au nouveau

    mapping(address => address) public referredBy;
    mapping(address => uint256) public totalReferrals;
    mapping(address => uint256) public totalEarned;
    mapping(address => bool) public hasBeenReferred;
    
    // NEW: Track pending claims to prevent double-use of signatures
    mapping(bytes32 => bool) public usedSignatures;

    event ReferralRegistered(address indexed referrer, address indexed referee);
    event ReferralRewardPaid(address indexed referrer, address indexed referee, uint256 referrerAmount, uint256 refereeAmount);

    constructor(address _trivqToken) Ownable(msg.sender) {
        trivqToken = TriviaQToken(_trivqToken);
    }

    // ENHANCEMENT: Register with off-chain signature verification
    function registerReferralWithSignature(
        address referrer,
        uint256 nonce,
        uint256 deadline,
        bytes memory signature
    ) external {
        require(referrer != address(0), "Invalid referrer");
        require(referrer != msg.sender, "Cannot refer yourself");
        require(!hasBeenReferred[msg.sender], "Already referred");
        require(block.timestamp <= deadline, "Signature expired");
        
        // Create message hash
        bytes32 messageHash = keccak256(abi.encodePacked(
            msg.sender,
            referrer,
            nonce,
            deadline,
            block.chainid,
            address(this)
        ));
        
        bytes32 ethSignedMessageHash = messageHash.toEthSignedMessageHash();
        address recoveredSigner = ethSignedMessageHash.recover(signature);
        
        // Require the referrer to sign, proving they actually referred this user
        require(recoveredSigner == referrer, "Invalid signature");
        
        bytes32 signatureId = keccak256(abi.encodePacked(msg.sender, nonce));
        require(!usedSignatures[signatureId], "Signature already used");
        usedSignatures[signatureId] = true;
        
        _registerReferral(referrer, msg.sender);
    }
    
    // ENHANCEMENT: Allow setting referrer ahead of time (commit-reveal pattern)
    function setExpectedReferrer(address expectedReferrer) external {
        require(!hasBeenReferred[msg.sender], "Already referred");
        require(expectedReferrer != address(0), "Invalid referrer");
        require(expectedReferrer != msg.sender, "Cannot refer yourself");
        
        // Store the expected referrer (can be overwritten until actual registration)
        referredBy[msg.sender] = expectedReferrer;
    }
    
    function registerReferralWithCommitment() external {
        address referrer = referredBy[msg.sender];
        require(referrer != address(0), "No referrer commitment found");
        require(referrer != msg.sender, "Cannot refer yourself");
        require(!hasBeenReferred[msg.sender], "Already referred");
        
        _registerReferral(referrer, msg.sender);
    }
    
    // Original function but with front-running protection note
    function registerReferral(address referrer) external {
        require(referrer != address(0), "Invalid referrer");
        require(referrer != msg.sender, "Cannot refer yourself");
        require(!hasBeenReferred[msg.sender], "Already referred");
        
        // Note: This function is still vulnerable to front-running
        // Users should use registerReferralWithSignature() or registerReferralWithCommitment()
        _registerReferral(referrer, msg.sender);
    }
    
    // Internal registration logic
    function _registerReferral(address referrer, address referee) internal {
        require(referredBy[referee] == address(0) || referredBy[referee] == referrer, "Referrer mismatch");
        
        referredBy[referee] = referrer;
        hasBeenReferred[referee] = true;
        totalReferrals[referrer]++;

        emit ReferralRegistered(referrer, referee);

        // Mint rewards
        if (trivqToken.rewardsRemaining() >= REFERRER_REWARD + REFEREE_REWARD) {
            trivqToken.mintReward(referrer, REFERRER_REWARD);
            trivqToken.mintReward(referee, REFEREE_REWARD);
            totalEarned[referrer] += REFERRER_REWARD;
            emit ReferralRewardPaid(referrer, referee, REFERRER_REWARD, REFEREE_REWARD);
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
