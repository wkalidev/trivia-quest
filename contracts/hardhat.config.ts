import hardhatToolboxViem from "@nomicfoundation/hardhat-toolbox-viem";
import { HardhatUserConfig } from "hardhat/config";
import * as dotenv from "dotenv";
dotenv.config();

const config: HardhatUserConfig & { sourcify?: any } = {
  plugins: [hardhatToolboxViem],
  solidity: {
    compilers: [
      {
        version: "0.8.24",
        settings: { evmVersion: "cancun" },
      },
      {
        version: "0.8.20",
        settings: { evmVersion: "paris" },
      },
    ],
  },
  networks: {
    celoSepolia: {
      type: "http",
      url: process.env.CELO_SEPOLIA_RPC!,
      accounts: [process.env.PRIVATE_KEY!],
      chainId: 11142220,
    },
    alfajores: {
      type: "http",
      url: process.env.ALFAJORES_RPC!,
      accounts: [process.env.PRIVATE_KEY!],
      chainId: 44787,
    },
    celo: {
      type: "http",
      url: process.env.CELO_RPC!,
      accounts: [process.env.PRIVATE_KEY!],
      chainId: 42220,
    },
    base: {
      type: "http",
      url: process.env.BASE_RPC ?? "https://mainnet.base.org",
      accounts: [process.env.PRIVATE_KEY!],
      chainId: 8453,
    },
    baseSepolia: {
      type: "http",
      url: process.env.BASE_SEPOLIA_RPC ?? "https://sepolia.base.org",
      accounts: [process.env.PRIVATE_KEY!],
      chainId: 84532,
    },
  },
  sourcify: {
    enabled: true,
  },
};

export default config;