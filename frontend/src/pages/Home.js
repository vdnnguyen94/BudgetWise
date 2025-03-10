import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Pie } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import expenseService from "../services/expenseService";
import budgetService from "../services/budgetService";
import "./Home.css";

// Register Chart.js components
ChartJS.register(ArcElement, Tooltip, Legend);

const Home = () => {
  const userId = localStorage.getItem("userId");

  const [budget, setBudget] = useState(null);
  const [expenses, setExpenses] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchBudget();
    fetchExpenses();
  }, []);

  // Fetch Budget
  const fetchBudget = async () => {
    try {
      const data = await budgetService.getBudget(userId);
      if (data && data.totalBudget) {
        setBudget(data);
      }
    } catch (error) {
      setError("Failed to fetch budget.");
    }
  };

  // Fetch Expenses
  const fetchExpenses = async () => {
    try {
      const data = await expenseService.getExpenses(userId);
      setExpenses(data);
    } catch (error) {
      setError("Failed to fetch expenses.");
    }
  };

  // Calculate Spending Summary
  const totalSpent = expenses.reduce((acc, expense) => acc + expense.amount, 0);
  const remainingBudget = budget ? budget.totalBudget - totalSpent : 0;

  // Data for Pie Chart
  const pieData = {
    labels: ["Spent", "Remaining"],
    datasets: [
      {
        data: [totalSpent, remainingBudget > 0 ? remainingBudget : 0], 
        backgroundColor: ["#FF5733", "#28A745"], // Red = spent, Green = remaining
        hoverBackgroundColor: ["#FF4500", "#218838"],
      },
    ],
  };

  return (
    <div className="home-student-container">
      <h1>Student Dashboard</h1>

      {error && <p style={{ color: "red" }}>{error}</p>}

      <div className="budget-summary">
        <h2>Spending Summary</h2>
        <p><strong>Total Spent:</strong> ${totalSpent.toFixed(2)}</p>
        <p><strong>Remaining Budget:</strong> ${remainingBudget.toFixed(2)}</p>
      </div>

      <div className="spending-limit">
        <h2>Spending Limit</h2>
        <p><strong>Budget:</strong> ${budget?.totalBudget || "Not Set"}</p>
        <p><strong>Remaining:</strong> ${remainingBudget.toFixed(2)}</p>
        <div className="chart-container">
          <Pie data={pieData} />
        </div>
      </div>

      <div className="links">
        <Link to="/budget" className="student-btn">Manage Budget</Link>
        <Link to="/expenses" className="student-btn">Add Expense</Link>
        <Link to="/summary" className="student-btn">View Reports</Link>
      </div>
    </div>
  );
};

export default Home;
