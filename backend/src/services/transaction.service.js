import { Transaction } from "../models/transaction.model.js";

export const getTransactions = async ({ limit = 10, offset = 0 }) => {
  const data = await Transaction.find()
    .sort({ blockNumber: -1 })
    .skip(offset)
    .limit(limit)
    .lean();

  const count = await Transaction.countDocuments();

  return {
    success: true,
    count,
    data
  };
};