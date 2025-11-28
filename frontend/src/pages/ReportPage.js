import React, { useEffect, useMemo, useState } from "react";
import reportService from "../services/reportService";
import { Bar, Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
  ArcElement,
} from "chart.js";
import "./ReportPage.css";

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend, ArcElement);

const currency = (n) =>
  (Number.isFinite(Number(n)) ? Number(n) : 0).toLocaleString(undefined, {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  });

export default function ReportPage() {
  const userId = localStorage.getItem("userId");
  const userRole = localStorage.getItem("userRole");

  const [month, setMonth] = useState(() => {
    const t = new Date();
    return `${t.getFullYear()}-${String(t.getMonth() + 1).padStart(2, "0")}`;
  });
  const [report, setReport] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const data = await reportService.getReport(userId, month);
        setReport(data);
      } catch (e) {
        setError("Failed to load report.");
      }
    })();
  }, [month, userId]);

  const incomeBreakdown = useMemo(() => {
    if (!report) return { labels: [], totals: [], table: [] };
    const map = new Map();
    for (const tx of report.transactions || []) {
      if (tx.type === "income") {
        const k = tx.source || "Other";
        map.set(k, (map.get(k) || 0) + Number(tx.amount || 0));
      }
    }
    const labels = Array.from(map.keys());
    const totals = labels.map((k) => map.get(k));
    const table = labels.map((k) => ({ source: k, amount: map.get(k) }));
    return { labels, totals, table };
  }, [report]);

  const expenseBreakdowns = useMemo(() => {
    if (!report) return { byCategory: { labels: [], totals: [] }, byMethod: { labels: [], totals: [] } };
    const cat = new Map();
    const pm = new Map();
    for (const tx of report.transactions || []) {
      if (tx.type === "expense") {
        const c = tx.category || "Uncategorized";
        const m = tx.paymentMethod || "Other";
        cat.set(c, (cat.get(c) || 0) + Number(tx.amount || 0));
        pm.set(m, (pm.get(m) || 0) + Number(tx.amount || 0));
      }
    }
    const byCategory = { labels: Array.from(cat.keys()), totals: Array.from(cat.values()) };
    const byMethod = { labels: Array.from(pm.keys()), totals: Array.from(pm.values()) };
    return { byCategory, byMethod };
  }, [report]);

  const dailySpend = useMemo(() => {
    if (!report) return { points: [], top: null };
    const dayMap = new Map();
    for (const tx of report.transactions || []) {
      if (tx.type !== "expense") continue;
      const d = new Date(tx.date);
      const key = new Date(d.getFullYear(), d.getMonth(), d.getDate()).toISOString().slice(0, 10);
      dayMap.set(key, (dayMap.get(key) || 0) + Number(tx.amount || 0));
    }
    const points = Array.from(dayMap.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([day, amt]) => ({ day, amt }));
    const top = points.reduce((acc, p) => (acc && acc.amt > p.amt ? acc : p), null);
    return { points, top };
  }, [report]);

  const kpis = useMemo(() => {
    if (!report) return null;
    const { totalIncome, totalExpenses, totalBudget, remaining } = report.summary;
    const savingsRate = Number(totalIncome) > 0 ? (remaining / totalIncome) * 100 : 0;
    return {
      totalIncome,
      totalExpenses,
      totalBudget,
      remaining,
      balance: report.balance,
      savingsRate,
    };
  }, [report]);

  const budgetBarData = useMemo(
    () => ({
      labels: report?.budgets.map((b) => b.name) || [],
      datasets: [
        {
          label: "Limit",
          data: report?.budgets.map((b) => b.limit) || [],
          backgroundColor: "#28a745",
        },
        {
          label: "Spent",
          data: report?.budgets.map((b) => b.spent) || [],
          backgroundColor: report?.budgets.map((b) => (b.spent > b.limit ? "#dc3545" : "#007bff")) || [],
        },
      ],
    }),
    [report]
  );

  const incomePieData = useMemo(
    () => ({
      labels: incomeBreakdown.labels,
      datasets: [
        {
          data: incomeBreakdown.totals,
          backgroundColor: ["#4e79a7", "#f28e2b", "#e15759", "#76b7b2", "#59a14f", "#edc949", "#af7aa1", "#ff9da7"],
        },
      ],
    }),
    [incomeBreakdown]
  );

  const expenseCatBarData = useMemo(
    () => ({
      labels: expenseBreakdowns.byCategory.labels,
      datasets: [
        {
          label: "Spent by Category",
          data: expenseBreakdowns.byCategory.totals,
          backgroundColor: "#6f42c1",
        },
      ],
    }),
    [expenseBreakdowns]
  );

  const expenseMethodPieData = useMemo(
    () => ({
      labels: expenseBreakdowns.byMethod.labels,
      datasets: [
        {
          data: expenseBreakdowns.byMethod.totals,
          backgroundColor: ["#2ca02c", "#1f77b4", "#ff7f0e", "#d62728", "#9467bd", "#8c564b"],
        },
      ],
    }),
    [expenseBreakdowns]
  );

