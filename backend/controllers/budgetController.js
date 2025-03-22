import Budget from "../models/budget.js";
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
        const { startDate, endDate } = req.query; // Get date range from query parameters

        // Build the query object
        const query = { userId: req.params.userId };

        // Add date range filtering if provided
        if (startDate && endDate) {
            query.startDate = { $gte: new Date(startDate) }; // Greater than or equal to startDate
            query.endDate = { $lte: new Date(endDate) };     // Less than or equal to endDate
        }

        const budget = await Budget.findOne(query).populate("categories");
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

