import Goal from '../models/Goal.js';
import Expense from '../models/Expense.js';

function evaluateAlerts(goal) {
  const alerts = [];
  const pct = goal.targetAmount > 0
    ? Math.floor((goal.currentAmount / goal.targetAmount) * 100)
    : 0;

  for (const p of goal.alertPercentages || []) {
    if (pct >= p && !(goal.alertedPercents || []).includes(p)) {
      alerts.push({ type: 'milestone', percent: p, message: `Reached ${p}% for "${goal.title}"` });
    }
  }

  if (goal.deadline && goal.alertBeforeDays != null) {
    const msPerDay = 24 * 60 * 60 * 1000;
    const daysLeft = Math.ceil((new Date(goal.deadline).getTime() - Date.now()) / msPerDay);
    const alreadyAlertedToday =
      goal.lastDeadlineAlertDate &&
      new Date(goal.lastDeadlineAlertDate).toDateString() === new Date().toDateString();

    if (daysLeft <= goal.alertBeforeDays && daysLeft >= 0 && !alreadyAlertedToday) {
      alerts.push({ type: 'deadline', daysLeft, message: `"${goal.title}" is due in ${daysLeft} day(s)` });
    }
  }
  return alerts;
}

function normalizeGoalPayload(body) {
  const toNum = (v, fb = 0) => {
    const n = Number(v);
    return Number.isFinite(n) ? n : fb;
  };
  const toInt = (v, fb = 0) => {
    const n = parseInt(v, 10);
    return Number.isFinite(n) ? n : fb;
  };
  const toPercArray = (v) => {
    if (Array.isArray(v)) return v.map(Number).filter(Number.isFinite);
    if (typeof v === 'string') {
      return v
        .split(/[,\s]+/)
        .map((x) => parseInt(x, 10))
        .filter((x) => Number.isFinite(x));
    }
    return undefined;
  };

  const payload = {};
  if ('title' in body) payload.title = String(body.title ?? '').trim();
  if ('targetAmount' in body) payload.targetAmount = toNum(body.targetAmount, 0);
  if ('currentAmount' in body) payload.currentAmount = toNum(body.currentAmount, 0);
  if ('deadline' in body && body.deadline) payload.deadline = new Date(body.deadline);
  if ('description' in body) payload.description = String(body.description ?? '');

  if ('alertPercentages' in body) {
    const arr = toPercArray(body.alertPercentages);
    if (arr && arr.length) payload.alertPercentages = arr;
  }
  if ('alertBeforeDays' in body) payload.alertBeforeDays = toInt(body.alertBeforeDays, 7);

  return payload;
}

export const getGoals = async (req, res) => {
  try {
    const goals = await Goal.find({ userId: req.params.userId });
    res.json(goals);
  } catch {
    res.status(500).json({ message: 'Failed to fetch goals.' });
  }
};

export const createGoal = async (req, res) => {
  try {
    const normalized = normalizeGoalPayload(req.body);
    const goal = new Goal({ userId: req.params.userId, ...normalized });
    const savedGoal = await goal.save();
    res.status(201).json(savedGoal);
  } catch {
    res.status(500).json({ message: 'Failed to create goal.' });
  }
};

export const contributeToGoal = async (req, res) => {
  try {
    const { amount } = req.body;
    const { userId, goalId } = req.params;

    const numericAmount = Number(amount);
    if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
      return res.status(400).json({ message: 'Amount must be a positive number.' });
    }

    const goal = await Goal.findOne({ _id: goalId, userId });
    if (!goal) return res.status(404).json({ message: 'Goal not found' });

    goal.currentAmount = Number(goal.currentAmount || 0) + numericAmount;
    await goal.save();

    const expense = new Expense({
      userId,
      amount: numericAmount,
      categoryId: null,
      description: `Contribution to goal: ${goal.title}`,
      date: new Date(),
      goalId: goal._id
    });
    await expense.save();

    const alerts = evaluateAlerts(goal);
    if (alerts.length) {
      const newPercents = new Set(goal.alertedPercents || []);
      let newDeadlineAlertDate = goal.lastDeadlineAlertDate;

      for (const a of alerts) {
        if (a.type === 'milestone') newPercents.add(a.percent);
        if (a.type === 'deadline') newDeadlineAlertDate = new Date();
      }
      goal.alertedPercents = Array.from(newPercents);
      goal.lastDeadlineAlertDate = newDeadlineAlertDate;
      await goal.save();
    }

    res.json({ goal, expense, alerts });
  } catch (error) {
    console.error('Contribution error:', error);
    res.status(500).json({ message: 'Failed to contribute to goal.' });
  }
};

export const updateGoal = async (req, res) => {
  try {
    const { userId, goalId } = req.params;
    const normalized = normalizeGoalPayload(req.body);
    const goal = await Goal.findOneAndUpdate({ _id: goalId, userId }, normalized, { new: true });
    if (!goal) return res.status(404).json({ message: 'Goal not found' });
    res.json(goal);
  } catch {
    res.status(500).json({ message: 'Failed to update goal.' });
  }
};

export const deleteGoal = async (req, res) => {
  try {
    const { userId, goalId } = req.params;
    const deleted = await Goal.findOneAndDelete({ _id: goalId, userId });
    if (!deleted) return res.status(404).json({ message: 'Goal not found' });
    res.status(204).send();
  } catch {
    res.status(500).json({ message: 'Failed to delete goal.' });
  }
};

export const checkAlerts = async (req, res) => {
  try {
    const { userId } = req.params;
    const goals = await Goal.find({ userId });
    let results = [];

    for (const g of goals) {
      const alerts = evaluateAlerts(g);
      if (alerts.length) {
        const newPercents = new Set(g.alertedPercents || []);
        let newDeadlineAlertDate = g.lastDeadlineAlertDate;

        for (const a of alerts) {
          if (a.type === 'milestone') newPercents.add(a.percent);
          if (a.type === 'deadline') newDeadlineAlertDate = new Date();
        }

        g.alertedPercents = Array.from(newPercents);
        g.lastDeadlineAlertDate = newDeadlineAlertDate;
        await g.save();

        results = results.concat(alerts.map(a => ({ goalId: g._id, ...a })));
      }
    }
    res.json({ alerts: results });
  } catch {
    res.status(500).json({ message: 'Failed to check alerts.' });
  }
};
