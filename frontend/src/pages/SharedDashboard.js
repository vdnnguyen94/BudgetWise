import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Pie } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import expenseService from "../services/expenseService";
import budgetService from "../services/budgetService";
import "./SharedDashboard.css";

ChartJS.register(ArcElement, Tooltip, Legend);

const SharedDashboard = () => {
  const role = localStorage.getItem("userRole");
  const userId = localStorage.getItem("userId");
  const token = localStorage.getItem("token");

  const [budget, setBudget] = useState(null);
  const [expenses, setExpenses] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!token) {
      setError("Please login to view dashboard.");
      return;
    }

    fetchBudget();
    fetchExpenses();
  }, []);

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

  const fetchExpenses = async () => {
    try {
      const data = await expenseService.getExpenses(userId, {});
      setExpenses(data);
    } catch (error) {
      setError("Failed to fetch expenses.");
    }
  };

  const totalSpent = expenses.reduce((acc, expense) => acc + expense.amount, 0);
  const remainingBudget = budget ? budget.totalBudget - totalSpent : 0;

  const pieData = {
    labels: ["Spent", "Remaining"],
    datasets: [
      {
        data: [totalSpent, remainingBudget > 0 ? remainingBudget : 0],
        backgroundColor: ["#FF5733", "#28A745"],
        hoverBackgroundColor: ["#FF4500", "#218838"],
      },
    ],
  };

  return (
    <div className="shared-dashboard">
      {token && (
        <h3 style={{ marginBottom: "30px", fontWeight: "bold" }}>
          {role ? `${role} Dashboard` : "Dashboard"}
        </h3>
      )}

      {error && <p className="error" style={{ color: "red" }}>{error}</p>}

      {!token ? (
       <div className="login-prompt animated">
       <h3>👋 Hey there!</h3>
       <p>To view your personalized dashboard, you need to <strong>log in</strong>.</p>
       <Link to="/user" className="login-link-button">🔐 Login to Continue</Link>
     </div>
     
      
      ) : (
        <>
          <div className="summary-card">
            <h3>Spending Summary</h3>
            <p><strong>Total Spent:</strong> ${totalSpent.toFixed(2)}</p>
            <p><strong>Remaining Budget:</strong> ${remainingBudget.toFixed(2)}</p>
          </div>

          <div className="limit-card">
            <h3>Spending Limit</h3>
            <p><strong>Budget:</strong> ${budget?.totalBudget || "Not Set"}</p>
            <p><strong>Remaining:</strong> ${remainingBudget.toFixed(2)}</p>

            <div className="chart-container">
              <Pie data={pieData} />
            </div>

            <div className="pie-legend">
              <div className="spent">🟥 Spent</div>
              <div className="remaining">🟩 Remaining</div>
            </div>
          </div>

          <div className="links">
            <Link to="/budget" className="student-btn">Manage Budget</Link>
            <Link to="/expenses" className="student-btn">Add Expense</Link>
            <Link to="/summary" className="student-btn">View Reports</Link>
            <Link to="/loan" className="student-btn">Loan Summary</Link>
          </div>
        </>
      )}
    </div>
  );
};

export default SharedDashboard;
// import React, { useEffect, useState } from "react";
// import { Link } from "react-router-dom";
// import { Pie } from "react-chartjs-2";
// import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
// import expenseService from "../services/expenseService";
// import budgetService from "../services/budgetService";
// import "./SharedDashboard.css";

// ChartJS.register(ArcElement, Tooltip, Legend);

// const SharedDashboard = () => {
//   const role = localStorage.getItem("userRole");
//   const userId = localStorage.getItem("userId");

//   const [budget, setBudget] = useState(null);
//   const [expenses, setExpenses] = useState([]);
//   const [error, setError] = useState("");

//   useEffect(() => {
//     fetchBudget();
//     fetchExpenses();
//   }, []);

//   const fetchBudget = async () => {
//     try {
//       const data = await budgetService.getBudget(userId);
//       if (data && data.totalBudget) {
//         setBudget(data);
//       }
//     } catch (error) {
//       setError("Failed to fetch budget.");
//     }
//   };

//   const fetchExpenses = async () => {
//     try {
//       const data = await expenseService.getExpenses(userId, {} );
//       console.log("USER ID: ", userId);
//       setExpenses(data);
//     } catch (error) {
//       setError("Failed to fetch expenses.");
//     }
//   };

//   const totalSpent = expenses.reduce((acc, expense) => acc + expense.amount, 0);
//   const remainingBudget = budget ? budget.totalBudget - totalSpent : 0;

//   const pieData = {
//     labels: ["Spent", "Remaining"],
//     datasets: [
//       {
//         data: [totalSpent, remainingBudget > 0 ? remainingBudget : 0],
//         backgroundColor: ["#FF5733", "#28A745"],
//         hoverBackgroundColor: ["#FF4500", "#218838"],
//       },
//     ],
//   };

//   return (
//     <div className="shared-dashboard">
//       <h2>{role} Dashboard</h2>

//       {error && <p className="error">{error}</p>}

//       <div className="summary-card">
//         <h3>Spending Summary</h3>
//         <p><strong>Total Spent:</strong> ${totalSpent.toFixed(2)}</p>
//         <p><strong>Remaining Budget:</strong> ${remainingBudget.toFixed(2)}</p>
//       </div>

//       <div className="limit-card">
//         <h3>Spending Limit</h3>
//         <p><strong>Budget:</strong> ${budget?.totalBudget || "Not Set"}</p>
//         <p><strong>Remaining:</strong> ${remainingBudget.toFixed(2)}</p>

//         <div className="chart-container">
//           <Pie data={pieData} />
//         </div>

//         <div className="pie-legend">
//           <div className="spent">🟥 Spent</div>
//           <div className="remaining">🟩 Remaining</div>
//         </div>
//       </div>

//       <div className="links">
//         <Link to="/budget" className="student-btn">Manage Budget</Link>
//         <Link to="/expenses" className="student-btn">Add Expense</Link>
//         <Link to="/summary" className="student-btn">View Reports</Link>
//         <Link to="/loan" className="student-btn">Loan Summary</Link>
//       </div>
//     </div>
//   );
// };

// export default SharedDashboard;
