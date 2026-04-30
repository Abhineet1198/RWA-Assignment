import { treasury } from "../contracts/treasury.js";
import { parseEther } from "ethers";

export const previewDeposit = async (ethInput) => {
  const amount = parseEther(ethInput); 
  const rate = await treasury.rate();
  const tokens = amount * rate; 

  return tokens;
};