import express from "express";
import { createCategory, getCategories, updateCategory, deleteCategory } from "../controllers/budgetCategoryController.js";

const router = express.Router();

router.post("/:budgetId/category", createCategory);
router.get("/:budgetId/category", getCategories);
router.put("/:budgetId/category/:categoryId", updateCategory);
router.delete("/:budgetId/category/:categoryId", deleteCategory);

export default router;
