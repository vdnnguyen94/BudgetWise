import express from "express";
import {
  createAlert,
  getAlertsForUser,
  updateAlertStatus,
  deleteAlert,
} from "../controllers/alertController.js";
// If you want to protect them later:
// import { authenticate } from "../middleware/authMiddleware.js";

const router = express.Router();

// Optionally add `authenticate` in front of handlers
router.post("/:userId", createAlert);
router.get("/:userId", getAlertsForUser);
router.patch("/:userId/:alertId", updateAlertStatus);
router.delete("/:userId/:alertId", deleteAlert);

export default router;
