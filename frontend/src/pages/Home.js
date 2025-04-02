// Home.js
import React from "react";
import SharedDashboard from "./SharedDashboard";
import './Home.css';

const Home = () => {
  return (
    <div className="home-container">
      <h2 className="dashboard-title">Welcome to BudgetWise</h2>
      <SharedDashboard />
    </div>
  );
};

export default Home;
