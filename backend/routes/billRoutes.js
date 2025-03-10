import express from "express";
import { createBill, getBills, getBill, updateBill, deleteBill } from "../controllers/billController.js";

const router = express.Router();

router.post("/:userId", createBill);
router.get("/:userId", getBills);
router.get("/:userId/:billId", getBill);
router.put("/:userId/:billId", updateBill);
router.delete("/:userId/:billId", deleteBill);

export default router;
