// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "./IAgent.sol";

/**
 * @title AgentExecutor
 * @dev Manages agent task execution with authorization and resource control
 */
contract AgentExecutor is AccessControl, ReentrancyGuard {
    bytes32 public constant EXECUTOR_ROLE = keccak256("EXECUTOR_ROLE");
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");

    // Execution context
    struct ExecutionContext {
        address agent;
        bytes32 taskId;
        address requester;
        uint256 gasLimit;
        uint256 value;
        uint256 timestamp;
        ExecutionStatus status;
        bytes result;
    }

    enum ExecutionStatus {
        Pending,
        Success,
        Failed,
        Reverted
    }

    // Storage
    mapping(bytes32 => ExecutionContext) public executions;
    mapping(address => uint256) public agentExecutionCount;
    mapping(address => bool) public authorizedAgents;

    uint256 public maxGasLimit = 5_000_000;
    uint256 public executionFee = 0.001 ether;

    // Events
    event ExecutionQueued(bytes32 indexed taskId, address indexed agent, address indexed requester);
    event ExecutionCompleted(bytes32 indexed taskId, ExecutionStatus status, bytes result);
    event AgentAuthorized(address indexed agent, address indexed authorizer);
    event AgentRevoked(address indexed agent, address indexed revoker);
    event FeeUpdated(uint256 oldFee, uint256 newFee);

    constructor() {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(ADMIN_ROLE, msg.sender);
        _grantRole(EXECUTOR_ROLE, msg.sender);
    }

    /**
     * @dev Authorize an agent for execution
     */
    function authorizeAgent(address agent) external onlyRole(ADMIN_ROLE) {
        require(agent != address(0), "Invalid agent address");
        require(!authorizedAgents[agent], "Agent already authorized");

        authorizedAgents[agent] = true;
        emit AgentAuthorized(agent, msg.sender);
    }

    /**
     * @dev Revoke agent authorization
     */
    function revokeAgent(address agent) external onlyRole(ADMIN_ROLE) {
        require(authorizedAgents[agent], "Agent not authorized");

        authorizedAgents[agent] = false;
        emit AgentRevoked(agent, msg.sender);
    }

    /**
     * @dev Execute agent task
     */
    function executeTask(
        address agent,
        bytes memory data,
        uint256 gasLimit
    ) external payable nonReentrant returns (bytes32 taskId) {
        require(authorizedAgents[agent], "Agent not authorized");
        require(msg.value >= executionFee, "Insufficient execution fee");
        require(gasLimit <= maxGasLimit, "Gas limit too high");

        // Generate task ID
        taskId = keccak256(
            abi.encodePacked(
                agent,
                msg.sender,
                data,
                block.timestamp,
                agentExecutionCount[agent]
            )
        );

        // Create execution context
        executions[taskId] = ExecutionContext({
            agent: agent,
            taskId: taskId,
            requester: msg.sender,
            gasLimit: gasLimit,
            value: msg.value - executionFee,
            timestamp: block.timestamp,
            status: ExecutionStatus.Pending,
            result: ""
        });

        emit ExecutionQueued(taskId, agent, msg.sender);

        // Execute immediately
        _executeTask(taskId, data);

        return taskId;
    }

    /**
     * @dev Internal execution function
     */
    function _executeTask(bytes32 taskId, bytes memory data) internal {
        ExecutionContext storage ctx = executions[taskId];

        try IAgent(ctx.agent).execute{value: ctx.value, gas: ctx.gasLimit}(data) returns (
            bytes memory result
        ) {
            ctx.status = ExecutionStatus.Success;
            ctx.result = result;
            agentExecutionCount[ctx.agent]++;

            emit ExecutionCompleted(taskId, ExecutionStatus.Success, result);
        } catch Error(string memory reason) {
            ctx.status = ExecutionStatus.Failed;
            ctx.result = bytes(reason);

            emit ExecutionCompleted(taskId, ExecutionStatus.Failed, bytes(reason));
        } catch (bytes memory lowLevelData) {
            ctx.status = ExecutionStatus.Reverted;
            ctx.result = lowLevelData;

            emit ExecutionCompleted(taskId, ExecutionStatus.Reverted, lowLevelData);
        }
    }

    /**
     * @dev Get execution details
     */
    function getExecution(bytes32 taskId) external view returns (ExecutionContext memory) {
        return executions[taskId];
    }

    /**
     * @dev Get agent execution count
     */
    function getAgentExecutionCount(address agent) external view returns (uint256) {
        return agentExecutionCount[agent];
    }

    /**
     * @dev Update execution fee
     */
    function setExecutionFee(uint256 newFee) external onlyRole(ADMIN_ROLE) {
        uint256 oldFee = executionFee;
        executionFee = newFee;

        emit FeeUpdated(oldFee, newFee);
    }

    /**
     * @dev Update max gas limit
     */
    function setMaxGasLimit(uint256 newLimit) external onlyRole(ADMIN_ROLE) {
        require(newLimit > 0, "Invalid gas limit");
        maxGasLimit = newLimit;
    }

    /**
     * @dev Withdraw collected fees
     */
    function withdrawFees(address payable recipient) external onlyRole(ADMIN_ROLE) {
        require(recipient != address(0), "Invalid recipient");
        uint256 balance = address(this).balance;
        require(balance > 0, "No fees to withdraw");

        (bool success, ) = recipient.call{value: balance}("");
        require(success, "Transfer failed");
    }

    /**
     * @dev Check if agent is authorized
     */
    function isAgentAuthorized(address agent) external view returns (bool) {
        return authorizedAgents[agent];
    }

    receive() external payable {}
}
