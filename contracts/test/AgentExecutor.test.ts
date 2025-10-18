import { SignerWithAddress } from '@nomicfoundation/hardhat-ethers/signers';
import { expect } from 'chai';
import { ethers } from 'hardhat';
import { AgentExecutor, BaseAgent } from '../typechain-types';

describe('AgentExecutor', function () {
  let agentExecutor: AgentExecutor;
  let baseAgent: BaseAgent;
  let owner: SignerWithAddress;
  let admin: SignerWithAddress;
  let executor: SignerWithAddress;
  let user: SignerWithAddress;

  beforeEach(async function () {
    [owner, admin, executor, user] = await ethers.getSigners();

    const AgentExecutor = await ethers.getContractFactory('AgentExecutor');
    agentExecutor = await AgentExecutor.deploy();
    await agentExecutor.waitForDeployment();

    // Deploy a BaseAgent for testing
    const BaseAgent = await ethers.getContractFactory('BaseAgent');
    baseAgent = await BaseAgent.deploy();
    await baseAgent.waitForDeployment();
  });

  describe('Deployment', function () {
    it('Should set the right owner and roles', async function () {
      const DEFAULT_ADMIN_ROLE = await agentExecutor.DEFAULT_ADMIN_ROLE();
      const ADMIN_ROLE = await agentExecutor.ADMIN_ROLE();
      const EXECUTOR_ROLE = await agentExecutor.EXECUTOR_ROLE();

      expect(await agentExecutor.hasRole(DEFAULT_ADMIN_ROLE, owner.address)).to.be.true;
      expect(await agentExecutor.hasRole(ADMIN_ROLE, owner.address)).to.be.true;
      expect(await agentExecutor.hasRole(EXECUTOR_ROLE, owner.address)).to.be.true;
    });

    it('Should initialize with correct default values', async function () {
      expect(await agentExecutor.maxGasLimit()).to.equal(5_000_000);
      expect(await agentExecutor.executionFee()).to.equal(ethers.parseEther('0.001'));
    });
  });

  describe('Agent Authorization', function () {
    it('Should authorize an agent successfully', async function () {
      const agentAddress = await baseAgent.getAddress();

      const tx = await agentExecutor.connect(owner).authorizeAgent(agentAddress);

      await expect(tx)
        .to.emit(agentExecutor, 'AgentAuthorized')
        .withArgs(agentAddress, owner.address);

      expect(await agentExecutor.authorizedAgents(agentAddress)).to.be.true;
      expect(await agentExecutor.isAgentAuthorized(agentAddress)).to.be.true;
    });

    it('Should fail authorization from non-admin', async function () {
      const agentAddress = await baseAgent.getAddress();

      await expect(agentExecutor.connect(user).authorizeAgent(agentAddress)).to.be
        .reverted; // AccessControl revert
    });

    it('Should fail authorization of zero address', async function () {
      await expect(
        agentExecutor.connect(owner).authorizeAgent(ethers.ZeroAddress)
      ).to.be.revertedWith('Invalid agent address');
    });

    it('Should fail double authorization', async function () {
      const agentAddress = await baseAgent.getAddress();

      await agentExecutor.connect(owner).authorizeAgent(agentAddress);

      await expect(
        agentExecutor.connect(owner).authorizeAgent(agentAddress)
      ).to.be.revertedWith('Agent already authorized');
    });

    it('Should revoke agent authorization', async function () {
      const agentAddress = await baseAgent.getAddress();

      await agentExecutor.connect(owner).authorizeAgent(agentAddress);

      const tx = await agentExecutor.connect(owner).revokeAgent(agentAddress);

      await expect(tx)
        .to.emit(agentExecutor, 'AgentRevoked')
        .withArgs(agentAddress, owner.address);

      expect(await agentExecutor.authorizedAgents(agentAddress)).to.be.false;
    });

    it('Should fail revocation of non-authorized agent', async function () {
      const agentAddress = await baseAgent.getAddress();

      await expect(
        agentExecutor.connect(owner).revokeAgent(agentAddress)
      ).to.be.revertedWith('Agent not authorized');
    });
  });

  describe('Task Execution', function () {
    beforeEach(async function () {
      const agentAddress = await baseAgent.getAddress();
      await agentExecutor.connect(owner).authorizeAgent(agentAddress);
    });

    it('Should queue task execution successfully', async function () {
      const agentAddress = await baseAgent.getAddress();
      const data = ethers.toUtf8Bytes('test task data');
      const gasLimit = 500_000;
      const fee = ethers.parseEther('0.001');

      const tx = await agentExecutor
        .connect(user)
        .executeTask(agentAddress, data, gasLimit, { value: fee });

      await expect(tx).to.emit(agentExecutor, 'ExecutionQueued');

      // Get execution count
      const count = await agentExecutor.getAgentExecutionCount(agentAddress);
      expect(count).to.equal(1);
    });

    it('Should fail execution of unauthorized agent', async function () {
      const data = ethers.toUtf8Bytes('test data');
      const gasLimit = 500_000;

      await expect(
        agentExecutor.connect(user).executeTask(user.address, data, gasLimit, {
          value: ethers.parseEther('0.001'),
        })
      ).to.be.revertedWith('Agent not authorized');
    });

    it('Should fail execution with insufficient fee', async function () {
      const agentAddress = await baseAgent.getAddress();
      const data = ethers.toUtf8Bytes('test data');
      const gasLimit = 500_000;

      await expect(
        agentExecutor.connect(user).executeTask(agentAddress, data, gasLimit, {
          value: ethers.parseEther('0.0005'), // Less than required
        })
      ).to.be.revertedWith('Insufficient execution fee');
    });

    it('Should fail execution with gas limit too high', async function () {
      const agentAddress = await baseAgent.getAddress();
      const data = ethers.toUtf8Bytes('test data');
      const gasLimit = 10_000_000; // Exceeds maxGasLimit

      await expect(
        agentExecutor.connect(user).executeTask(agentAddress, data, gasLimit, {
          value: ethers.parseEther('0.001'),
        })
      ).to.be.revertedWith('Gas limit too high');
    });

    it('Should emit ExecutionCompleted event on success', async function () {
      const agentAddress = await baseAgent.getAddress();
      const data = ethers.toUtf8Bytes('test data');
      const gasLimit = 500_000;

      const tx = await agentExecutor
        .connect(user)
        .executeTask(agentAddress, data, gasLimit, {
          value: ethers.parseEther('0.001'),
        });

      const receipt = await tx.wait();

      // Check for ExecutionCompleted event
      const event = receipt?.logs.find((log: any) => {
        try {
          const parsed = agentExecutor.interface.parseLog(log);
          return parsed?.name === 'ExecutionCompleted';
        } catch {
          return false;
        }
      });

      expect(event).to.not.be.undefined;
    });
  });

  describe('Fee Management', function () {
    it('Should update execution fee successfully', async function () {
      const newFee = ethers.parseEther('0.002');

      const tx = await agentExecutor.connect(owner).setExecutionFee(newFee);

      await expect(tx)
        .to.emit(agentExecutor, 'FeeUpdated')
        .withArgs(ethers.parseEther('0.001'), newFee);

      expect(await agentExecutor.executionFee()).to.equal(newFee);
    });

    it('Should fail fee update from non-admin', async function () {
      await expect(
        agentExecutor.connect(user).setExecutionFee(ethers.parseEther('0.002'))
      ).to.be.reverted;
    });

    it('Should update max gas limit successfully', async function () {
      const newLimit = 10_000_000;

      await agentExecutor.connect(owner).setMaxGasLimit(newLimit);

      expect(await agentExecutor.maxGasLimit()).to.equal(newLimit);
    });

    it('Should fail gas limit update with zero', async function () {
      await expect(agentExecutor.connect(owner).setMaxGasLimit(0)).to.be.revertedWith(
        'Invalid gas limit'
      );
    });

    it('Should withdraw collected fees', async function () {
      const agentAddress = await baseAgent.getAddress();
      await agentExecutor.connect(owner).authorizeAgent(agentAddress);

      // Execute some tasks to collect fees
      const data = ethers.toUtf8Bytes('test data');
      const gasLimit = 500_000;
      const fee = ethers.parseEther('0.001');

      await agentExecutor
        .connect(user)
        .executeTask(agentAddress, data, gasLimit, { value: fee });
      await agentExecutor
        .connect(user)
        .executeTask(agentAddress, data, gasLimit, { value: fee });

      const initialBalance = await ethers.provider.getBalance(owner.address);

      const tx = await agentExecutor.connect(owner).withdrawFees(owner.address);
      const receipt = await tx.wait();

      const gasUsed = receipt!.gasUsed * receipt!.gasPrice;
      const finalBalance = await ethers.provider.getBalance(owner.address);

      // Balance should increase by collected fees minus gas
      expect(finalBalance).to.be.gt(initialBalance - gasUsed);
    });

    it('Should fail withdrawal to zero address', async function () {
      await expect(
        agentExecutor.connect(owner).withdrawFees(ethers.ZeroAddress)
      ).to.be.revertedWith('Invalid recipient');
    });

    it('Should fail withdrawal with no fees', async function () {
      await expect(
        agentExecutor.connect(owner).withdrawFees(owner.address)
      ).to.be.revertedWith('No fees to withdraw');
    });
  });

  describe('Execution Context', function () {
    beforeEach(async function () {
      const agentAddress = await baseAgent.getAddress();
      await agentExecutor.connect(owner).authorizeAgent(agentAddress);
    });

    it('Should create execution context correctly', async function () {
      const agentAddress = await baseAgent.getAddress();
      const data = ethers.toUtf8Bytes('test data');
      const gasLimit = 500_000;
      const fee = ethers.parseEther('0.001');

      const tx = await agentExecutor
        .connect(user)
        .executeTask(agentAddress, data, gasLimit, { value: fee });

      const receipt = await tx.wait();

      // Extract taskId from event
      const event = receipt?.logs.find((log: any) => {
        try {
          const parsed = agentExecutor.interface.parseLog(log);
          return parsed?.name === 'ExecutionQueued';
        } catch {
          return false;
        }
      });

      if (event) {
        const parsed = agentExecutor.interface.parseLog(event);
        const taskId = parsed?.args[0];

        const execution = await agentExecutor.getExecution(taskId);

        expect(execution.agent).to.equal(agentAddress);
        expect(execution.requester).to.equal(user.address);
        expect(execution.gasLimit).to.equal(gasLimit);
      }
    });

    it('Should track agent execution count', async function () {
      const agentAddress = await baseAgent.getAddress();
      const data = ethers.toUtf8Bytes('test data');
      const gasLimit = 500_000;
      const fee = ethers.parseEther('0.001');

      expect(await agentExecutor.getAgentExecutionCount(agentAddress)).to.equal(0);

      await agentExecutor
        .connect(user)
        .executeTask(agentAddress, data, gasLimit, { value: fee });

      expect(await agentExecutor.getAgentExecutionCount(agentAddress)).to.equal(1);

      await agentExecutor
        .connect(user)
        .executeTask(agentAddress, data, gasLimit, { value: fee });

      expect(await agentExecutor.getAgentExecutionCount(agentAddress)).to.equal(2);
    });
  });

  describe('Role Management', function () {
    it('Should grant admin role', async function () {
      const ADMIN_ROLE = await agentExecutor.ADMIN_ROLE();

      await agentExecutor.connect(owner).grantRole(ADMIN_ROLE, admin.address);

      expect(await agentExecutor.hasRole(ADMIN_ROLE, admin.address)).to.be.true;
    });

    it('Should revoke admin role', async function () {
      const ADMIN_ROLE = await agentExecutor.ADMIN_ROLE();

      await agentExecutor.connect(owner).grantRole(ADMIN_ROLE, admin.address);
      await agentExecutor.connect(owner).revokeRole(ADMIN_ROLE, admin.address);

      expect(await agentExecutor.hasRole(ADMIN_ROLE, admin.address)).to.be.false;
    });

    it('Should grant executor role', async function () {
      const EXECUTOR_ROLE = await agentExecutor.EXECUTOR_ROLE();

      await agentExecutor.connect(owner).grantRole(EXECUTOR_ROLE, executor.address);

      expect(await agentExecutor.hasRole(EXECUTOR_ROLE, executor.address)).to.be.true;
    });
  });

  describe('Multiple Concurrent Executions', function () {
    beforeEach(async function () {
      const agentAddress = await baseAgent.getAddress();
      await agentExecutor.connect(owner).authorizeAgent(agentAddress);
    });

    it('Should handle multiple tasks from same agent', async function () {
      const agentAddress = await baseAgent.getAddress();
      const data = ethers.toUtf8Bytes('test data');
      const gasLimit = 500_000;
      const fee = ethers.parseEther('0.001');

      // Execute 5 tasks concurrently
      await Promise.all([
        agentExecutor
          .connect(user)
          .executeTask(agentAddress, data, gasLimit, { value: fee }),
        agentExecutor
          .connect(user)
          .executeTask(agentAddress, data, gasLimit, { value: fee }),
        agentExecutor
          .connect(user)
          .executeTask(agentAddress, data, gasLimit, { value: fee }),
        agentExecutor
          .connect(user)
          .executeTask(agentAddress, data, gasLimit, { value: fee }),
        agentExecutor
          .connect(user)
          .executeTask(agentAddress, data, gasLimit, { value: fee }),
      ]);

      expect(await agentExecutor.getAgentExecutionCount(agentAddress)).to.equal(5);
    });
  });
});
