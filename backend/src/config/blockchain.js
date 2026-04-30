import { ethers } from "ethers";
import { ENV } from "./env.js";

export const provider = new ethers.JsonRpcProvider(ENV.RPC_URL);
// export const wallet = new ethers.Wallet(ENV.PRIVATE_KEY, provider);