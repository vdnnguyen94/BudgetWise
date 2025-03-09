/** @format */


import "./Home.css";

import { useBudgetWarning, useBudget, useUpcomingBillsWarning, useCategoryBudgetWarning } from "../utilities/hooks";
import { useEffect, useState } from "react";
import budgetService from "../services/budgetService";

const Home = () => {
  const userId = localStorage.getItem("userId");
  const [budget, setBudget] = useState(null);

  useEffect(() => {
    const fetchBudget = async () => {
      try {
        const data = await budgetService.getBudget(userId);
        if (data && data._id) {
          setBudget(data);
        }
      } catch (error) {
        console.error("Failed to fetch budget.");
      }
    };

    fetchBudget();
  }, [userId]);
  useBudget(userId)
  // This automatically triggers a toast if expenses exceed budget
  useBudgetWarning(userId);
  // This automatically triggers a toast if bill is due in the next 3 days
  useUpcomingBillsWarning(userId);
  // This automatically triggers a toast if category is over it budget
  useCategoryBudgetWarning(userId, budget?._id);
  return (
    <div>
      <h1>Welcome to the Home Page</h1>
    </div>
  );
};

export default Home;