import { SignerWithAddress } from '@nomicfoundation/hardhat-ethers/signers';
import { expect } from 'chai';
import { ethers } from 'hardhat';
import { AgentManager, AgentRegistry } from '../typechain-types';

describe('AgentManager', function () {
  let agentManager: AgentManager;
  let agentRegistry: AgentRegistry;
  let owner: SignerWithAddress;
  let agent: SignerWithAddress;
  let requester: SignerWithAddress;
  let executor: SignerWithAddress;

  beforeEach(async function () {
    [owner, agent, requester, executor] = await ethers.getSigners();

    // Deploy AgentRegistry first
    const AgentRegistry = await ethers.getContractFactory('AgentRegistry');
    agentRegistry = await AgentRegistry.deploy();
    await agentRegistry.waitForDeployment();

    // Deploy AgentManager
    const AgentManager = await ethers.getContractFactory('AgentManager');
    agentManager = await AgentManager.deploy();
    await agentManager.waitForDeployment();

    // Set registry address
    await agentManager.connect(owner).setAgentRegistry(await agentRegistry.getAddress());

    // Register an agent for testing
    await agentRegistry
      .connect(agent)
      .registerAgent('TestAgent', 'Test Description', 'QmTestHash', ['cap1']);
  });

  describe('Deployment', function () {
    it('Should set the right owner', async function () {
      expect(await agentManager.owner()).to.equal(owner.address);
    });

    it('Should initialize task counter to 0', async function () {
      expect(await agentManager.taskCounter()).to.equal(0);
    });

    it('Should set platform fee to default 2.5%', async function () {
      expect(await agentManager.platformFee()).to.equal(250); // 250 basis points = 2.5%
    });
  });

  describe('Agent Registry Setup', function () {
    it('Should set agent registry address', async function () {
      const registryAddress = await agentRegistry.getAddress();
      expect(await agentManager.agentRegistryAddress()).to.equal(registryAddress);
    });

    it('Should fail setting registry with zero address', async function () {
      await expect(
        agentManager.connect(owner).setAgentRegistry(ethers.ZeroAddress)
      ).to.be.revertedWith('Invalid address');
    });

    it('Should fail setting registry from non-owner', async function () {
      await expect(agentManager.connect(requester).setAgentRegistry(agent.address)).to.be
        .reverted;
    });
  });

  describe('Task Creation', function () {
    it('Should create task successfully', async function () {
      const reward = ethers.parseEther('0.1');
      const taskData = 'Task data or IPFS hash';

      const tx = await agentManager
        .connect(requester)
        .createTask(1, taskData, { value: reward });

      await expect(tx)
        .to.emit(agentManager, 'TaskCreated')
        .withArgs(1, 1, requester.address, reward);

      expect(await agentManager.taskCounter()).to.equal(1);
    });

    it('Should create task with correct details', async function () {
      const reward = ethers.parseEther('0.5');
      const taskData = 'QmTaskDataHash';

      await agentManager.connect(requester).createTask(1, taskData, { value: reward });

      const task = await agentManager.getTask(1);

      expect(task.agentId).to.equal(1);
      expect(task.requester).to.equal(requester.address);
      expect(task.taskData).to.equal(taskData);
      expect(task.reward).to.equal(reward);
      expect(task.status).to.equal(0); // Pending
      expect(task.result).to.equal('');
    });

    it('Should fail task creation with zero reward', async function () {
      await expect(
        agentManager.connect(requester).createTask(1, 'Task data')
      ).to.be.revertedWith('Reward must be greater than 0');
    });

    it('Should fail task creation with empty data', async function () {
      await expect(
        agentManager
          .connect(requester)
          .createTask(1, '', { value: ethers.parseEther('0.1') })
      ).to.be.revertedWith('Task data cannot be empty');
    });

    it('Should increment task counter correctly', async function () {
      const reward = ethers.parseEther('0.1');

      await agentManager.connect(requester).createTask(1, 'Task 1', { value: reward });
      expect(await agentManager.taskCounter()).to.equal(1);

      await agentManager.connect(requester).createTask(1, 'Task 2', { value: reward });
      expect(await agentManager.taskCounter()).to.equal(2);

      await agentManager.connect(requester).createTask(1, 'Task 3', { value: reward });
      expect(await agentManager.taskCounter()).to.equal(3);
    });
  });

  describe('Task Lifecycle', function () {
    beforeEach(async function () {
      const reward = ethers.parseEther('0.1');
      await agentManager.connect(requester).createTask(1, 'Task data', { value: reward });
    });

    it('Should start task successfully', async function () {
      const tx = await agentManager.connect(executor).startTask(1);

      await expect(tx).to.emit(agentManager, 'TaskStarted').withArgs(1);

      const task = await agentManager.getTask(1);
      expect(task.status).to.equal(1); // InProgress
    });

    it('Should complete task and pay executor', async function () {
      await agentManager.connect(executor).startTask(1);

      const initialBalance = await ethers.provider.getBalance(executor.address);

      const tx = await agentManager.connect(executor).completeTask(1, 'QmResultHash');
      const receipt = await tx.wait();

      await expect(tx).to.emit(agentManager, 'TaskCompleted').withArgs(1, 'QmResultHash');

      const task = await agentManager.getTask(1);
      expect(task.status).to.equal(2); // Completed
      expect(task.result).to.equal('QmResultHash');
      expect(task.completedAt).to.be.gt(0);

      // Check payment (minus gas and platform fee)
      const gasUsed = receipt!.gasUsed * receipt!.gasPrice;
      const finalBalance = await ethers.provider.getBalance(executor.address);
      const reward = ethers.parseEther('0.1');
      const fee = (reward * 250n) / 10000n; // 2.5% fee
      const expectedPayment = reward - fee;

      expect(finalBalance).to.be.closeTo(
        initialBalance + expectedPayment - gasUsed,
        ethers.parseEther('0.001') // Allow small variance
      );
    });

    it('Should fail starting non-pending task', async function () {
      await agentManager.connect(executor).startTask(1);

      await expect(agentManager.connect(executor).startTask(1)).to.be.revertedWith(
        'Task not pending'
      );
    });

    it('Should fail completing non-started task', async function () {
      await expect(
        agentManager.connect(executor).completeTask(1, 'Result')
      ).to.be.revertedWith('Task not in progress');
    });

    it('Should calculate platform fee correctly', async function () {
      const reward = ethers.parseEther('1.0');
      await agentManager.connect(requester).createTask(1, 'Task 2', { value: reward });

      await agentManager.connect(executor).startTask(2);
      await agentManager.connect(executor).completeTask(2, 'Result');

      const expectedFee = (reward * 250n) / 10000n; // 2.5%
      const accumulatedFees = await agentManager.accumulatedFees();

      expect(accumulatedFees).to.be.closeTo(expectedFee, ethers.parseEther('0.001'));
    });
  });

  describe('Task Failure', function () {
    beforeEach(async function () {
      const reward = ethers.parseEther('0.1');
      await agentManager.connect(requester).createTask(1, 'Task data', { value: reward });
    });

    it('Should fail task and refund requester', async function () {
      await agentManager.connect(executor).startTask(1);

      const initialBalance = await ethers.provider.getBalance(requester.address);

      const tx = await agentManager.connect(executor).failTask(1);
      await expect(tx).to.emit(agentManager, 'TaskFailed').withArgs(1);

      const task = await agentManager.getTask(1);
      expect(task.status).to.equal(3); // Failed

      const finalBalance = await ethers.provider.getBalance(requester.address);
      expect(finalBalance).to.be.gt(initialBalance);
    });

    it('Should fail failing non-in-progress task', async function () {
      await expect(agentManager.connect(executor).failTask(1)).to.be.revertedWith(
        'Task not in progress'
      );
    });

    it('Should fail with invalid task ID', async function () {
      await expect(agentManager.connect(executor).failTask(999)).to.be.revertedWith(
        'Invalid task ID'
      );
    });
  });

  describe('Task Cancellation', function () {
    beforeEach(async function () {
      const reward = ethers.parseEther('0.1');
      await agentManager.connect(requester).createTask(1, 'Task data', { value: reward });
    });

    it('Should cancel pending task and refund requester', async function () {
      const initialBalance = await ethers.provider.getBalance(requester.address);

      const tx = await agentManager.connect(requester).cancelTask(1);
      const receipt = await tx.wait();

      await expect(tx).to.emit(agentManager, 'TaskCancelled').withArgs(1);

      const task = await agentManager.getTask(1);
      expect(task.status).to.equal(4); // Cancelled

      const gasUsed = receipt!.gasUsed * receipt!.gasPrice;
      const finalBalance = await ethers.provider.getBalance(requester.address);
      const reward = ethers.parseEther('0.1');

      expect(finalBalance).to.be.closeTo(
        initialBalance + reward - gasUsed,
        ethers.parseEther('0.001')
      );
    });

    it('Should fail cancellation from non-requester', async function () {
      await expect(agentManager.connect(executor).cancelTask(1)).to.be.revertedWith(
        'Not task requester'
      );
    });

    it('Should fail cancellation of started task', async function () {
      await agentManager.connect(executor).startTask(1);

      await expect(agentManager.connect(requester).cancelTask(1)).to.be.revertedWith(
        'Task already started'
      );
    });

    it('Should fail cancellation with invalid task ID', async function () {
      await expect(agentManager.connect(requester).cancelTask(999)).to.be.revertedWith(
        'Invalid task ID'
      );
    });
  });

  describe('Platform Fee Management', function () {
    it('Should update platform fee successfully', async function () {
      const newFee = 500; // 5%

      const tx = await agentManager.connect(owner).updatePlatformFee(newFee);

      await expect(tx).to.emit(agentManager, 'PlatformFeeUpdated').withArgs(newFee);

      expect(await agentManager.platformFee()).to.equal(newFee);
    });

    it('Should fail updating fee above 10%', async function () {
      await expect(
        agentManager.connect(owner).updatePlatformFee(1001) // 10.01%
      ).to.be.revertedWith('Fee cannot exceed 10%');
    });

    it('Should fail updating fee from non-owner', async function () {
      await expect(agentManager.connect(requester).updatePlatformFee(300)).to.be.reverted;
    });

    it('Should withdraw accumulated fees', async function () {
      // Create and complete some tasks to accumulate fees
      const reward = ethers.parseEther('1.0');

      await agentManager.connect(requester).createTask(1, 'Task 1', { value: reward });
      await agentManager.connect(executor).startTask(1);
      await agentManager.connect(executor).completeTask(1, 'Result');

      const initialBalance = await ethers.provider.getBalance(owner.address);
      const accumulatedFees = await agentManager.accumulatedFees();

      const tx = await agentManager.connect(owner).withdrawFees();
      const receipt = await tx.wait();

      const gasUsed = receipt!.gasUsed * receipt!.gasPrice;
      const finalBalance = await ethers.provider.getBalance(owner.address);

      expect(finalBalance).to.be.closeTo(
        initialBalance + accumulatedFees - gasUsed,
        ethers.parseEther('0.001')
      );

      expect(await agentManager.accumulatedFees()).to.equal(0);
    });

    it('Should fail withdrawal with no fees', async function () {
      await expect(agentManager.connect(owner).withdrawFees()).to.be.revertedWith(
        'No fees to withdraw'
      );
    });

    it('Should fail withdrawal from non-owner', async function () {
      await expect(agentManager.connect(requester).withdrawFees()).to.be.reverted;
    });
  });

  describe('Query Functions', function () {
    beforeEach(async function () {
      const reward = ethers.parseEther('0.1');
      await agentManager.connect(requester).createTask(1, 'Task 1', { value: reward });
      await agentManager.connect(requester).createTask(1, 'Task 2', { value: reward });
    });

    it('Should get task details correctly', async function () {
      const task = await agentManager.getTask(1);

      expect(task.agentId).to.equal(1);
      expect(task.requester).to.equal(requester.address);
      expect(task.taskData).to.equal('Task 1');
      expect(task.reward).to.equal(ethers.parseEther('0.1'));
      expect(task.status).to.equal(0); // Pending
    });

    it('Should get total tasks count', async function () {
      expect(await agentManager.getTotalTasks()).to.equal(2);
    });

    it('Should fail getting non-existent task', async function () {
      await expect(agentManager.getTask(999)).to.be.revertedWith('Invalid task ID');
    });
  });

  describe('Multiple Concurrent Tasks', function () {
    it('Should handle multiple tasks for same agent', async function () {
      const reward = ethers.parseEther('0.1');

      // Create 5 tasks
      for (let i = 0; i < 5; i++) {
        await agentManager
          .connect(requester)
          .createTask(1, `Task ${i + 1}`, { value: reward });
      }

      expect(await agentManager.getTotalTasks()).to.equal(5);

      // Start all tasks
      for (let i = 1; i <= 5; i++) {
        await agentManager.connect(executor).startTask(i);
        const task = await agentManager.getTask(i);
        expect(task.status).to.equal(1); // InProgress
      }

      // Complete all tasks
      for (let i = 1; i <= 5; i++) {
        await agentManager.connect(executor).completeTask(i, `Result ${i}`);
        const task = await agentManager.getTask(i);
        expect(task.status).to.equal(2); // Completed
      }
    });

    it('Should handle mixed task statuses', async function () {
      const reward = ethers.parseEther('0.1');

      // Create 4 tasks
      for (let i = 0; i < 4; i++) {
        await agentManager
          .connect(requester)
          .createTask(1, `Task ${i + 1}`, { value: reward });
      }

      // Task 1: Complete
      await agentManager.connect(executor).startTask(1);
      await agentManager.connect(executor).completeTask(1, 'Result 1');

      // Task 2: Fail
      await agentManager.connect(executor).startTask(2);
      await agentManager.connect(executor).failTask(2);

      // Task 3: Cancel
      await agentManager.connect(requester).cancelTask(3);

      // Task 4: Keep in progress
      await agentManager.connect(executor).startTask(4);

      // Verify statuses
      expect((await agentManager.getTask(1)).status).to.equal(2); // Completed
      expect((await agentManager.getTask(2)).status).to.equal(3); // Failed
      expect((await agentManager.getTask(3)).status).to.equal(4); // Cancelled
      expect((await agentManager.getTask(4)).status).to.equal(1); // InProgress
    });
  });
});
