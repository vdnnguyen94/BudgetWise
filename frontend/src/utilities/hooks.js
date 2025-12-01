import { useState, useEffect, useRef } from "react";
import { toast } from "react-toastify";
import expenseService from "../services/expenseService";
import budgetService from "../services/budgetService";
import billService from "../services/billService";
import budgetCategoryService from "../services/budgetCategoryService";
import subscriptionService from "../services/subscriptionService";

// Fetch Budget
export const useBudget = (userId) => {
  const [budget, setBudget] = useState(null);

  useEffect(() => {
    const fetchBudget = async () => {
      try {
        const budgetData = await budgetService.getBudget(userId);
        if (budgetData && budgetData.totalBudget) {
          setBudget(budgetData.totalBudget);
        }
      } catch (error) {
        console.error("Failed to fetch budget:", error);
        toast.error("Failed to fetch budget.");
      }
    };

    if (userId) fetchBudget();
  }, [userId]);

  return budget;
};

// Fetch Expenses
export const useTotalExpenses = (userId) => {
  const [totalExpenses, setTotalExpenses] = useState(null);

  useEffect(() => {
    const fetchExpenses = async () => {
      try {
        const expenses = await expenseService.getExpenses(userId, {});
        if (expenses.length > 0) {
          const total = expenses.reduce((acc, expense) => acc + parseFloat(expense.amount), 0);
          setTotalExpenses(total);
        } else {
          setTotalExpenses(0); // If no expenses, set total to 0
        }
      } catch (error) {
        console.error("Failed to fetch expenses:", error);
        toast.error("Failed to fetch expenses.");
      }
    };

    if (userId) fetchExpenses();
  }, [userId]);

  return totalExpenses;
};

// Fetch Total Bills
export const useTotalBills = (userId) => {
  const [totalBills, setTotalBills] = useState(null);

  useEffect(() => {
    const fetchBills = async () => {
      try {
        const bills = await billService.getBills(userId);
        const total = bills.reduce((acc, bill) => acc + parseFloat(bill.amount), 0);
        setTotalBills(total);
      } catch (error) {
        console.error("Failed to fetch bills:", error);
        toast.error("Failed to fetch bills.");
      }
    };

    if (userId) fetchBills();
  }, [userId]);

  return totalBills;
};

