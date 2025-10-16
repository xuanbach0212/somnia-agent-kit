// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "./IAgent.sol";

/**
 * @title BaseAgent
 * @dev Abstract base implementation of IAgent interface
 */
abstract contract BaseAgent is IAgent, Ownable, ReentrancyGuard {
    AgentMetadata private _metadata;
    mapping(bytes32 => bool) private _executedTasks;

    modifier onlyActive() {
        require(_metadata.status == AgentStatus.Active, "Agent is not active");
        _;
    }

    modifier notTerminated() {
        require(_metadata.status != AgentStatus.Terminated, "Agent is terminated");
        _;
    }

    constructor() Ownable(msg.sender) {}

    /**
     * @dev Initialize agent with metadata
     */
    function initialize(
        string memory name,
        string memory description,
        address owner_
    ) external virtual override {
        require(bytes(_metadata.name).length == 0, "Already initialized");
        require(bytes(name).length > 0, "Name cannot be empty");
        require(owner_ != address(0), "Invalid owner address");

        _metadata = AgentMetadata({
            name: name,
            description: description,
            version: "1.0.0",
            owner: owner_,
            status: AgentStatus.Active,
            createdAt: block.timestamp,
            lastExecutedAt: 0
        });

        _transferOwnership(owner_);
    }

    /**
     * @dev Execute agent task
     */
    function execute(bytes memory data)
        external
        payable
        virtual
        override
        onlyActive
        nonReentrant
        returns (bytes memory)
    {
        bytes32 taskId = keccak256(abi.encodePacked(data, block.timestamp, msg.sender));

        require(!_executedTasks[taskId], "Task already executed");
        _executedTasks[taskId] = true;

        _metadata.lastExecutedAt = block.timestamp;

        bytes memory result = _executeInternal(data);

        emit AgentExecuted(address(this), taskId, true);

        return result;
    }

    /**
     * @dev Pause agent execution
     */
    function pause() external virtual override onlyOwner notTerminated {
        require(_metadata.status == AgentStatus.Active, "Agent is not active");

        AgentStatus oldStatus = _metadata.status;
        _metadata.status = AgentStatus.Paused;

        emit AgentStatusChanged(address(this), oldStatus, AgentStatus.Paused);
    }

    /**
     * @dev Resume agent execution
     */
    function resume() external virtual override onlyOwner notTerminated {
        require(_metadata.status == AgentStatus.Paused, "Agent is not paused");

        AgentStatus oldStatus = _metadata.status;
        _metadata.status = AgentStatus.Active;

        emit AgentStatusChanged(address(this), oldStatus, AgentStatus.Active);
    }

    /**
     * @dev Terminate agent permanently
     */
    function terminate() external virtual override onlyOwner {
        require(_metadata.status != AgentStatus.Terminated, "Already terminated");

        AgentStatus oldStatus = _metadata.status;
        _metadata.status = AgentStatus.Terminated;

        emit AgentStatusChanged(address(this), oldStatus, AgentStatus.Terminated);
    }

    /**
     * @dev Get agent metadata
     */
    function getMetadata() external view virtual override returns (AgentMetadata memory) {
        return _metadata;
    }

    /**
     * @dev Get agent status
     */
    function getStatus() external view virtual override returns (AgentStatus) {
        return _metadata.status;
    }

    /**
     * @dev Get agent owner
     */
    function getOwner() external view virtual override returns (address) {
        return _metadata.owner;
    }

    /**
     * @dev Internal execute function to be implemented by derived contracts
     */
    function _executeInternal(bytes memory data) internal virtual returns (bytes memory);

    /**
     * @dev Override transferOwnership to update metadata
     */
    function transferOwnership(address newOwner) public virtual override onlyOwner {
        require(newOwner != address(0), "Invalid new owner");

        address oldOwner = _metadata.owner;
        _metadata.owner = newOwner;

        super.transferOwnership(newOwner);

        emit AgentOwnershipTransferred(address(this), oldOwner, newOwner);
    }
}
