import Budget from "../models/Budget.js";

// 📌 Create or Update Budget
export const createOrUpdateBudget = async (req, res) => {
    try {
        const { totalBudget, categories } = req.body;
        const budget = await Budget.findOneAndUpdate(
            { userId: req.params.userId },
            { totalBudget, categories },
            { new: true, upsert: true }
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
        await Budget.findOneAndDelete({ userId: req.params.userId });
        res.json({ message: "Budget deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Error deleting budget", error: error.message });
    }
};
