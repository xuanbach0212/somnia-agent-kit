// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title IAgent
 * @dev Interface for AI Agent contracts on Somnia Network
 */
interface IAgent {
    // Agent status enum
    enum AgentStatus {
        Inactive,
        Active,
        Paused,
        Terminated
    }

    // Agent metadata structure
    struct AgentMetadata {
        string name;
        string description;
        string version;
        address owner;
        AgentStatus status;
        uint256 createdAt;
        uint256 lastExecutedAt;
    }

    // Events
    event AgentStatusChanged(address indexed agent, AgentStatus oldStatus, AgentStatus newStatus);
    event AgentExecuted(address indexed agent, bytes32 indexed taskId, bool success);
    event AgentOwnershipTransferred(address indexed agent, address indexed previousOwner, address indexed newOwner);

    // Core functions
    function initialize(
        string memory name,
        string memory description,
        address owner
    ) external;

    function execute(bytes memory data) external payable returns (bytes memory);

    function pause() external;

    function resume() external;

    function terminate() external;

    // View functions
    function getMetadata() external view returns (AgentMetadata memory);

    function getStatus() external view returns (AgentStatus);

    function getOwner() external view returns (address);
}
