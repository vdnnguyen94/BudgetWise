import express from "express";
import { createOrUpdateBudget, getBudget, deleteBudget } from "../controllers/budgetController.js";

const router = express.Router();

router.post("/:userId", createOrUpdateBudget);
router.get("/:userId", getBudget);
router.delete("/:budgetId", deleteBudget);

export default router;
