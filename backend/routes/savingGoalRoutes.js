import express from "express";
import { createGoal, getGoals, getGoalSummaries } from "../controllers/savingGoalController.js";

const router = express.Router();
router.post("/:userId", createGoal);
router.get("/:userId", getGoals);
router.get("/:userId/summary", getGoalSummaries);
export default router;
