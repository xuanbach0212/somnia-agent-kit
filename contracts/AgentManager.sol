// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import '@openzeppelin/contracts/access/Ownable.sol';
import '@openzeppelin/contracts/utils/ReentrancyGuard.sol';

/**
 * @title AgentManager
 * @dev Contract for managing agent execution and orchestration on Somnia
 * @notice Handles agent task queue, execution tracking, and payment
 */
contract AgentManager is Ownable, ReentrancyGuard {
  struct Task {
    uint256 taskId;
    uint256 agentId;
    address requester;
    string taskData; // IPFS hash or task description
    uint256 reward;
    TaskStatus status;
    uint256 createdAt;
    uint256 completedAt;
    string result; // IPFS hash of result
  }

  enum TaskStatus {
    Pending,
    InProgress,
    Completed,
    Failed,
    Cancelled
  }

  // Mapping from task ID to Task
  mapping(uint256 => Task) public tasks;

  // Task counter
  uint256 public taskCounter;

  // Agent registry contract address
  address public agentRegistryAddress;

  // Platform fee percentage (in basis points, e.g., 250 = 2.5%)
  uint256 public platformFee = 250;

  // Accumulated platform fees
  uint256 public accumulatedFees;

  // Events
  event TaskCreated(
    uint256 indexed taskId,
    uint256 indexed agentId,
    address indexed requester,
    uint256 reward,
    uint256 timestamp
  );

  event TaskStarted(uint256 indexed taskId, uint256 timestamp);

  event TaskCompleted(uint256 indexed taskId, string result, uint256 timestamp);

  event TaskFailed(uint256 indexed taskId, uint256 timestamp);
  event TaskCancelled(uint256 indexed taskId, uint256 timestamp);

  event PlatformFeeUpdated(uint256 newFee, uint256 timestamp);

  constructor() Ownable(msg.sender) {
    taskCounter = 0;
  }

  /**
   * @dev Set the agent registry contract address
   */
  function setAgentRegistry(address _agentRegistryAddress) external onlyOwner {
    require(_agentRegistryAddress != address(0), 'Invalid address');
    agentRegistryAddress = _agentRegistryAddress;
  }

  /**
   * @dev Create a new task for an agent
   */
  function createTask(
    uint256 _agentId,
    string memory _taskData
  ) external payable returns (uint256) {
    require(msg.value > 0, 'Reward must be greater than 0');
    require(bytes(_taskData).length > 0, 'Task data cannot be empty');

    taskCounter++;
    uint256 taskId = taskCounter;

    tasks[taskId] = Task({
      taskId: taskId,
      agentId: _agentId,
      requester: msg.sender,
      taskData: _taskData,
      reward: msg.value,
      status: TaskStatus.Pending,
      createdAt: block.timestamp,
      completedAt: 0,
      result: ''
    });

    emit TaskCreated(taskId, _agentId, msg.sender, msg.value, block.timestamp);

    return taskId;
  }

  /**
   * @dev Start task execution (called by agent owner)
   */
  function startTask(uint256 _taskId) external {
    require(_taskId > 0 && _taskId <= taskCounter, 'Invalid task ID');
    Task storage task = tasks[_taskId];
    require(task.status == TaskStatus.Pending, 'Task not pending');

    task.status = TaskStatus.InProgress;

    emit TaskStarted(_taskId, block.timestamp);
  }

  /**
   * @dev Complete a task and release payment
   */
  function completeTask(uint256 _taskId, string memory _result) external nonReentrant {
    require(_taskId > 0 && _taskId <= taskCounter, 'Invalid task ID');
    Task storage task = tasks[_taskId];
    require(
      task.status == TaskStatus.InProgress || task.status == TaskStatus.Pending,
      'Task not in progress'
    );

    task.status = TaskStatus.Completed;
    task.completedAt = block.timestamp;
    task.result = _result;

    // Calculate platform fee
    uint256 fee = (task.reward * platformFee) / 10000;
    uint256 agentPayment = task.reward - fee;

    accumulatedFees += fee;

    // Transfer payment to agent executor (msg.sender)
    (bool success, ) = payable(msg.sender).call{value: agentPayment}('');
    require(success, 'Payment transfer failed');

    emit TaskCompleted(_taskId, _result, block.timestamp);
  }

  /**
   * @dev Mark task as failed
   */
  function failTask(uint256 _taskId) external nonReentrant {
    require(_taskId > 0 && _taskId <= taskCounter, 'Invalid task ID');
    Task storage task = tasks[_taskId];
    require(task.status == TaskStatus.InProgress, 'Task not in progress');

    task.status = TaskStatus.Failed;

    // Refund the requester
    (bool success, ) = payable(task.requester).call{value: task.reward}('');
    require(success, 'Refund transfer failed');

    emit TaskFailed(_taskId, block.timestamp);
  }

  /**
   * @dev Cancel a pending task
   */
  function cancelTask(uint256 _taskId) external nonReentrant {
    require(_taskId > 0 && _taskId <= taskCounter, 'Invalid task ID');
    Task storage task = tasks[_taskId];
    require(task.requester == msg.sender, 'Not task requester');
    require(task.status == TaskStatus.Pending, 'Task already started');

    task.status = TaskStatus.Cancelled;

    // Refund the requester
    (bool success, ) = payable(task.requester).call{value: task.reward}('');
    require(success, 'Refund transfer failed');

    emit TaskCancelled(_taskId, block.timestamp);
  }

  /**
   * @dev Update platform fee (only owner)
   */
  function updatePlatformFee(uint256 _newFee) external onlyOwner {
    require(_newFee <= 1000, 'Fee cannot exceed 10%');
    platformFee = _newFee;
    emit PlatformFeeUpdated(_newFee, block.timestamp);
  }

  /**
   * @dev Withdraw accumulated platform fees (only owner)
   */
  function withdrawFees() external onlyOwner nonReentrant {
    require(accumulatedFees > 0, 'No fees to withdraw');

    uint256 amount = accumulatedFees;
    accumulatedFees = 0;

    (bool success, ) = payable(owner()).call{value: amount}('');
    require(success, 'Withdrawal failed');
  }

  /**
   * @dev Get task details
   */
  function getTask(
    uint256 _taskId
  )
    external
    view
    returns (
      uint256 agentId,
      address requester,
      string memory taskData,
      uint256 reward,
      TaskStatus status,
      uint256 createdAt,
      string memory result
    )
  {
    require(_taskId > 0 && _taskId <= taskCounter, 'Invalid task ID');
    Task memory task = tasks[_taskId];

    return (
      task.agentId,
      task.requester,
      task.taskData,
      task.reward,
      task.status,
      task.createdAt,
      task.result
    );
  }

  /**
   * @dev Get total number of tasks
   */
  function getTotalTasks() external view returns (uint256) {
    return taskCounter;
  }
}
