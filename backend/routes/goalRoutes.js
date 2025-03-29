import express from 'express';
const router = express.Router();
import Goal from '../models/Goal.js';
import Expense from '../models/Expense.js';

// Get all goals for a user
router.get('/:userId', async (req, res) => {
  try {
    const goals = await Goal.find({ userId: req.params.userId });
    res.json(goals);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch goals.' });
  }
});

// Create a new goal
router.post('/:userId', async (req, res) => {
  try {
    const { title, targetAmount, currentAmount, deadline, description } = req.body;

    const goal = new Goal({
      userId: req.params.userId,
      title,
      targetAmount,
      currentAmount,
      deadline,
      description,
    });

    const savedGoal = await goal.save();
    res.status(201).json(savedGoal);
  } catch (err) {
    res.status(500).json({ message: 'Failed to create goal.' });
  }
});

router.put('/:userId/:goalId/contribute', async (req, res) => {
    try {
      const { amount } = req.body;
      const { userId, goalId } = req.params;
  
      const goal = await Goal.findOne({ _id: goalId, userId });
  
      if (!goal) return res.status(404).json({ message: 'Goal not found' });
  
      goal.currentAmount += Number(amount);
      await goal.save();
  
      // Add an expense entry
      const expense = new Expense({
        userId,
        amount,
        categoryId: null, // optionally assign a "Savings" category
        description: `Contribution to goal: ${goal.title}`,
        date: new Date(),
        goalId: goal._id
      });
      await expense.save();
  
      res.json({ goal, expense });
    } catch (error) {
      console.error("Contribution error:", error);
      res.status(500).json({ message: 'Failed to contribute to goal.' });
    }
  });
  

export default router;

