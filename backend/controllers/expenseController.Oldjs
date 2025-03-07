import Expense from '../models/Expense.js';

// Function to get all expenses for a user
export const getExpenses = async (req, res) => {
    try {
        const expenses = await Expense.find({ userId: req.user.id });
        res.status(200).json(expenses);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching expenses', error: error.message });
    }
};

// Function to create a new expense
export const createExpense = async (req, res) => {
    const { name, amount, category, date, description } = req.body;

    try {
        const newExpense = new Expense({
            userId: req.user.id, // The ID of the logged-in user
            name,
            amount,
            category,
            date,
            description,
        });

        await newExpense.save();

        res.status(201).json({
            message: 'Expense created successfully!',
            expense: newExpense
        });
    } catch (error) {
        res.status(500).json({ message: 'Error creating expense', error: error.message });
    }
};

// Function to update an expense
export const updateExpense = async (req, res) => {
    const { expenseId } = req.params;
    const { name, amount, category, date, description } = req.body;

    try {
        const updatedExpense = await Expense.findByIdAndUpdate(
            expenseId,
            { name, amount, category, date, description },
            { new: true }
        );

        if (!updatedExpense) {
            return res.status(404).json({ message: 'Expense not found' });
        }

        res.status(200).json({ message: 'Expense updated successfully!', expense: updatedExpense });
    } catch (error) {
        res.status(500).json({ message: 'Error updating expense', error: error.message });
    }
};

// Function to delete an expense
export const deleteExpense = async (req, res) => {
    const { expenseId } = req.params;

    try {
        const deletedExpense = await Expense.findByIdAndDelete(expenseId);

        if (!deletedExpense) {
            return res.status(404).json({ message: 'Expense not found' });
        }

        res.status(200).json({ message: 'Expense deleted successfully!' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting expense', error: error.message });
    }
};