const addMonths = (ym, delta) => {
  const [Y, M] = ym.split("-").map(Number); 
  let mm = (M - 1) + delta;                 
  let y = Y + Math.floor(mm / 12);
  mm = ((mm % 12) + 12) % 12;               
  return `${y}-${String(mm + 1).padStart(2, "0")}`;
};

  return (
    <div className="report-page">
      <h2>Financial Report</h2>
      <div className="month-selector" role="group" aria-label="Select month">
        <button
          type="button"
          className="month-nav-btn"
          onClick={() => setMonth(addMonths(month, -1))}
          aria-label="Previous month"
        >
          ◀
        </button>
        <div className="month-input">
          <label htmlFor="report-month" className="sr-only">Select Month</label>
          <input
            id="report-month"
            type="month"
            value={month}
            onChange={(e) => setMonth(e.target.value)}
          />
        </div>
        <button
          type="button"
          className="month-nav-btn"
          onClick={() => setMonth(addMonths(month, +1))}
          aria-label="Next month"
        >
          ▶
        </button>
        <button
          type="button"
          className="month-reset"
          onClick={() => {
            const t = new Date();
            setMonth(`${t.getFullYear()}-${String(t.getMonth() + 1).padStart(2, "0")}`);
          }}
          aria-label="Reset to current month"
          title="Back to current month"
        >
          Today
        </button>
      </div>

      {error && <p className="error">{error}</p>}
      {!report && !error && <p>Loading...</p>}

      {report && (
        <>
          <div className="card">
            <h3>💼 Financial Summary</h3>
            <div className="summary-grid">
              <div className="summary-item">Balance: {currency(kpis.balance)}</div>
              <div className="summary-item">Total Income: {currency(kpis.totalIncome)}</div>
              <div className="summary-item">Total Budget: {currency(kpis.totalBudget)}</div>
              <div className="summary-item">Total Expenses: {currency(kpis.totalExpenses)}</div>
              <div className="summary-item">Remaining: {currency(kpis.remaining)}</div>
              <div className="summary-item">Savings Rate: {kpis.savingsRate.toFixed(1)}%</div>
            </div>
          </div>

          <div className="card">
            <h3>💰 Income Breakdown</h3>
            <div className="two-col">
              <div className="chart-container"><Pie data={incomePieData} /></div>
              <div>
                <table className="budget-table">
                  <thead>
                    <tr><th>Source</th><th>Amount</th></tr>
                  </thead>
                  <tbody>
                    {incomeBreakdown.table.map((row) => (
                      <tr key={row.source}>
                        <td>{row.source}</td>
                        <td>{currency(row.amount)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div className="card">
            <h3>🎯 Budget by Category</h3>
            <div className="chart-container"><Bar data={budgetBarData} /></div>
            <table className="budget-table">
              <thead>
                <tr>
                  <th>Category</th><th>Limit</th><th>Spent</th><th>Remaining</th><th>Status</th>
                </tr>
              </thead>
              <tbody>
                {report.budgets.map((b, i) => (
                  <tr key={i} className={b.spent > b.limit ? "over-budget" : ""}>
                    <td>{b.name}</td>
                    <td>{currency(b.limit)}</td>
                    <td>{currency(b.spent)}</td>
                    <td>{currency(b.remaining)}</td>
                    <td>{b.spent > b.limit ? "Over Budget" : "OK"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="card">
            <h3>🧾 Expense Report</h3>
            <div className="two-col">
              <div className="chart-container"><Bar data={expenseCatBarData} /></div>
              <div className="chart-container"><Pie data={expenseMethodPieData} /></div>
            </div>
            {dailySpend.top && (
              <p style={{ marginTop: 12 }}>
                <strong>Top Spending Day:</strong> {dailySpend.top.day} — {currency(dailySpend.top.amt)}
              </p>
            )}
          </div>

          <div className="card">
            <h3>📒 Transactions</h3>
            <div className="transactions">
              {report.transactions.map((tx, i) => (
                <div key={i} className={`transaction-entry ${tx.type}`}>
                  <div className="transaction-description">
                    <strong>{tx.type.toUpperCase()}</strong> • {currency(tx.amount)}
                    {tx.type === "income" && tx.source ? ` • ${tx.source}` : ""}
                    {tx.type === "expense" && tx.category ? ` • ${tx.category}` : ""}
                    {tx.description ? ` • ${tx.description}` : ""}
                  </div>
                  <div className="transaction-date">
                    {new Date(tx.date).toLocaleDateString()} {tx.paymentMethod ? `• ${tx.paymentMethod}` : ""}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {report.childLimits && (
            <div className="card">
              <h3>{userRole === "Child" ? "👨‍👩‍👧 Parental Controls" : "👨‍👩‍👧 Child Controls"}</h3>
              <p><strong>Per-transaction Limit:</strong> {Number(report.childLimits.spendingLimit) > 0 ? currency(report.childLimits.spendingLimit) : "No limit"}</p>
              <p><strong>Monthly Budget:</strong> {Number(report.childLimits.monthlyBudget) > 0 ? currency(report.childLimits.monthlyBudget) : "No cap"}</p>
              {Number(report.childLimits.monthlyBudget) > 0 && (
                <>
                  <p><strong>Spent This Month:</strong> {currency(report.childLimits.spentThisMonth)}</p>
                  <p><strong>Remaining This Month:</strong> {currency(report.childLimits.remainingThisMonth)}</p>
                </>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
