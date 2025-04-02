import React, { useEffect, useState } from "react";
import reportService from "../services/reportService";
import { Bar } from "react-chartjs-2";
import { Chart as ChartJS, BarElement, CategoryScale, LinearScale, Tooltip, Legend } from "chart.js";
import "./ReportPage.css";

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

const ReportPage = () => {
  const userId = localStorage.getItem("userId");
  const [month, setMonth] = useState(() => {
    const today = new Date();
    return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}`;
  });

  const [report, setReport] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchReport();
  }, [month]);

  const fetchReport = async () => {
    try {
      const data = await reportService.getReport(userId, month);
      setReport(data);
    } catch (err) {
      setError("Failed to load report.");
    }
  };

  const barData = {
    labels: report?.budgets.map(b => b.name) || [],
    datasets: [
      {
        label: "Limit",
        data: report?.budgets.map(b => b.limit) || [],
        backgroundColor: "#28a745"
      },
      {
        label: "Spent",
        data: report?.budgets.map(b => b.spent) || [],
        backgroundColor: report?.budgets.map(b => b.spent > b.limit ? "#dc3545" : "#007bff") || []
      }
    ]
  };

  return (
    <div className="report-page">
    <div className="shared-dashboard">
      <h2>📊 Monthly Report</h2>
        <div className="month-selector">
            <button className={month === "2025-03" ? "active" : ""} onClick={() => setMonth("2025-03")}>March 2025</button>
            <button className={month === "2025-04" ? "active" : ""} onClick={() => setMonth("2025-04")}>April 2025</button>
        </div>

      {error && <p className="error">{error}</p>}

      {report && (
        <>
          <div className="summary-card">
            <h3>💼 Financial Summary</h3>
            <p><strong>Balance:</strong> ${report.balance}</p>
            <p><strong>Total Income:</strong> ${report.summary.totalIncome}</p>
            <p><strong>Total Budget:</strong> ${report.summary.totalBudget}</p>
            <p><strong>Total Expenses:</strong> ${report.summary.totalExpenses}</p>
            <p><strong>Remaining:</strong> ${report.summary.remaining.toFixed(2)}</p>

          </div>

          <div className="limit-card">
            <h3>🎯 Budget by Category</h3>
            <div className="chart-container">
              <Bar data={barData} />
            </div>
            <table className="budget-table">
                <thead>
                    <tr>
                    <th>Category</th>
                    <th>Limit</th>
                    <th>Spent</th>
                    <th>Remaining</th>
                    <th>Status</th>
                    </tr>
                </thead>
                <tbody>
                    {report.budgets.map((b, idx) => (
                    <tr key={idx} className={b.spent > b.limit ? "over-budget" : ""}>
                        <td>{b.name}</td>
                        <td>${b.limit.toFixed(2)}</td>
                        <td>${b.spent.toFixed(2)}</td>
                        <td>${b.remaining.toFixed(2)}</td>
                        <td>{b.spent > b.limit ? "Over Budget" : "OK"}</td>
                    </tr>
                    ))}
                </tbody>
                </table>

          </div>

          <div className="summary-card">
            <h3>🧾 Transactions</h3>
            {report.transactions.map((tx, i) => (
              <div key={i} className={`transaction-entry ${tx.type}`}>
                <strong>{tx.type.toUpperCase()} | ${tx.amount} | {tx.description} {tx.category ? `| ${tx.category}` : ""}</strong>
                <small>{new Date(tx.date).toLocaleDateString()}</small>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
    </div>
  );
};

export default ReportPage;