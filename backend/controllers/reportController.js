import Income from "../models/Income.js";
import Expense from "../models/Expense.js";
import Budget from "../models/budget.js";
import BudgetCategory from "../models/BudgetCategory.js";

// GET /api/reports/:userId/report/:month (e.g., 2025-04)
export const getReport = async (req, res) => {
  try {
    const { userId, month } = req.params;
    const [year, monthNum] = month.split("-").map(Number);

    const start = new Date(year, monthNum - 1, 1);
    const end = new Date(year, monthNum, 0, 23, 59, 59);

    const [incomes, expenses, budget] = await Promise.all([
      Income.find({ userId, date: { $gte: start, $lte: end } }),
      Expense.find({ userId, date: { $gte: start, $lte: end } }).populate("categoryId"),
      Budget.findOne({ userId })
    ]);

    const totalIncome = incomes.reduce((sum, i) => sum + i.amount, 0);
    const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
    const totalBudget = budget?.totalBudget || 0;
    const balance = totalIncome - totalBudget;
    const remaining = totalIncome - totalExpenses;

    let categoryStats = [];
    if (budget?._id) {
      const categories = await BudgetCategory.find({ budgetId: budget._id });

      categoryStats = categories.map(cat => {
        const spent = expenses
          .filter(e => e.categoryId?._id?.toString() === cat._id.toString())
          .reduce((sum, e) => sum + e.amount, 0);

        return {
          name: cat.name,
          limit: cat.limit,
          spent,
          remaining: cat.limit - spent
        };
      });
    }

    const transactions = [
      ...incomes.map(i => ({
        type: "income",
        amount: i.amount,
        source: i.source,
        description: i.description,
        date: i.date
      })),
      ...expenses.map(e => ({
        type: "expense",
        amount: e.amount,
        category: e.categoryId?.name || "Uncategorized",
        description: e.description,
        paymentMethod: e.paymentMethod,
        date: e.date
      }))
    ].sort((a, b) => new Date(b.date) - new Date(a.date));

    res.json({
      balance,
      summary: {
        totalIncome,
        totalBudget,
        totalExpenses,
        remaining
      },
      budgets: categoryStats,
      transactions
    });

  } catch (error) {
    console.error("Error generating report:", error);
    res.status(500).json({ message: "Failed to generate report", error: error.message });
  }
};
