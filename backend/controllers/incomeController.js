import Income from "../models/Income.js";

// Create Income
export const createIncome = async (req, res) => {
    try {
        const { source, amount, date, description } = req.body;
        const userId = req.params.userId;

        if (!source || !amount) {
            return res.status(400).json({ message: "Source and Amount are required." });
        }

        const income = new Income({ userId, source, amount, date, description });
        await income.save();
        res.status(201).json(income);
    } catch (error) {
        res.status(500).json({ message: "Error creating income", error: error.message });
    }
};

// Get All Income
export const getIncome = async (req, res) => {
    try {
        const income = await Income.find({ userId: req.params.userId });
        res.json(income);
    } catch (error) {
        res.status(500).json({ message: "Error fetching income", error: error.message });
    }
};

// Update Income
export const updateIncome = async (req, res) => {
    try {
        const updatedIncome = await Income.findOneAndUpdate(
            { _id: req.params.incomeId, userId: req.params.userId },
            req.body,
            { new: true }
        );
        res.json(updatedIncome);
    } catch (error) {
        res.status(500).json({ message: "Error updating income", error: error.message });
    }
};

// Delete Income
export const deleteIncome = async (req, res) => {
    try {
        await Income.findOneAndDelete({ _id: req.params.incomeId, userId: req.params.userId });
        res.json({ message: "Income deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Error deleting income", error: error.message });
    }
};