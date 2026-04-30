import { getTransactions } from "../services/transaction.service.js";

export const transactionController = async (req, res) => {
  try {
    let { limit = 10, offset = 0 } = req.query;

    limit = parseInt(limit, 10);
    offset = parseInt(offset, 10);

    if (isNaN(limit) || limit <= 0) limit = 10;
    if (isNaN(offset) || offset < 0) offset = 0;

    const result = await getTransactions({ limit, offset });

    return res.status(200).json(result);

  } catch (err) {
    console.error("Controller Error:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch transactions"
    });
  }
};