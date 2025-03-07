import express from "express";
import { createExpense, getExpenses, getExpense, updateExpense, deleteExpense } from "../controllers/expenseController.js";

const router = express.Router();

router.post("/:userId", createExpense);
router.get("/:userId", getExpenses);
router.get("/:userId/:expenseId", getExpense);
router.put("/:userId/:expenseId", updateExpense);
router.delete("/:userId/:expenseId", deleteExpense);

export default router;
