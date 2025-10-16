// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title AgentVault
 * @dev Manages funds and resources for AI agents
 */
contract AgentVault is Ownable, ReentrancyGuard {
    using SafeERC20 for IERC20;

    // Vault structure for each agent
    struct Vault {
        uint256 nativeBalance;
        mapping(address => uint256) tokenBalances;
        address[] allowedTokens;
        uint256 dailyLimit;
        uint256 dailySpent;
        uint256 lastResetTime;
        bool isActive;
    }

    // Agent vaults
    mapping(address => Vault) private vaults;
    mapping(address => bool) public registeredAgents;

    // Global settings
    uint256 public constant MIN_DAILY_LIMIT = 0.01 ether;
    uint256 public constant MAX_DAILY_LIMIT = 100 ether;

    // Events
    event VaultCreated(address indexed agent, uint256 dailyLimit);
    event VaultDeactivated(address indexed agent);
    event VaultActivated(address indexed agent);
    event NativeDeposit(address indexed agent, address indexed depositor, uint256 amount);
    event TokenDeposit(address indexed agent, address indexed token, address indexed depositor, uint256 amount);
    event NativeWithdraw(address indexed agent, address indexed recipient, uint256 amount);
    event TokenWithdraw(address indexed agent, address indexed token, address indexed recipient, uint256 amount);
    event DailyLimitUpdated(address indexed agent, uint256 oldLimit, uint256 newLimit);
    event TokenAllowed(address indexed agent, address indexed token);
    event TokenDisallowed(address indexed agent, address indexed token);

    constructor() Ownable(msg.sender) {}

    /**
     * @dev Create vault for an agent
     */
    function createVault(address agent, uint256 dailyLimit) external onlyOwner {
        require(agent != address(0), "Invalid agent address");
        require(!registeredAgents[agent], "Vault already exists");
        require(dailyLimit >= MIN_DAILY_LIMIT && dailyLimit <= MAX_DAILY_LIMIT, "Invalid daily limit");

        registeredAgents[agent] = true;
        Vault storage vault = vaults[agent];
        vault.dailyLimit = dailyLimit;
        vault.lastResetTime = block.timestamp;
        vault.isActive = true;

        emit VaultCreated(agent, dailyLimit);
    }

    /**
     * @dev Deposit native tokens to agent vault
     */
    function depositNative(address agent) external payable nonReentrant {
        require(registeredAgents[agent], "Vault does not exist");
        require(msg.value > 0, "Invalid deposit amount");

        vaults[agent].nativeBalance += msg.value;

        emit NativeDeposit(agent, msg.sender, msg.value);
    }

    /**
     * @dev Deposit ERC20 tokens to agent vault
     */
    function depositToken(
        address agent,
        address token,
        uint256 amount
    ) external nonReentrant {
        require(registeredAgents[agent], "Vault does not exist");
        require(token != address(0), "Invalid token address");
        require(amount > 0, "Invalid deposit amount");

        Vault storage vault = vaults[agent];
        require(_isTokenAllowed(vault, token), "Token not allowed");

        IERC20(token).safeTransferFrom(msg.sender, address(this), amount);
        vault.tokenBalances[token] += amount;

        emit TokenDeposit(agent, token, msg.sender, amount);
    }

    /**
     * @dev Withdraw native tokens from vault
     */
    function withdrawNative(
        address agent,
        address payable recipient,
        uint256 amount
    ) external nonReentrant {
        require(registeredAgents[agent], "Vault does not exist");
        require(msg.sender == agent || msg.sender == owner(), "Unauthorized");

        Vault storage vault = vaults[agent];
        require(vault.isActive, "Vault is not active");
        require(vault.nativeBalance >= amount, "Insufficient balance");

        _checkAndUpdateDailyLimit(vault, amount);

        vault.nativeBalance -= amount;
        (bool success, ) = recipient.call{value: amount}("");
        require(success, "Transfer failed");

        emit NativeWithdraw(agent, recipient, amount);
    }

    /**
     * @dev Withdraw ERC20 tokens from vault
     */
    function withdrawToken(
        address agent,
        address token,
        address recipient,
        uint256 amount
    ) external nonReentrant {
        require(registeredAgents[agent], "Vault does not exist");
        require(msg.sender == agent || msg.sender == owner(), "Unauthorized");

        Vault storage vault = vaults[agent];
        require(vault.isActive, "Vault is not active");
        require(vault.tokenBalances[token] >= amount, "Insufficient token balance");

        vault.tokenBalances[token] -= amount;
        IERC20(token).safeTransfer(recipient, amount);

        emit TokenWithdraw(agent, token, recipient, amount);
    }

    /**
     * @dev Allow token for agent vault
     */
    function allowToken(address agent, address token) external onlyOwner {
        require(registeredAgents[agent], "Vault does not exist");
        require(token != address(0), "Invalid token address");

        Vault storage vault = vaults[agent];
        require(!_isTokenAllowed(vault, token), "Token already allowed");

        vault.allowedTokens.push(token);

        emit TokenAllowed(agent, token);
    }

    /**
     * @dev Disallow token for agent vault
     */
    function disallowToken(address agent, address token) external onlyOwner {
        require(registeredAgents[agent], "Vault does not exist");

        Vault storage vault = vaults[agent];
        address[] storage allowedTokens = vault.allowedTokens;

        for (uint256 i = 0; i < allowedTokens.length; i++) {
            if (allowedTokens[i] == token) {
                allowedTokens[i] = allowedTokens[allowedTokens.length - 1];
                allowedTokens.pop();

                emit TokenDisallowed(agent, token);
                return;
            }
        }

        revert("Token not found");
    }

    /**
     * @dev Update daily limit for agent vault
     */
    function updateDailyLimit(address agent, uint256 newLimit) external onlyOwner {
        require(registeredAgents[agent], "Vault does not exist");
        require(newLimit >= MIN_DAILY_LIMIT && newLimit <= MAX_DAILY_LIMIT, "Invalid daily limit");

        Vault storage vault = vaults[agent];
        uint256 oldLimit = vault.dailyLimit;
        vault.dailyLimit = newLimit;

        emit DailyLimitUpdated(agent, oldLimit, newLimit);
    }

    /**
     * @dev Activate vault
     */
    function activateVault(address agent) external onlyOwner {
        require(registeredAgents[agent], "Vault does not exist");
        require(!vaults[agent].isActive, "Vault already active");

        vaults[agent].isActive = true;

        emit VaultActivated(agent);
    }

    /**
     * @dev Deactivate vault
     */
    function deactivateVault(address agent) external onlyOwner {
        require(registeredAgents[agent], "Vault does not exist");
        require(vaults[agent].isActive, "Vault already inactive");

        vaults[agent].isActive = false;

        emit VaultDeactivated(agent);
    }

    /**
     * @dev Get vault native balance
     */
    function getNativeBalance(address agent) external view returns (uint256) {
        require(registeredAgents[agent], "Vault does not exist");
        return vaults[agent].nativeBalance;
    }

    /**
     * @dev Get vault token balance
     */
    function getTokenBalance(address agent, address token) external view returns (uint256) {
        require(registeredAgents[agent], "Vault does not exist");
        return vaults[agent].tokenBalances[token];
    }

    /**
     * @dev Get vault allowed tokens
     */
    function getAllowedTokens(address agent) external view returns (address[] memory) {
        require(registeredAgents[agent], "Vault does not exist");
        return vaults[agent].allowedTokens;
    }

    /**
     * @dev Get vault daily limit info
     */
    function getDailyLimitInfo(address agent)
        external
        view
        returns (
            uint256 limit,
            uint256 spent,
            uint256 remaining,
            uint256 resetTime
        )
    {
        require(registeredAgents[agent], "Vault does not exist");

        Vault storage vault = vaults[agent];
        limit = vault.dailyLimit;
        spent = vault.dailySpent;
        remaining = vault.dailyLimit > vault.dailySpent ? vault.dailyLimit - vault.dailySpent : 0;
        resetTime = vault.lastResetTime + 1 days;
    }

    /**
     * @dev Check if vault is active
     */
    function isVaultActive(address agent) external view returns (bool) {
        require(registeredAgents[agent], "Vault does not exist");
        return vaults[agent].isActive;
    }

    /**
     * @dev Internal: Check if token is allowed
     */
    function _isTokenAllowed(Vault storage vault, address token) internal view returns (bool) {
        address[] memory allowedTokens = vault.allowedTokens;
        for (uint256 i = 0; i < allowedTokens.length; i++) {
            if (allowedTokens[i] == token) {
                return true;
            }
        }
        return false;
    }

    /**
     * @dev Internal: Check and update daily limit
     */
    function _checkAndUpdateDailyLimit(Vault storage vault, uint256 amount) internal {
        // Reset daily spent if 24 hours have passed
        if (block.timestamp >= vault.lastResetTime + 1 days) {
            vault.dailySpent = 0;
            vault.lastResetTime = block.timestamp;
        }

        require(vault.dailySpent + amount <= vault.dailyLimit, "Daily limit exceeded");
        vault.dailySpent += amount;
    }

    receive() external payable {}
}
