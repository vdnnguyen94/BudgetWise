// Budget.js
import React, { useEffect, useState } from "react";
import budgetService from "../services/budgetService";
import "./Budget.css";

const Budget = () => {
  // Retrieve userId from localStorage
  const userId = localStorage.getItem("userId");

 //console.log("userID: ", userId);
  const [budget, setBudget] = useState(null);
  const [totalBudget, setTotalBudget] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (userId) {
      fetchBudget();
    }
  }, [userId]);

  const fetchBudget = async () => {
    try {
      const data = await budgetService.getBudget(userId);
      if (data && data.totalBudget) {
        setBudget(data);
        setTotalBudget(data.totalBudget);
      }
    } catch (error) {
      setError("Failed to fetch budget.");
    }
  };

  const handleBudgetSubmit = async (e) => {
    e.preventDefault();
    try {
      const updatedBudget = await budgetService.createOrUpdateBudget(userId, { totalBudget });
      setBudget(updatedBudget);
    } catch (error) {
      setError("Failed to save budget.");
    }
  };

  const handleDeleteBudget = async () => {
    try {
      await budgetService.deleteBudget(userId);
      setBudget(null);
      setTotalBudget("");
    } catch (error) {
      setError("Failed to delete budget.");
    }
  };

  return (
    <div className="budget-page">
      <h1 className="page-title">Budget Page</h1>
      <h2>Budget Management</h2>
      {error && <p style={{ color: "red" }}>{error}</p>}

      {budget ? (
        <div>
          <p><strong>Current Budget:</strong> ${budget.totalBudget}</p>
          {/* Optionally render a component for listing or creating budget categories here */}
          <button onClick={handleDeleteBudget}>Delete Budget</button>
          {/* You might also include an update form/button */}
        </div>
      ) : (
        <div>
          <h3>No Budget, please create one</h3>
          <form onSubmit={handleBudgetSubmit}>
            <input
              type="number"
              placeholder="Enter total budget"
              value={totalBudget}
              onChange={(e) => setTotalBudget(e.target.value)}
              required
            />
            <button type="submit">Save Budget</button>
          </form>
        </div>
      )}
    </div>
  );
};

export default Budget;
