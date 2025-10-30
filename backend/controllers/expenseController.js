import Expense from "../models/Expense.js";
import BudgetCategory from '../models/BudgetCategory.js';
import Goal from "../models/Goal.js";
import User from '../models/user.js';
import Notification from "../models/notification.js";


// Function to get start and end of month
const monthRange = (d) => {
    const date = d ? new Date(d) : new Date();
    const start = new Date(date.getFullYear(), date.getMonth(), 1, 0, 0, 0, 0);
    const end   = new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59, 999);
    return { start, end };
};

// 📌 Create Expense
export const createExpense = async (req, res) => {
    try {
        const { categoryId, amount, description, date, goalId, paymentMethod } = req.body; // Include paymentMethod

        // Ensure the date is valid
        if (new Date(date) > new Date()) {
            return res.status(400).json({ message: "Expense date cannot be in the future." });
        }

        const category = await BudgetCategory.findById(categoryId);
        if (!category) {
            return res.status(400).json({ message: "Invalid category ID." });
        }
        const user = await User.findById(req.params.userId).select('role spendingLimit monthlyBudget');
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        
        // Parent-set limit if the user is Child
        if (user.role === 'Child') {
            const amt = Number(amount) || 0;

            // 1) Per-transaction spending limit (0 means no limit)
            if (user.spendingLimit > 0 && amt > user.spendingLimit) {
                return res.status(400).json({
                    message: `This transaction exceeds your spending limit ($${user.spendingLimit.toFixed(2)}).`
                });
            }

            // 2) Monthly budget cap (0 means no cap)
            if (user.monthlyBudget > 0) {
                const { start, end } = monthRange(date);
                const monthExpenses = await Expense.find({
                    userId: req.params.userId,
                    date: { $gte: start, $lte: end }
                }).select('amount');

                const spent = monthExpenses.reduce((s, e) => s + Number(e.amount || 0), 0);
                if (spent + amt > user.monthlyBudget) {
                    const remaining = Math.max(0, user.monthlyBudget - spent);
                    return res.status(400).json({
                        message: `This expense would exceed your monthly budget. Remaining: $${remaining.toFixed(2)} of $${user.monthlyBudget.toFixed(2)}.`
                    });
                }
            }
        }

        const expense = new Expense({
            userId: req.params.userId,
            categoryId,
            amount,
            description,
            date,
            goalId: goalId || null,
            paymentMethod // Save paymentMethod
        });
        await expense.save();

        const notification = new Notification({
            userId: req.params.userId,
            message: `New expense of $${amount.toFixed(2)} added in category "${category.name}".`,
            type: "expense"
        });
        console.log("✅ Expense saved, creating notification for user", req.params.userId);
        await notification.save();

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
};

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

        // Explicitly include paymentMethod in the query
        const expenses = await Expense.find(query).populate('categoryId').select('+paymentMethod');
        res.json(expenses.map(expense => {
            const expenseObj = expense.toObject(); // Convert to plain object
            return {
                ...expenseObj,
                paymentMethod: expenseObj.paymentMethod // Access paymentMethod safely
            };
        }));
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
        const { categoryId, amount, description, date, goalId, paymentMethod } = req.body;

        // Ensure the date is valid
        if (new Date(date) > new Date()) {
            return res.status(400).json({ message: "Expense date cannot be in the future." });
        }

        const updatedExpense = await Expense.findOneAndUpdate(
            { _id: expenseId, userId: userId },
            { categoryId, amount, description, date, goalId, paymentMethod },
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
