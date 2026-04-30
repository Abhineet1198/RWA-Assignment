import { ethers } from "ethers";
import { ENV } from "../config/env.js";
import abi from "../contracts/abi/treasury.json" with { type: "json" };
import { Transaction } from "../models/transaction.model.js";
const BLOCK_RANGE = 1000;
const RPC_URL = "wss://bsc-testnet.publicnode.com";


export const startEventListener = async () => {
  const provider = new ethers.WebSocketProvider(RPC_URL);

  const contract = new ethers.Contract(
    ENV.TREASURY_ADDRESS,
    abi,
    provider
  );

  console.log("Listening to Deposited events...");

  // 1. INITIAL SYNC
  try {
    const latestBlock = await provider.getBlockNumber();
    const fromBlock = latestBlock - 10000;

    for (let start = fromBlock; start <= latestBlock; start += BLOCK_RANGE) {
      const end = Math.min(start + BLOCK_RANGE - 1, latestBlock);

      const events = await contract.queryFilter(
        contract.filters.Deposited(),
        start,
        end
      );

      for (const e of events) {
        try {
          await Transaction.updateOne(
            { txHash: e.transactionHash },
            {
              $setOnInsert: {
                user: e.args.user,
                ethAmount: e.args.ethAmount.toString(),
                tokensMinted: e.args.tokensMinted.toString(),
                txHash: e.transactionHash,
                blockNumber: e.blockNumber
              }
            },
            { upsert: true }
          );
        } catch (err) {
          console.error("Sync error:", err.message);
        }
      }
    }

    console.log("Initial sync completed");

  } catch (err) {
    console.error("Initial sync failed:", err.message);
  }

  // 2. REAL-TIME LISTENER
  contract.on("Deposited", async (user, ethAmount, tokensMinted, event) => {
    try {
      await Transaction.updateOne(
        { txHash: event.log.transactionHash },
        {
          $setOnInsert: {
            user,
            ethAmount: ethAmount.toString(),
            tokensMinted: tokensMinted.toString(),
            txHash: event.log.transactionHash,
            blockNumber: event.log.blockNumber
          }
        },
        { upsert: true }
      );

      console.log("New Deposit:", event.log.transactionHash);

    } catch (err) {
      console.error("Realtime save error:", err.message);
    }
  });

  // Error handling
  provider.on("error", (err) => {
    console.error("WebSocket Error:", err.message);
  });

  provider._websocket?.on("close", () => {
    console.log("Reconnecting WebSocket...");
    setTimeout(startEventListener, 3000);
  });
};