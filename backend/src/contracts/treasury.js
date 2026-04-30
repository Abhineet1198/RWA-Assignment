import { ethers } from "ethers";
import { ENV } from "../config/env.js";
import {provider} from "../config/blockchain.js";
import abi from "./abi/treasury.json" with { type: "json" };

export const treasury = new ethers.Contract(
  ENV.TREASURY_ADDRESS,
  abi,
  provider
);