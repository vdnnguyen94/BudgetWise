import Expense from "../models/Expense.js";

// 📌 Create Expense
export const createExpense = async (req, res) => {
    try {
        const { category, amount, description } = req.body;
        const expense = new Expense({ userId: req.params.userId, category, amount, description });
        await expense.save();
        res.status(201).json(expense);
    } catch (error) {
        res.status(500).json({ message: "Error creating expense", error: error.message });
    }
};

// 📌 Get All Expenses for a User
export const getExpenses = async (req, res) => {
    try {
        const expenses = await Expense.find({ userId: req.params.userId });
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

// 📌 Update Expense
export const updateExpense = async (req, res) => {
    try {
        const updatedExpense = await Expense.findOneAndUpdate(
            { _id: req.params.expenseId, userId: req.params.userId },
            req.body,
            { new: true }
        );
        res.json(updatedExpense);
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
