import Saving from "../models/Saving.js";

export const createSaving = async (req, res) => {
  try {
    const { userId } = req.params;
    const { goalId, amount, date, description } = req.body;
    if (!goalId) return res.status(400).json({ message: "goalId is required" });

    const saving = await Saving.create({ userId, goalId, amount, date, description });
    res.status(201).json(saving);
  } catch (err) {
    res.status(500).json({ message: "Failed to create saving" });
  }
};

export const getSavings = async (req, res) => {
  try {
    const { userId } = req.params;
    const savings = await Saving.find({ userId }).sort({ date: -1 });
    res.json(savings);
  } catch {
    res.status(500).json({ message: "Failed to fetch savings" });
  }
};

export const deleteSaving = async (req, res) => {
  try {
    const { userId, savingId } = req.params;
    await Saving.deleteOne({ _id: savingId, userId });
    res.json({ message: "Deleted successfully" });
  } catch {
    res.status(500).json({ message: "Failed to delete saving" });
  }
};