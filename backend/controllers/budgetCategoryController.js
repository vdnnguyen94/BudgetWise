import BudgetCategory from "../models/BudgetCategory.js";

//  Create Budget Category
export const createCategory = async (req, res) => {
    try {
        const { budgetId, name, limit } = req.body;
        const category = new BudgetCategory({ budgetId, name, limit });
        await category.save();
        res.status(201).json(category);
    } catch (error) {
        res.status(500).json({ message: "Error creating category", error: error.message });
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
