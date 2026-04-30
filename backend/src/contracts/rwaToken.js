import { ethers } from "ethers";
import { ENV } from "../config/env.js";
import { provider } from "../config/blockchain.js";
import abi from "./abi/rwaToken.json" with { type: "json" };

export const rwaToken = new ethers.Contract(
  ENV.TOKEN_ADDRESS,
  abi,
  provider
);