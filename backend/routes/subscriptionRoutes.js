import express from "express";
import {
  getSubscriptions,
  createSubscription,
  updateSubscription,
  deleteSubscription,
} from "../controllers/subscriptionController.js";

const router = express.Router();

// /api/subscriptions/:userId
router.get("/:userId", getSubscriptions);
router.post("/:userId", createSubscription);
router.put("/:userId/:subId", updateSubscription);
router.delete("/:userId/:subId", deleteSubscription);

export default router;
