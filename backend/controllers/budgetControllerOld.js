import Budget from '../models/budget.js';

// Function to get all budgets for a user
export const getBudgets = async (req, res) => {
    try {
        const budgets = await Budget.find({ userId: req.user.id });
        res.status(200).json(budgets);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching budgets', error: error.message });
    }
};

// Function to create a new budget
export const createBudget = async (req, res) => {
    const { name, totalBudget, category, startDate, endDate } = req.body;

    try {
        const newBudget = new Budget({
            userId: req.user.id, // The ID of the logged-in user
            name,
            totalBudget,
            category,
            startDate,
            endDate,
        });

        await newBudget.save();

        res.status(201).json({
            message: 'Budget created successfully!',
            budget: newBudget
        });
    } catch (error) {
        res.status(500).json({ message: 'Error creating budget', error: error.message });
    }
};

// Function to update a budget
export const updateBudget = async (req, res) => {
    const { budgetId } = req.params;
    const { name, totalBudget, category, startDate, endDate } = req.body;

    try {
        const updatedBudget = await Budget.findByIdAndUpdate(
            budgetId,
            { name, totalBudget, category, startDate, endDate },
            { new: true }
        );

        if (!updatedBudget) {
            return res.status(404).json({ message: 'Budget not found' });
        }

        res.status(200).json({ message: 'Budget updated successfully!', budget: updatedBudget });
    } catch (error) {
        res.status(500).json({ message: 'Error updating budget', error: error.message });
    }
};

// Function to delete a budget
export const deleteBudget = async (req, res) => {
    const { budgetId } = req.params;

    try {
        const deletedBudget = await Budget.findByIdAndDelete(budgetId);

        if (!deletedBudget) {
            return res.status(404).json({ message: 'Budget not found' });
        }

        res.status(200).json({ message: 'Budget deleted successfully!' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting budget', error: error.message });
    }
};
