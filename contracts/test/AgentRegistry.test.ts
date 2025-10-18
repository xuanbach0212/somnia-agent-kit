import { SignerWithAddress } from '@nomicfoundation/hardhat-ethers/signers';
import { expect } from 'chai';
import { ethers } from 'hardhat';
import { AgentRegistry } from '../typechain-types';

describe('AgentRegistry', function () {
  let agentRegistry: AgentRegistry;
  let owner: SignerWithAddress;
  let agent1: SignerWithAddress;
  let agent2: SignerWithAddress;

  beforeEach(async function () {
    [owner, agent1, agent2] = await ethers.getSigners();

    const AgentRegistry = await ethers.getContractFactory('AgentRegistry');
    agentRegistry = await AgentRegistry.deploy();
    await agentRegistry.waitForDeployment();
  });

  describe('Deployment', function () {
    it('Should set the right owner', async function () {
      expect(await agentRegistry.owner()).to.equal(owner.address);
    });

    it('Should initialize agent counter to 0', async function () {
      expect(await agentRegistry.agentCounter()).to.equal(0);
    });
  });

  describe('Agent Registration', function () {
    it('Should register a new agent successfully', async function () {
      const tx = await agentRegistry
        .connect(agent1)
        .registerAgent('TestAgent', 'A test agent', 'QmTestHash123', [
          'capability1',
          'capability2',
        ]);

      await expect(tx)
        .to.emit(agentRegistry, 'AgentRegistered')
        .withArgs(1, agent1.address, 'TestAgent');

      const agent = await agentRegistry.getAgent(1);
      expect(agent.name).to.equal('TestAgent');
      expect(agent.description).to.equal('A test agent');
      expect(agent.ipfsMetadata).to.equal('QmTestHash123');
      expect(agent.owner).to.equal(agent1.address);
      expect(agent.isActive).to.be.true;
      expect(agent.executionCount).to.equal(0);
    });

    it('Should increment agent counter after registration', async function () {
      await agentRegistry
        .connect(agent1)
        .registerAgent('Agent1', 'Description', 'QmHash1', ['cap1']);

      expect(await agentRegistry.agentCounter()).to.equal(1);

      await agentRegistry
        .connect(agent2)
        .registerAgent('Agent2', 'Description', 'QmHash2', ['cap2']);

      expect(await agentRegistry.agentCounter()).to.equal(2);
    });

    it('Should fail registration with empty name', async function () {
      await expect(
        agentRegistry.registerAgent('', 'Description', 'QmHash', ['cap1'])
      ).to.be.revertedWith('Name cannot be empty');
    });

    it('Should fail registration with empty IPFS metadata', async function () {
      await expect(
        agentRegistry.registerAgent('Agent', 'Description', '', ['cap1'])
      ).to.be.revertedWith('IPFS metadata required');
    });

    it('Should track owner agents correctly', async function () {
      await agentRegistry
        .connect(agent1)
        .registerAgent('Agent1', 'Desc', 'QmHash1', ['cap1']);
      await agentRegistry
        .connect(agent1)
        .registerAgent('Agent2', 'Desc', 'QmHash2', ['cap2']);

      const ownerAgents = await agentRegistry.getOwnerAgents(agent1.address);
      expect(ownerAgents.length).to.equal(2);
      expect(ownerAgents[0]).to.equal(1);
      expect(ownerAgents[1]).to.equal(2);
    });
  });

  describe('Agent Update', function () {
    beforeEach(async function () {
      await agentRegistry
        .connect(agent1)
        .registerAgent('OriginalAgent', 'Original description', 'QmOriginal', ['cap1']);
    });

    it('Should update agent metadata successfully', async function () {
      const tx = await agentRegistry
        .connect(agent1)
        .updateAgent(1, 'UpdatedAgent', 'Updated description', 'QmUpdated', [
          'cap1',
          'cap2',
        ]);

      await expect(tx).to.emit(agentRegistry, 'AgentUpdated').withArgs(1, 'UpdatedAgent');

      const agent = await agentRegistry.getAgent(1);
      expect(agent.name).to.equal('UpdatedAgent');
      expect(agent.description).to.equal('Updated description');
      expect(agent.ipfsMetadata).to.equal('QmUpdated');
    });

    it('Should fail update if not owner', async function () {
      await expect(
        agentRegistry
          .connect(agent2)
          .updateAgent(1, 'UpdatedAgent', 'Updated', 'QmUpdated', ['cap1'])
      ).to.be.revertedWith('Not agent owner');
    });

    it('Should fail update with invalid agent ID', async function () {
      await expect(
        agentRegistry
          .connect(agent1)
          .updateAgent(999, 'UpdatedAgent', 'Updated', 'QmUpdated', ['cap1'])
      ).to.be.revertedWith('Invalid agent ID');
    });

    it('Should update capabilities correctly', async function () {
      await agentRegistry
        .connect(agent1)
        .updateAgent(1, 'Agent', 'Desc', 'QmHash', ['cap1', 'cap2', 'cap3']);

      const capabilities = await agentRegistry.getAgentCapabilities(1);
      expect(capabilities.length).to.equal(3);
      expect(capabilities[0]).to.equal('cap1');
      expect(capabilities[1]).to.equal('cap2');
      expect(capabilities[2]).to.equal('cap3');
    });
  });

  describe('Agent Activation/Deactivation', function () {
    beforeEach(async function () {
      await agentRegistry
        .connect(agent1)
        .registerAgent('TestAgent', 'Description', 'QmHash', ['cap1']);
    });

    it('Should deactivate agent successfully', async function () {
      const tx = await agentRegistry.connect(agent1).deactivateAgent(1);

      await expect(tx).to.emit(agentRegistry, 'AgentDeactivated').withArgs(1);

      const agent = await agentRegistry.getAgent(1);
      expect(agent.isActive).to.be.false;
    });

    it('Should activate agent after deactivation', async function () {
      await agentRegistry.connect(agent1).deactivateAgent(1);

      const tx = await agentRegistry.connect(agent1).activateAgent(1);

      await expect(tx).to.emit(agentRegistry, 'AgentActivated').withArgs(1);

      const agent = await agentRegistry.getAgent(1);
      expect(agent.isActive).to.be.true;
    });

    it('Should fail deactivation if not owner', async function () {
      await expect(agentRegistry.connect(agent2).deactivateAgent(1)).to.be.revertedWith(
        'Not agent owner'
      );
    });

    it('Should fail activation if not owner', async function () {
      await agentRegistry.connect(agent1).deactivateAgent(1);

      await expect(agentRegistry.connect(agent2).activateAgent(1)).to.be.revertedWith(
        'Not agent owner'
      );
    });
  });

  describe('Execution Metrics', function () {
    beforeEach(async function () {
      await agentRegistry
        .connect(agent1)
        .registerAgent('TestAgent', 'Description', 'QmHash', ['cap1']);
    });

    it('Should record successful execution', async function () {
      const tx = await agentRegistry.connect(agent1).recordExecution(1, true, 1000);

      await expect(tx).to.emit(agentRegistry, 'AgentExecuted').withArgs(1, true, 1000);

      const agent = await agentRegistry.getAgent(1);
      expect(agent.executionCount).to.equal(1);
    });

    it('Should track metrics correctly', async function () {
      // Record 3 successful executions
      await agentRegistry.connect(agent1).recordExecution(1, true, 1000);
      await agentRegistry.connect(agent1).recordExecution(1, true, 2000);
      await agentRegistry.connect(agent1).recordExecution(1, true, 1500);

      const metrics = await agentRegistry.agentMetrics(1);
      expect(metrics.totalExecutions).to.equal(3);
      expect(metrics.successfulExecutions).to.equal(3);
      expect(metrics.failedExecutions).to.equal(0);
      expect(metrics.averageExecutionTime).to.equal(1500); // (1000 + 2000 + 1500) / 3
    });

    it('Should track failed executions', async function () {
      await agentRegistry.connect(agent1).recordExecution(1, true, 1000);
      await agentRegistry.connect(agent1).recordExecution(1, false, 500);
      await agentRegistry.connect(agent1).recordExecution(1, true, 2000);

      const metrics = await agentRegistry.agentMetrics(1);
      expect(metrics.totalExecutions).to.equal(3);
      expect(metrics.successfulExecutions).to.equal(2);
      expect(metrics.failedExecutions).to.equal(1);
    });

    it('Should calculate average execution time correctly', async function () {
      await agentRegistry.connect(agent1).recordExecution(1, true, 1000);
      await agentRegistry.connect(agent1).recordExecution(1, true, 3000);

      const metrics = await agentRegistry.agentMetrics(1);
      expect(metrics.averageExecutionTime).to.equal(2000); // (1000 + 3000) / 2
    });

    it('Should fail recording if not owner', async function () {
      await expect(
        agentRegistry.connect(agent2).recordExecution(1, true, 1000)
      ).to.be.revertedWith('Not agent owner');
    });

    it('Should fail recording with invalid agent ID', async function () {
      await expect(
        agentRegistry.connect(agent1).recordExecution(999, true, 1000)
      ).to.be.revertedWith('Invalid agent ID');
    });
  });

  describe('Query Functions', function () {
    beforeEach(async function () {
      await agentRegistry
        .connect(agent1)
        .registerAgent('Agent1', 'Description 1', 'QmHash1', ['cap1', 'cap2']);
      await agentRegistry
        .connect(agent2)
        .registerAgent('Agent2', 'Description 2', 'QmHash2', ['cap3']);
    });

    it('Should get agent capabilities', async function () {
      const capabilities = await agentRegistry.getAgentCapabilities(1);
      expect(capabilities.length).to.equal(2);
      expect(capabilities[0]).to.equal('cap1');
      expect(capabilities[1]).to.equal('cap2');
    });

    it('Should get total agents count', async function () {
      expect(await agentRegistry.getTotalAgents()).to.equal(2);
    });

    it('Should get owner agents', async function () {
      const agent1Agents = await agentRegistry.getOwnerAgents(agent1.address);
      expect(agent1Agents.length).to.equal(1);
      expect(agent1Agents[0]).to.equal(1);

      const agent2Agents = await agentRegistry.getOwnerAgents(agent2.address);
      expect(agent2Agents.length).to.equal(1);
      expect(agent2Agents[0]).to.equal(2);
    });

    it('Should fail get agent with invalid ID', async function () {
      await expect(agentRegistry.getAgent(999)).to.be.revertedWith('Invalid agent ID');
    });
  });

  describe('Multiple Agents Scenario', function () {
    it('Should handle multiple agents from different owners', async function () {
      // Agent 1 registers 2 agents
      await agentRegistry
        .connect(agent1)
        .registerAgent('Agent1-1', 'Desc', 'QmHash1', ['cap1']);
      await agentRegistry
        .connect(agent1)
        .registerAgent('Agent1-2', 'Desc', 'QmHash2', ['cap2']);

      // Agent 2 registers 1 agent
      await agentRegistry
        .connect(agent2)
        .registerAgent('Agent2-1', 'Desc', 'QmHash3', ['cap3']);

      expect(await agentRegistry.getTotalAgents()).to.equal(3);

      const agent1Agents = await agentRegistry.getOwnerAgents(agent1.address);
      expect(agent1Agents.length).to.equal(2);

      const agent2Agents = await agentRegistry.getOwnerAgents(agent2.address);
      expect(agent2Agents.length).to.equal(1);
    });

    it('Should track metrics independently for each agent', async function () {
      await agentRegistry
        .connect(agent1)
        .registerAgent('Agent1', 'Desc', 'QmHash1', ['cap1']);
      await agentRegistry
        .connect(agent2)
        .registerAgent('Agent2', 'Desc', 'QmHash2', ['cap2']);

      // Record different metrics for each agent
      await agentRegistry.connect(agent1).recordExecution(1, true, 1000);
      await agentRegistry.connect(agent1).recordExecution(1, true, 2000);

      await agentRegistry.connect(agent2).recordExecution(2, true, 5000);

      const metrics1 = await agentRegistry.agentMetrics(1);
      expect(metrics1.totalExecutions).to.equal(2);
      expect(metrics1.averageExecutionTime).to.equal(1500);

      const metrics2 = await agentRegistry.agentMetrics(2);
      expect(metrics2.totalExecutions).to.equal(1);
      expect(metrics2.averageExecutionTime).to.equal(5000);
    });
  });
});
