import Budget from "../models/Budget.js";
import BudgetCategory from "../models/BudgetCategory.js";

// 📌 Create or Update Budget
// 📌 Create or Update Budget
export const createOrUpdateBudget = async (req, res) => {
    try {
        const { totalBudget } = req.body;

        const budget = await Budget.findOneAndUpdate(
            { userId: req.params.userId },
            { totalBudget },
            { new: true, upsert: true }  // If budget doesn't exist, create it
        );

        res.status(201).json(budget);
    } catch (error) {
        res.status(500).json({ message: "Error creating/updating budget", error: error.message });
    }
};

// 📌 Get User Budget
export const getBudget = async (req, res) => {
    try {
        const budget = await Budget.findOne({ userId: req.params.userId }).populate("categories");
        if (!budget) return res.status(404).json({ message: "Budget not found" });
        res.json(budget);
    } catch (error) {
        res.status(500).json({ message: "Error fetching budget", error: error.message });
    }
};

// 📌 Delete Budget


export const deleteBudget = async (req, res) => {
    try {
        // Use the budgetId from the request params
        const budgetId = req.params.budgetId;

        // Delete associated categories first
        await BudgetCategory.deleteMany({ budgetId: budgetId });

        // Now delete the budget
        const deletedBudget = await Budget.findByIdAndDelete(budgetId);
        if (!deletedBudget) {
            return res.status(404).json({ message: "Budget not found" });
        }

        res.status(200).json({ message: "Budget and associated categories deleted" });
    } catch (error) {
        console.error("Error deleting budget and categories:", error);
        res.status(500).json({ message: "Error deleting budget", error: error.message });
    }
};

