import mongoose from "mongoose";
import SavingGoal from "../models/SavingGoal.js";
import Saving from "../models/Saving.js";

const ensureValidObjectId = (id) => mongoose.isValidObjectId(id);

export const createGoal = async (req, res) => {
  try {
    const { userId } = req.params;
    if (!ensureValidObjectId(userId)) {
      return res.status(400).json({ message: "Invalid userId" });
    }

    const { title, targetAmount, targetDate, description } = req.body;

    const doc = await SavingGoal.create({
      userId,
      title,
      targetAmount: targetAmount != null ? Number(targetAmount) : undefined,
      targetDate: targetDate ? new Date(targetDate) : undefined,
      description,
    });

    return res.status(201).json(doc);
  } catch (err) {
    if (err?.code === 11000) {
      return res.status(400).json({ message: "Title already exists." });
    }
    if (err?.name === "ValidationError") {
      return res.status(400).json({ message: err.message });
    }
    return res.status(500).json({ message: "Failed to create goal" });
  }
};

export const getGoals = async (req, res) => {
  try {
    const { userId } = req.params;
    if (!ensureValidObjectId(userId)) {
      return res.status(400).json({ message: "Invalid userId" });
    }

    const goals = await SavingGoal
      .find({ userId, isArchived: false })
      .sort({ createdAt: -1 });

    return res.json(goals);
  } catch (err) {
    return res.status(500).json({ message: "Failed to fetch goals" });
  }
};

export const getGoalSummaries = async (req, res) => {
  try {
    const { userId } = req.params;
    if (!ensureValidObjectId(userId)) {
      return res.status(400).json({ message: "Invalid userId" });
    }

    const totals = await Saving.aggregate([
      { $match: { userId: new mongoose.Types.ObjectId(userId) } },
      { $group: { _id: "$goalId", saved: { $sum: "$amount" } } },
    ]);

    const savedMap = new Map(totals.map((t) => [String(t._id), t.saved]));

    const goals = await SavingGoal.find({ userId, isArchived: false });

    const result = goals.map((g) => {
      const saved = savedMap.get(String(g._id)) || 0;
      const target = Number(g.targetAmount || 0);
      const progress = target > 0 ? Math.min(saved / target, 1) : 0;

      let status = "On Track";
      if (target > 0 && saved >= target) status = "Completed";
      else if (g.targetDate && g.targetDate < new Date()) status = "Overdue";

      return {
        _id: g._id,
        title: g.title,
        targetAmount: target,
        targetDate: g.targetDate,
        description: g.description,
        saved,
        progress,
        status,
      };
    });

    return res.json(result);
  } catch (err) {
    return res.status(500).json({ message: "Failed to fetch goal summaries" });
  }
};

export const deleteGoal = async (req, res) => {
  try {
    const { userId, goalId } = req.params;
    if (!ensureValidObjectId(userId) || !ensureValidObjectId(goalId)) {
      return res.status(400).json({ message: "Invalid id" });
    }

    const goal = await SavingGoal.findOne({ _id: goalId, userId });
    if (!goal) return res.status(404).json({ message: "Goal not found" });

    await Saving.deleteMany({ userId, goalId });
    await SavingGoal.findByIdAndDelete(goalId);

    return res.json({ message: "Goal deleted successfully" });
  } catch (err) {
    return res.status(500).json({ message: "Failed to delete goal" });
  }
};