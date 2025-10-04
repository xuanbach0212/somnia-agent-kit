import "@nomicfoundation/hardhat-toolbox";
import "@nomicfoundation/hardhat-verify";
import * as dotenv from "dotenv";
import { HardhatUserConfig } from "hardhat/config";

dotenv.config();

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.20",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  networks: {
    somnia: {
      url: process.env.SOMNIA_RPC_URL || "https://dream-rpc.somnia.network",
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      chainId: 50311, // Somnia Testnet Chain ID
    },
    localhost: {
      url: "http://127.0.0.1:8545",
    },
  },
  etherscan: {
    apiKey: {
      somnia: process.env.ETHERSCAN_API_KEY || "api-key",
    },
    customChains: [
      {
        network: "somnia",
        chainId: 50311,
        urls: {
          apiURL: "https://explorer.somnia.network/api",
          browserURL: "https://explorer.somnia.network",
        },
      },
    ],
  },
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts",
  },
};

export default config;

