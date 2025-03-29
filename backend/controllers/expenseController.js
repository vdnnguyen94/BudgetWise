import Expense from "../models/Expense.js";
import BudgetCategory from '../models/BudgetCategory.js';
import Goal from "../models/Goal.js";

// 📌 Create Expense
export const createExpense = async (req, res) => {
    try {
        const { categoryId, amount, description, date, goalId } = req.body; // Get date from the request body

        // Ensure the date is valid
        if (new Date(date) > new Date()) {
            return res.status(400).json({ message: "Expense date cannot be in the future." });
        }

        const category = await BudgetCategory.findById(categoryId);
        if (!category) {
            return res.status(400).json({ message: "Invalid category ID." });
        }

        const expense = new Expense({
            userId: req.params.userId,
            categoryId,
            amount,
            description,
            date,
            goalId: goalId || null
        });
        await expense.save();

        if (goalId) {
            const goal = await Goal.findById(goalId);
            if (goal) {
                goal.currentAmount += amount;
                await goal.save();
            }
        }

        res.status(201).json(expense);  // Return the created expense
    } catch (error) {
        res.status(500).json({ message: "Error creating expense", error: error.message });
    }
};;

// 📌 Get All Expenses for a User
export const getExpenses = async (req, res) => {
    try {
        const { startDate, endDate } = req.query; // Get date range from query parameters

        // Build the query object
        const query = { userId: req.params.userId };

        // Add date range filtering if provided
        if (startDate && endDate) {
            query.date = {
                $gte: new Date(startDate), // Greater than or equal to startDate
                $lte: new Date(endDate)    // Less than or equal to endDate
            };
        }

        const expenses = await Expense.find(query).populate('categoryId');
        res.json(expenses);
    } catch (error) {
        res.status(500).json({ message: "Error fetching expenses", error: error.message });
    }
};

// 📌 Get Single Expense
export const getExpense = async (req, res) => {
    try {
        const expense = await Expense.findOne({ _id: req.params.expenseId, userId: req.params.userId });
        if (!expense) return res.status(404).json({ message: "Expense not found" });
        res.json(expense);
    } catch (error) {
        res.status(500).json({ message: "Error fetching expense", error: error.message });
    }
};

// In expenseController.js
export const updateExpense = async (req, res) => {
    try {
        const { expenseId, userId } = req.params;
        const { category, amount, description, date } = req.body;

        // Ensure the date is valid
        if (new Date(date) > new Date()) {
            return res.status(400).json({ message: "Expense date cannot be in the future." });
        }

        const updatedExpense = await Expense.findOneAndUpdate(
            { _id: expenseId, userId: userId },
            { category, amount, description, date },  // Update with the new date
            { new: true }  // This ensures the updated data is returned
        );

        if (!updatedExpense) {
            return res.status(404).json({ message: "Expense not found" });
        }

        res.json(updatedExpense);  // Return the updated expense
    } catch (error) {
        res.status(500).json({ message: "Error updating expense", error: error.message });
    }
};



// 📌 Delete Expense
export const deleteExpense = async (req, res) => {
    try {
        await Expense.findOneAndDelete({ _id: req.params.expenseId, userId: req.params.userId });
        res.json({ message: "Expense deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Error deleting expense", error: error.message });
    }
};
