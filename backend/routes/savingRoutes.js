import express from "express";
import { createSaving, getSavings, deleteSaving } from "../controllers/savingController.js";

const router = express.Router();
router.post("/:userId", createSaving);              
router.get("/:userId", getSavings);                 
router.delete("/:userId/:savingId", deleteSaving);
export default router;
