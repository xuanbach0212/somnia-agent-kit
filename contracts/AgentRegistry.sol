// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import '@openzeppelin/contracts/access/Ownable.sol';
import '@openzeppelin/contracts/utils/ReentrancyGuard.sol';

/**
 * @title AgentRegistry
 * @dev Registry contract for managing AI agents on Somnia Network
 * @notice This contract allows registration, management, and discovery of AI agents
 */
contract AgentRegistry is Ownable, ReentrancyGuard {
  struct Agent {
    string name;
    string description;
    string ipfsMetadata; // IPFS hash for detailed agent configuration
    address owner;
    bool isActive;
    uint256 registeredAt;
    uint256 lastUpdated;
    string[] capabilities; // Agent capabilities/skills
    uint256 executionCount;
  }

  struct AgentMetrics {
    uint256 totalExecutions;
    uint256 successfulExecutions;
    uint256 failedExecutions;
    uint256 averageExecutionTime; // in milliseconds
    uint256 lastExecutionTime;
  }

  // Mapping from agent ID to Agent struct
  mapping(uint256 => Agent) public agents;

  // Mapping from agent ID to AgentMetrics
  mapping(uint256 => AgentMetrics) public agentMetrics;

  // Mapping from owner address to their agent IDs
  mapping(address => uint256[]) public ownerAgents;

  // Counter for agent IDs
  uint256 public agentCounter;

  // Events
  event AgentRegistered(
    uint256 indexed agentId,
    address indexed owner,
    string name,
    uint256 timestamp
  );

  event AgentUpdated(uint256 indexed agentId, string name, uint256 timestamp);

  event AgentDeactivated(uint256 indexed agentId, uint256 timestamp);
  event AgentActivated(uint256 indexed agentId, uint256 timestamp);

  event AgentExecuted(
    uint256 indexed agentId,
    bool success,
    uint256 executionTime,
    uint256 timestamp
  );

  constructor() Ownable(msg.sender) {
    agentCounter = 0;
  }

  /**
   * @dev Register a new AI agent
   * @param _name Name of the agent
   * @param _description Description of the agent
   * @param _ipfsMetadata IPFS hash containing agent metadata
   * @param _capabilities Array of agent capabilities
   */
  function registerAgent(
    string memory _name,
    string memory _description,
    string memory _ipfsMetadata,
    string[] memory _capabilities
  ) external returns (uint256) {
    require(bytes(_name).length > 0, 'Name cannot be empty');
    require(bytes(_ipfsMetadata).length > 0, 'IPFS metadata required');

    agentCounter++;
    uint256 agentId = agentCounter;

    agents[agentId] = Agent({
      name: _name,
      description: _description,
      ipfsMetadata: _ipfsMetadata,
      owner: msg.sender,
      isActive: true,
      registeredAt: block.timestamp,
      lastUpdated: block.timestamp,
      capabilities: _capabilities,
      executionCount: 0
    });

    ownerAgents[msg.sender].push(agentId);

    emit AgentRegistered(agentId, msg.sender, _name, block.timestamp);

    return agentId;
  }

  /**
   * @dev Update agent metadata
   */
  function updateAgent(
    uint256 _agentId,
    string memory _name,
    string memory _description,
    string memory _ipfsMetadata,
    string[] memory _capabilities
  ) external {
    require(_agentId > 0 && _agentId <= agentCounter, 'Invalid agent ID');
    require(agents[_agentId].owner == msg.sender, 'Not agent owner');

    Agent storage agent = agents[_agentId];
    agent.name = _name;
    agent.description = _description;
    agent.ipfsMetadata = _ipfsMetadata;
    agent.capabilities = _capabilities;
    agent.lastUpdated = block.timestamp;

    emit AgentUpdated(_agentId, _name, block.timestamp);
  }

  /**
   * @dev Record agent execution for metrics
   */
  function recordExecution(
    uint256 _agentId,
    bool _success,
    uint256 _executionTime
  ) external {
    require(_agentId > 0 && _agentId <= agentCounter, 'Invalid agent ID');
    require(agents[_agentId].owner == msg.sender, 'Not agent owner');

    agents[_agentId].executionCount++;

    AgentMetrics storage metrics = agentMetrics[_agentId];
    metrics.totalExecutions++;

    if (_success) {
      metrics.successfulExecutions++;
    } else {
      metrics.failedExecutions++;
    }

    // Calculate rolling average execution time
    if (metrics.totalExecutions == 1) {
      metrics.averageExecutionTime = _executionTime;
    } else {
      metrics.averageExecutionTime =
        (metrics.averageExecutionTime * (metrics.totalExecutions - 1) + _executionTime) /
        metrics.totalExecutions;
    }

    metrics.lastExecutionTime = block.timestamp;

    emit AgentExecuted(_agentId, _success, _executionTime, block.timestamp);
  }

  /**
   * @dev Deactivate an agent
   */
  function deactivateAgent(uint256 _agentId) external {
    require(_agentId > 0 && _agentId <= agentCounter, 'Invalid agent ID');
    require(agents[_agentId].owner == msg.sender, 'Not agent owner');

    agents[_agentId].isActive = false;
    emit AgentDeactivated(_agentId, block.timestamp);
  }

  /**
   * @dev Activate an agent
   */
  function activateAgent(uint256 _agentId) external {
    require(_agentId > 0 && _agentId <= agentCounter, 'Invalid agent ID');
    require(agents[_agentId].owner == msg.sender, 'Not agent owner');

    agents[_agentId].isActive = true;
    emit AgentActivated(_agentId, block.timestamp);
  }

  /**
   * @dev Get all agents owned by an address
   */
  function getOwnerAgents(address _owner) external view returns (uint256[] memory) {
    return ownerAgents[_owner];
  }

  /**
   * @dev Get agent capabilities
   */
  function getAgentCapabilities(
    uint256 _agentId
  ) external view returns (string[] memory) {
    require(_agentId > 0 && _agentId <= agentCounter, 'Invalid agent ID');
    return agents[_agentId].capabilities;
  }

  /**
   * @dev Get agent details
   */
  function getAgent(
    uint256 _agentId
  )
    external
    view
    returns (
      string memory name,
      string memory description,
      string memory ipfsMetadata,
      address owner,
      bool isActive,
      uint256 registeredAt,
      uint256 executionCount
    )
  {
    require(_agentId > 0 && _agentId <= agentCounter, 'Invalid agent ID');
    Agent memory agent = agents[_agentId];

    return (
      agent.name,
      agent.description,
      agent.ipfsMetadata,
      agent.owner,
      agent.isActive,
      agent.registeredAt,
      agent.executionCount
    );
  }

  /**
   * @dev Get total number of registered agents
   */
  function getTotalAgents() external view returns (uint256) {
    return agentCounter;
  }
}
