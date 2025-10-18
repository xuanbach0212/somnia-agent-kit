import { SignerWithAddress } from '@nomicfoundation/hardhat-ethers/signers';
import { expect } from 'chai';
import { ethers } from 'hardhat';
import { AgentVault } from '../typechain-types';

describe('AgentVault', function () {
  let agentVault: AgentVault;
  let owner: SignerWithAddress;
  let agent: SignerWithAddress;
  let depositor: SignerWithAddress;
  let recipient: SignerWithAddress;

  beforeEach(async function () {
    [owner, agent, depositor, recipient] = await ethers.getSigners();

    const AgentVault = await ethers.getContractFactory('AgentVault');
    agentVault = await AgentVault.deploy();
    await agentVault.waitForDeployment();
  });

  describe('Deployment', function () {
    it('Should set the right owner', async function () {
      expect(await agentVault.owner()).to.equal(owner.address);
    });

    it('Should have correct constant values', async function () {
      expect(await agentVault.MIN_DAILY_LIMIT()).to.equal(ethers.parseEther('0.01'));
      expect(await agentVault.MAX_DAILY_LIMIT()).to.equal(ethers.parseEther('100'));
    });
  });

  describe('Vault Creation', function () {
    it('Should create vault successfully', async function () {
      const dailyLimit = ethers.parseEther('1');

      const tx = await agentVault.connect(owner).createVault(agent.address, dailyLimit);

      await expect(tx)
        .to.emit(agentVault, 'VaultCreated')
        .withArgs(agent.address, dailyLimit);

      expect(await agentVault.registeredAgents(agent.address)).to.be.true;
      expect(await agentVault.isVaultActive(agent.address)).to.be.true;
    });

    it('Should fail creating vault for zero address', async function () {
      await expect(
        agentVault.connect(owner).createVault(ethers.ZeroAddress, ethers.parseEther('1'))
      ).to.be.revertedWith('Invalid agent address');
    });

    it('Should fail creating duplicate vault', async function () {
      const dailyLimit = ethers.parseEther('1');

      await agentVault.connect(owner).createVault(agent.address, dailyLimit);

      await expect(
        agentVault.connect(owner).createVault(agent.address, dailyLimit)
      ).to.be.revertedWith('Vault already exists');
    });

    it('Should fail creating vault with invalid daily limit', async function () {
      // Below minimum
      await expect(
        agentVault.connect(owner).createVault(agent.address, ethers.parseEther('0.005'))
      ).to.be.revertedWith('Invalid daily limit');

      // Above maximum
      await expect(
        agentVault.connect(owner).createVault(agent.address, ethers.parseEther('101'))
      ).to.be.revertedWith('Invalid daily limit');
    });

    it('Should fail creating vault from non-owner', async function () {
      await expect(
        agentVault.connect(depositor).createVault(agent.address, ethers.parseEther('1'))
      ).to.be.reverted;
    });
  });

  describe('Native Token Deposits', function () {
    beforeEach(async function () {
      await agentVault.connect(owner).createVault(agent.address, ethers.parseEther('1'));
    });

    it('Should deposit native tokens successfully', async function () {
      const depositAmount = ethers.parseEther('0.5');

      const tx = await agentVault
        .connect(depositor)
        .depositNative(agent.address, { value: depositAmount });

      await expect(tx)
        .to.emit(agentVault, 'NativeDeposit')
        .withArgs(agent.address, depositor.address, depositAmount);

      const balance = await agentVault.getNativeBalance(agent.address);
      expect(balance).to.equal(depositAmount);
    });

    it('Should accumulate multiple deposits', async function () {
      await agentVault
        .connect(depositor)
        .depositNative(agent.address, { value: ethers.parseEther('0.3') });
      await agentVault
        .connect(depositor)
        .depositNative(agent.address, { value: ethers.parseEther('0.2') });

      const balance = await agentVault.getNativeBalance(agent.address);
      expect(balance).to.equal(ethers.parseEther('0.5'));
    });

    it('Should fail deposit to non-existent vault', async function () {
      await expect(
        agentVault
          .connect(depositor)
          .depositNative(recipient.address, { value: ethers.parseEther('0.1') })
      ).to.be.revertedWith('Vault does not exist');
    });

    it('Should fail deposit with zero amount', async function () {
      await expect(
        agentVault.connect(depositor).depositNative(agent.address)
      ).to.be.revertedWith('Invalid deposit amount');
    });
  });

  describe('Native Token Withdrawals', function () {
    beforeEach(async function () {
      await agentVault.connect(owner).createVault(agent.address, ethers.parseEther('1'));
      await agentVault
        .connect(depositor)
        .depositNative(agent.address, { value: ethers.parseEther('2') });
    });

    it('Should withdraw native tokens successfully', async function () {
      const withdrawAmount = ethers.parseEther('0.5');
      const initialBalance = await ethers.provider.getBalance(recipient.address);

      const tx = await agentVault
        .connect(agent)
        .withdrawNative(agent.address, recipient.address, withdrawAmount);

      await expect(tx)
        .to.emit(agentVault, 'NativeWithdraw')
        .withArgs(agent.address, recipient.address, withdrawAmount);

      const finalBalance = await ethers.provider.getBalance(recipient.address);
      expect(finalBalance).to.equal(initialBalance + withdrawAmount);

      const vaultBalance = await agentVault.getNativeBalance(agent.address);
      expect(vaultBalance).to.equal(ethers.parseEther('1.5'));
    });

    it('Should allow owner to withdraw', async function () {
      const withdrawAmount = ethers.parseEther('0.5');

      await agentVault
        .connect(owner)
        .withdrawNative(agent.address, recipient.address, withdrawAmount);

      const vaultBalance = await agentVault.getNativeBalance(agent.address);
      expect(vaultBalance).to.equal(ethers.parseEther('1.5'));
    });

    it('Should fail withdrawal from unauthorized address', async function () {
      await expect(
        agentVault
          .connect(depositor)
          .withdrawNative(agent.address, recipient.address, ethers.parseEther('0.1'))
      ).to.be.revertedWith('Unauthorized');
    });

    it('Should fail withdrawal exceeding balance', async function () {
      await expect(
        agentVault
          .connect(agent)
          .withdrawNative(agent.address, recipient.address, ethers.parseEther('3'))
      ).to.be.revertedWith('Insufficient balance');
    });

    it('Should fail withdrawal from non-existent vault', async function () {
      await expect(
        agentVault
          .connect(recipient)
          .withdrawNative(recipient.address, recipient.address, ethers.parseEther('0.1'))
      ).to.be.revertedWith('Vault does not exist');
    });
  });

  describe('Daily Limit Enforcement', function () {
    beforeEach(async function () {
      await agentVault.connect(owner).createVault(agent.address, ethers.parseEther('1'));
      await agentVault
        .connect(depositor)
        .depositNative(agent.address, { value: ethers.parseEther('5') });
    });

    it('Should enforce daily limit on withdrawals', async function () {
      // First withdrawal within limit
      await agentVault
        .connect(agent)
        .withdrawNative(agent.address, recipient.address, ethers.parseEther('0.5'));

      // Second withdrawal within remaining limit
      await agentVault
        .connect(agent)
        .withdrawNative(agent.address, recipient.address, ethers.parseEther('0.4'));

      // Third withdrawal exceeds daily limit
      await expect(
        agentVault
          .connect(agent)
          .withdrawNative(agent.address, recipient.address, ethers.parseEther('0.2'))
      ).to.be.revertedWith('Daily limit exceeded');
    });

    it('Should track daily spent correctly', async function () {
      await agentVault
        .connect(agent)
        .withdrawNative(agent.address, recipient.address, ethers.parseEther('0.3'));

      const limitInfo = await agentVault.getDailyLimitInfo(agent.address);
      expect(limitInfo.spent).to.equal(ethers.parseEther('0.3'));
      expect(limitInfo.remaining).to.equal(ethers.parseEther('0.7'));
    });

    it('Should reset daily limit after 24 hours', async function () {
      // Spend up to limit
      await agentVault
        .connect(agent)
        .withdrawNative(agent.address, recipient.address, ethers.parseEther('1'));

      // Fast forward 24 hours + 1 second
      await ethers.provider.send('evm_increaseTime', [86401]);
      await ethers.provider.send('evm_mine', []);

      // Should be able to withdraw again
      await agentVault
        .connect(agent)
        .withdrawNative(agent.address, recipient.address, ethers.parseEther('1'));

      const limitInfo = await agentVault.getDailyLimitInfo(agent.address);
      expect(limitInfo.spent).to.equal(ethers.parseEther('1'));
    });

    it('Should update daily limit successfully', async function () {
      const newLimit = ethers.parseEther('2');

      const tx = await agentVault
        .connect(owner)
        .updateDailyLimit(agent.address, newLimit);

      await expect(tx)
        .to.emit(agentVault, 'DailyLimitUpdated')
        .withArgs(agent.address, ethers.parseEther('1'), newLimit);

      const limitInfo = await agentVault.getDailyLimitInfo(agent.address);
      expect(limitInfo.limit).to.equal(newLimit);
    });

    it('Should fail updating limit from non-owner', async function () {
      await expect(
        agentVault.connect(agent).updateDailyLimit(agent.address, ethers.parseEther('2'))
      ).to.be.reverted;
    });

    it('Should fail updating with invalid limit', async function () {
      await expect(
        agentVault
          .connect(owner)
          .updateDailyLimit(agent.address, ethers.parseEther('0.005'))
      ).to.be.revertedWith('Invalid daily limit');
    });
  });

  describe('Vault Activation/Deactivation', function () {
    beforeEach(async function () {
      await agentVault.connect(owner).createVault(agent.address, ethers.parseEther('1'));
      await agentVault
        .connect(depositor)
        .depositNative(agent.address, { value: ethers.parseEther('1') });
    });

    it('Should deactivate vault successfully', async function () {
      const tx = await agentVault.connect(owner).deactivateVault(agent.address);

      await expect(tx).to.emit(agentVault, 'VaultDeactivated').withArgs(agent.address);

      expect(await agentVault.isVaultActive(agent.address)).to.be.false;
    });

    it('Should fail withdrawal from inactive vault', async function () {
      await agentVault.connect(owner).deactivateVault(agent.address);

      await expect(
        agentVault
          .connect(agent)
          .withdrawNative(agent.address, recipient.address, ethers.parseEther('0.1'))
      ).to.be.revertedWith('Vault is not active');
    });

    it('Should reactivate vault successfully', async function () {
      await agentVault.connect(owner).deactivateVault(agent.address);

      const tx = await agentVault.connect(owner).activateVault(agent.address);

      await expect(tx).to.emit(agentVault, 'VaultActivated').withArgs(agent.address);

      expect(await agentVault.isVaultActive(agent.address)).to.be.true;
    });

    it('Should allow withdrawal after reactivation', async function () {
      await agentVault.connect(owner).deactivateVault(agent.address);
      await agentVault.connect(owner).activateVault(agent.address);

      await agentVault
        .connect(agent)
        .withdrawNative(agent.address, recipient.address, ethers.parseEther('0.1'));

      const balance = await agentVault.getNativeBalance(agent.address);
      expect(balance).to.equal(ethers.parseEther('0.9'));
    });

    it('Should fail deactivation from non-owner', async function () {
      await expect(agentVault.connect(agent).deactivateVault(agent.address)).to.be
        .reverted;
    });

    it('Should fail activation from non-owner', async function () {
      await agentVault.connect(owner).deactivateVault(agent.address);

      await expect(agentVault.connect(agent).activateVault(agent.address)).to.be.reverted;
    });
  });

  describe('Query Functions', function () {
    beforeEach(async function () {
      await agentVault.connect(owner).createVault(agent.address, ethers.parseEther('1'));
      await agentVault
        .connect(depositor)
        .depositNative(agent.address, { value: ethers.parseEther('2') });
    });

    it('Should get native balance correctly', async function () {
      const balance = await agentVault.getNativeBalance(agent.address);
      expect(balance).to.equal(ethers.parseEther('2'));
    });

    it('Should get daily limit info correctly', async function () {
      const limitInfo = await agentVault.getDailyLimitInfo(agent.address);

      expect(limitInfo.limit).to.equal(ethers.parseEther('1'));
      expect(limitInfo.spent).to.equal(0);
      expect(limitInfo.remaining).to.equal(ethers.parseEther('1'));
      expect(limitInfo.resetTime).to.be.gt(0);
    });

    it('Should check vault active status', async function () {
      expect(await agentVault.isVaultActive(agent.address)).to.be.true;

      await agentVault.connect(owner).deactivateVault(agent.address);

      expect(await agentVault.isVaultActive(agent.address)).to.be.false;
    });

    it('Should fail queries for non-existent vault', async function () {
      await expect(agentVault.getNativeBalance(recipient.address)).to.be.revertedWith(
        'Vault does not exist'
      );

      await expect(agentVault.isVaultActive(recipient.address)).to.be.revertedWith(
        'Vault does not exist'
      );

      await expect(agentVault.getDailyLimitInfo(recipient.address)).to.be.revertedWith(
        'Vault does not exist'
      );
    });
  });

  describe('Multiple Vaults', function () {
    let agent2: SignerWithAddress;

    beforeEach(async function () {
      [, , , , agent2] = await ethers.getSigners();

      await agentVault.connect(owner).createVault(agent.address, ethers.parseEther('1'));
      await agentVault.connect(owner).createVault(agent2.address, ethers.parseEther('2'));
    });

    it('Should manage multiple vaults independently', async function () {
      // Deposit to both vaults
      await agentVault
        .connect(depositor)
        .depositNative(agent.address, { value: ethers.parseEther('1') });
      await agentVault
        .connect(depositor)
        .depositNative(agent2.address, { value: ethers.parseEther('3') });

      expect(await agentVault.getNativeBalance(agent.address)).to.equal(
        ethers.parseEther('1')
      );
      expect(await agentVault.getNativeBalance(agent2.address)).to.equal(
        ethers.parseEther('3')
      );
    });

    it('Should track daily limits independently', async function () {
      await agentVault
        .connect(depositor)
        .depositNative(agent.address, { value: ethers.parseEther('5') });
      await agentVault
        .connect(depositor)
        .depositNative(agent2.address, { value: ethers.parseEther('5') });

      // Agent 1: withdraw 0.5 (limit 1.0)
      await agentVault
        .connect(agent)
        .withdrawNative(agent.address, recipient.address, ethers.parseEther('0.5'));

      // Agent 2: withdraw 1.5 (limit 2.0)
      await agentVault
        .connect(agent2)
        .withdrawNative(agent2.address, recipient.address, ethers.parseEther('1.5'));

      const limitInfo1 = await agentVault.getDailyLimitInfo(agent.address);
      const limitInfo2 = await agentVault.getDailyLimitInfo(agent2.address);

      expect(limitInfo1.spent).to.equal(ethers.parseEther('0.5'));
      expect(limitInfo1.remaining).to.equal(ethers.parseEther('0.5'));

      expect(limitInfo2.spent).to.equal(ethers.parseEther('1.5'));
      expect(limitInfo2.remaining).to.equal(ethers.parseEther('0.5'));
    });

    it('Should deactivate vaults independently', async function () {
      await agentVault.connect(owner).deactivateVault(agent.address);

      expect(await agentVault.isVaultActive(agent.address)).to.be.false;
      expect(await agentVault.isVaultActive(agent2.address)).to.be.true;
    });
  });

  describe('Receive Function', function () {
    it('Should accept direct ETH transfers', async function () {
      const amount = ethers.parseEther('1');
      const contractAddress = await agentVault.getAddress();

      await depositor.sendTransaction({
        to: contractAddress,
        value: amount,
      });

      const balance = await ethers.provider.getBalance(contractAddress);
      expect(balance).to.be.gte(amount);
    });
  });
});
