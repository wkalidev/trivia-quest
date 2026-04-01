import { HardhatUserConfig } from "hardhat/config";
import hardhatToolboxViem from "@nomicfoundation/hardhat-toolbox-viem";
import * as dotenv from "dotenv";
dotenv.config();

const config: HardhatUserConfig = {
  plugins: [hardhatToolboxViem],
  solidity: "0.8.20",
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
  },
};

export default config;