import { previewDeposit } from "../services/preview.service.js";
import { formatEther } from "ethers";

export const previewController = async (req, res) => {
  try {
    const { amount } = req.body;

    if (!amount || isNaN(amount)) {
      return res.status(400).json({ error: "Invalid amount" });
    }

    const tokens = await previewDeposit(amount);

    const formattedTokens = formatEther(tokens);
    

    res.json({
      success: true,
      tokens: formattedTokens
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Preview failed" });
  }
};