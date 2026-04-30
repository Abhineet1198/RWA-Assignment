import { getBalance } from "../services/balance.service.js";

export const balanceController = async (req, res) => {
  try {
    const { address } = req.params;

    if (!address) {
      return res.status(400).json({ error: "Address required" });
    }

    const _balance = await getBalance(address);
    const balance = parseFloat(_balance) / 1e18; // Convert from wei to ether


    res.json({ success: true, tokenBalance: balance});
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch balance" });
  }
};