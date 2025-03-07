import BudgetCategory from "../models/BudgetCategory.js";

//  Create Budget Category
export const createCategory = async (req, res) => {
    try {
        const { name, limit } = req.body;
        const { budgetId } = req.params;

        // Make sure that 'name' and 'limit' are provided
        if (!name || !limit) {
            return res.status(400).json({ message: "Name and limit are required." });
        }

        // Create the new category
        const newCategory = new BudgetCategory({
            budgetId,
            name,
            limit
        });

        // Save the new category
        const savedCategory = await newCategory.save();
        res.status(201).json(savedCategory);  // Send back the created category
    } catch (error) {
        console.error("Error creating category:", error);
        res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
};

//  Get Budget Categories
export const getCategories = async (req, res) => {
    try {
        const categories = await BudgetCategory.find({ budgetId: req.params.budgetId });
        res.json(categories);
    } catch (error) {
        res.status(500).json({ message: "Error fetching categories", error: error.message });
    }
};

// Update Budget Category
export const updateCategory = async (req, res) => {
    try {
        const updatedCategory = await BudgetCategory.findOneAndUpdate(
            { _id: req.params.categoryId },
            req.body,
            { new: true }
        );
        res.json(updatedCategory);
    } catch (error) {
        res.status(500).json({ message: "Error updating category", error: error.message });
    }
};

// 📌 Delete Budget Category
export const deleteCategory = async (req, res) => {
    try {
        await BudgetCategory.findOneAndDelete({ _id: req.params.categoryId });
        res.json({ message: "Category deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Error deleting category", error: error.message });
    }
};
