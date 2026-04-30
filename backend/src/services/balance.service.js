import { rwaToken } from "../contracts/rwaToken.js";

export const getBalance = async (address) => {
  const balance = await rwaToken.balanceOf(address);
  return balance.toString();
};