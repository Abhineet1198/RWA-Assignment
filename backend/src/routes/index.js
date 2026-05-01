import express from "express";
import { balanceController } from "../controllers/balance.controller.js";
import { previewController } from "../controllers/preview.controller.js";
import { transactionController } from "../controllers/transaction.controller.js";

const router = express.Router();

router.get("/balance/:address", balanceController);
router.post("/deposit-preview", previewController);
router.get("/transactions", transactionController);

export default router;