// Check if Expenses + Bills exceed Budget
export const useBudgetWarning = (userId) => {
  const budget = useBudget(userId);
  const totalExpenses = useTotalExpenses(userId);
  const totalBills = useTotalBills(userId);
  const hasTriggered = useRef(false);

  useEffect(() => {
    if (budget === null || totalExpenses === null || totalBills === null) return;
    if (hasTriggered.current) return;

    const totalSpent = totalExpenses + totalBills;

    if (totalSpent > budget) {
      setTimeout(() => {
        toast.warn(`Warning! Your total spending ($${totalSpent.toFixed(2)}) exceeds your budget ($${budget.toFixed(2)})`, {
          position: "top-right",
          autoClose: 4000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
      }, 500);

      hasTriggered.current = true;
    }
  }, [budget, totalExpenses, totalBills]);

  return { budget, totalExpenses, totalBills };
};
// Check if any upcoming bills AND subscriptions
export const useUpcomingBillsWarning = (userId) => {
  const hasTriggered = useRef(false);

  useEffect(() => {
    const fetchBillsAndSubscriptions = async () => {
      try {
        const [bills, subscriptions] = await Promise.all([
          billService.getBills(userId),
          subscriptionService.getSubscriptions(userId),
        ]);

        const today = new Date();
        const threeDaysFromNow = new Date();
        threeDaysFromNow.setDate(today.getDate() + 3);

        const upcomingBills = bills.filter((bill) => {
          const billDate = new Date(bill.date);
          return billDate >= today && billDate <= threeDaysFromNow;
        });

        const upcomingSubscriptions = subscriptions.filter((sub) => {
          if (!sub.isActive) return false;
          if (!sub.nextPaymentDate) return false;
          const subDate = new Date(sub.nextPaymentDate);
          return subDate >= today && subDate <= threeDaysFromNow;
        });

        if (
          (upcomingBills.length > 0 || upcomingSubscriptions.length > 0) &&
          !hasTriggered.current
        ) {
          upcomingBills.forEach((bill) => {
            const formattedDate = new Date(bill.date)
              .toISOString()
              .split("T")[0];
            toast.info(
              `Upcoming Bill: ${bill.description} of $${bill.amount.toFixed(
                2
              )} is due on ${formattedDate}`,
              {
                position: "top-right",
                autoClose: 4000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
              }
            );
          });

          upcomingSubscriptions.forEach((sub) => {
            const formattedDate = new Date(sub.nextPaymentDate)
              .toISOString()
              .split("T")[0];
            toast.info(
              `Upcoming Subscription: ${sub.name} of $${Number(
                sub.amount
              ).toFixed(2)} is due on ${formattedDate}`,
              {
                position: "top-right",
                autoClose: 4000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
              }
            );
          });

          hasTriggered.current = true;
        }
      } catch (error) {
        console.error("Failed to fetch bills/subscriptions:", error);
      }
    };

    if (userId) {
      fetchBillsAndSubscriptions();
    }
  }, [userId]);
};


// Fetch category budgets
export const useCategoryBudgets = (budgetId) => {
  const [categoryBudgets, setCategoryBudgets] = useState([]);

  useEffect(() => {
    const fetchCategoryBudgets = async () => {
      try {
        if (!budgetId) return;
        const categories = await budgetCategoryService.getCategories(budgetId);
        setCategoryBudgets(categories);
      } catch (error) {
        console.error("Failed to fetch category budgets:", error);
        toast.error("Failed to fetch category budgets.");
      }
    };

    fetchCategoryBudgets();
  }, [budgetId]);

  return categoryBudgets;
};

// Fetch total expenses per category
export const useCategoryExpenses = (userId) => {
  const [categoryExpenses, setCategoryExpenses] = useState({});

  useEffect(() => {
    const fetchExpenses = async () => {
      try {
        const expenses = await expenseService.getExpenses(userId);
        const expenseTotals = {};

        expenses.forEach((expense) => {
          const categoryId = expense.categoryId?._id || expense.categoryId;
          expenseTotals[categoryId] = (expenseTotals[categoryId] || 0) + parseFloat(expense.amount);
        });

        setCategoryExpenses(expenseTotals);
      } catch (error) {
        console.error("Failed to fetch category expenses:", error);
      }
    };

    fetchExpenses();
  }, [userId]);

  return categoryExpenses;
};

// Fetch total bills per category
export const useCategoryBills = (userId) => {
  const [categoryBills, setCategoryBills] = useState({});

  useEffect(() => {
    const fetchBills = async () => {
      try {
        const bills = await billService.getBills(userId);
        const billTotals = {};

        bills.forEach((bill) => {
          const categoryId = bill.categoryId?._id || bill.categoryId;
          billTotals[categoryId] = (billTotals[categoryId] || 0) + parseFloat(bill.amount);
        });

        setCategoryBills(billTotals);
      } catch (error) {
        console.error("Failed to fetch category bills:", error);
      }
    };

    fetchBills();
  }, [userId]);

  return categoryBills;
};

// Show a warning if spending (expenses + bills) exceeds category limit
export const useCategoryBudgetWarning = (userId, budgetId) => {
  const categoryBudgets = useCategoryBudgets(budgetId);
  const categoryExpenses = useCategoryExpenses(userId);
  const categoryBills = useCategoryBills(userId);
  const hasTriggered = useRef(new Set()); // Track triggered warnings

  useEffect(() => {
    if (!categoryBudgets.length) return;

    categoryBudgets.forEach((category) => {
      const categoryId = category._id;
      const totalSpent = (categoryExpenses[categoryId] || 0) + (categoryBills[categoryId] || 0);

      if (totalSpent > category.limit && !hasTriggered.current.has(categoryId)) {
        toast.warn(`Warning! Spending for category "${category.name}" ($${totalSpent.toFixed(2)}) exceeds its budget limit ($${category.limit.toFixed(2)})`, {
          position: "top-right",
          autoClose: 4000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });

        hasTriggered.current.add(categoryId); // Prevent duplicate warnings
      }
    });
  }, [categoryBudgets, categoryExpenses, categoryBills]);
};