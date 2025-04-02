import express from "express";
import { getReport } from "../controllers/reportController.js";

const router = express.Router();

router.get("/:userId/report/:month", getReport); // e.g. /api/reports/123/report/2025-04

export default router;
