import { expect } from "chai";
import { ethers } from "hardhat";

describe("AgentRegistry", function () {
  it("Should register an agent", async function () {
    const [owner] = await ethers.getSigners();
    const AgentRegistry = await ethers.getContractFactory("AgentRegistry");
    const registry = await AgentRegistry.deploy();
    await registry.waitForDeployment();

    const tx = await registry.registerAgent(
      "TestAgent",
      "Test Description",
      ["capability1", "capability2"]
    );
    await tx.wait();

    // Add assertions here
    expect(true).to.be.true;
  });
});
