import SavingGoal from "../models/SavingGoal.js";
import Saving from "../models/Saving.js";

export const createGoal = async (req, res) => {
  try {
    const { userId } = req.params;
    const { title, targetAmount, targetDate, description } = req.body;
    const goal = await SavingGoal.create({ userId, title, targetAmount, targetDate, description });
    res.status(201).json(goal);
  } catch (err) {
    if (err.code === 11000) return res.status(400).json({ message: "Title already exists." });
    res.status(500).json({ message: "Failed to create goal" });
  }
};

export const getGoals = async (req, res) => {
  try {
    const { userId } = req.params;
    const goals = await SavingGoal.find({ userId, isArchived: false }).sort({ createdAt: -1 });
    res.json(goals);
  } catch {
    res.status(500).json({ message: "Failed to fetch goals" });
  }
};

export const getGoalSummaries = async (req, res) => {
  try {
    const { userId } = req.params;

    const totals = await Saving.aggregate([
      { $match: { userId: new (await import("mongoose")).default.Types.ObjectId(userId) } },
      { $group: { _id: "$goalId", saved: { $sum: "$amount" } } }
    ]);

    const map = new Map(totals.map(t => [String(t._id), t.saved]));
    const goals = await SavingGoal.find({ userId, isArchived: false });

    const result = goals.map(g => {
      const saved = map.get(String(g._id)) || 0;
      const progress = g.targetAmount ? Math.min(saved / g.targetAmount, 1) : 0;

      let status = "On Track";
      if (g.targetAmount && saved >= g.targetAmount) status = "Completed";
      else if (g.targetDate && g.targetDate < new Date()) status = "Overdue";

      return {
        _id: g._id,
        title: g.title,
        targetAmount: g.targetAmount,
        targetDate: g.targetDate,
        description: g.description,
        saved,
        progress,
        status,
      };
    });

    res.json(result);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch goal summaries" });
  }
};
