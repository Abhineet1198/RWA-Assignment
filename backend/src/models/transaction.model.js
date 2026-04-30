import mongoose from "mongoose";

const transactionSchema = new mongoose.Schema(
  {
    user: { type: String, required: true, index: true },
    ethAmount: { type: String, required: true },
    tokensMinted: { type: String, required: true },
    txHash: { type: String, required: true, unique: true },
    blockNumber: { type: Number, required: true, index: true }
  },
  { timestamps: true }
);


export const Transaction = mongoose.model(
  "Transaction",
  transactionSchema
);