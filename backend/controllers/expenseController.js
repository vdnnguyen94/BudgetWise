import Expense from "../models/Expense.js";

// 📌 Create Expense
export const createExpense = async (req, res) => {
    try {
        const { categoryId, amount, description, date } = req.body; // Get date from the request body

        // Ensure the date is valid
        if (new Date(date) > new Date()) {
            return res.status(400).json({ message: "Expense date cannot be in the future." });
        }

        const expense = new Expense({
            userId: req.params.userId,
            categoryId,
            amount,
            description,
            date
        });
        await expense.save();

        res.status(201).json(expense);  // Return the created expense
    } catch (error) {
        res.status(500).json({ message: "Error creating expense", error: error.message });
    }
};;

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
