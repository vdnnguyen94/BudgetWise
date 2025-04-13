import React, { useEffect, useState } from "react";
import goalService from "../services/goalService.js";
import "./Goals.css";

const Goals = () => {
  const userId = localStorage.getItem("userId");
  const [goals, setGoals] = useState([]);
  const [newGoal, setNewGoal] = useState({
    title: "", targetAmount: "", currentAmount: 0, deadline: "", description: ""
  });

  const fetchGoals = async () => {
    const data = await goalService.getGoals(userId);
    setGoals(data);
  };

  useEffect(() => {
    fetchGoals();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    await goalService.createGoal(userId, newGoal);
    setNewGoal({ title: "", targetAmount: "", currentAmount: 0, deadline: "", description: "" });
    fetchGoals();
  };

  return (
    <div className="goals-container">
      <h1>Financial Goals</h1>
      <form onSubmit={handleSubmit}>
        <input placeholder="Title" value={newGoal.title} onChange={(e) => setNewGoal({ ...newGoal, title: e.target.value })} required />
        <input type="number" placeholder="Target Amount" value={newGoal.targetAmount} onChange={(e) => setNewGoal({ ...newGoal, targetAmount: e.target.value })} required />
        <input type="date" value={newGoal.deadline} onChange={(e) => setNewGoal({ ...newGoal, deadline: e.target.value })} />
        <input placeholder="Description" value={newGoal.description} onChange={(e) => setNewGoal({ ...newGoal, description: e.target.value })} />
        <button type="submit">Add Goal</button>
      </form>

      <ul>
        {goals.map((goal) => {
            const percent = Math.min(
            100,
            Math.round((goal.currentAmount / goal.targetAmount) * 100)
            );

            return (
            <li key={goal._id}>
                <h3>{goal.title}</h3>
                <p>{goal.description}</p>
                <p>
                <strong>${goal.currentAmount}</strong> of ${goal.targetAmount} saved
                </p>
                <div style={{ background: "#ddd", borderRadius: "8px", overflow: "hidden", height: "20px", width: "100%", marginTop: "8px" }}>
                <div
                    style={{
                    width: `${percent}%`,
                    backgroundColor: percent >= 100 ? "#28a745" : "#007bff",
                    height: "100%",
                    transition: "width 0.3s ease-in-out",
                    color: "white",
                    textAlign: "center",
                    fontSize: "12px",
                    lineHeight: "20px",
                    }}
                >
                    {percent}%
                </div>
                </div>
            </li>
            );
        })}
        </ul>

    </div>
  );
};

export default Goals;
