import React, { useEffect, useMemo, useState } from "react";
import savingService from "../services/savingService";
import "./Savings.css";

const currency = (n) => `$${Number(n || 0).toFixed(2)}`;

const MS_PER_DAY = 24 * 60 * 60 * 1000;

const toMidnight = (d) => {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
};

const daysFromToday = (dateStr) => {
  if (!dateStr) return null;
  const today = toMidnight(new Date());
  const target = toMidnight(new Date(dateStr));
  return Math.round((target.getTime() - today.getTime()) / MS_PER_DAY);
};

const remainingShort = (dateStr) => {
  const d = daysFromToday(dateStr);
  if (d === null) return "";
  if (d > 0) return `${d}d left`;
  if (d === 0) return "today";
  return `${Math.abs(d)}d overdue`;
};

const Savings = () => {
  const userId = localStorage.getItem("userId");

  const [goals, setGoals] = useState([]);
  const [summaries, setSummaries] = useState([]);
  const [savings, setSavings] = useState([]);

  const [newGoal, setNewGoal] = useState({
    title: "",
    targetAmount: "",
    targetDate: "",
    description: "",
  });
  const [newSaving, setNewSaving] = useState({
    goalId: "",
    amount: "",
    date: "",
    description: "",
  });

  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [goalError, setGoalError] = useState("");
  const [goalNotice, setGoalNotice] = useState("");
  const [submittingGoal, setSubmittingGoal] = useState(false);
  const [submittingSaving, setSubmittingSaving] = useState(false);

  const load = async () => {
    setError("");
    setNotice("");
    try {
      const [g, s, sum] = await Promise.all([
        savingService.getGoals(userId),
        savingService.getSavings(userId),
        savingService.getGoalSummaries(userId),
      ]);
      setGoals(g);
      setSavings(s);
      setSummaries(sum);
    } catch {
      setError("Failed to load data");
    }
  };

  useEffect(() => {
    if (userId) {
      load().catch(() => setError("Failed to load data"));
    }
  }, [userId]);

  const handleCreateGoal = async (e) => {
    e.preventDefault();
    setGoalError("");
    setGoalNotice("");

    if (!newGoal.title || !newGoal.targetAmount) {
      setGoalError("Please enter goal title and target amount.");
      return;
    }

    const titleTrim = String(newGoal.title || "").trim();
    const isDup = goals.some((g) => String(g.title || "").trim().toLowerCase() === titleTrim.toLowerCase());
    if (isDup) {
      setGoalError("A goal with this name already exists. Please choose a different name.");
      return;
    }

    setSubmittingGoal(true);
    try {
      await savingService.createGoal(userId, {
        ...newGoal,
        title: titleTrim,
        targetAmount: Number(newGoal.targetAmount || 0),
      });
      setNewGoal({ title: "", targetAmount: "", targetDate: "", description: "" });
      setGoalNotice("Goal created.");
      await load();
    } catch {
      setGoalError("Failed to create goal.");
    } finally {
      setSubmittingGoal(false);
    }
  };

  const handleAddSaving = async (e) => {
    e.preventDefault();
    setError("");
    setNotice("");

    if (!newSaving.goalId) {
      setError("Please select a goal.");
      return;
    }
    if (!newSaving.amount || Number(newSaving.amount) <= 0) {
      setError("Amount must be greater than 0.");
      return;
    }

    setSubmittingSaving(true);
    try {
      await savingService.createSaving(userId, {
        ...newSaving,
        amount: Number(newSaving.amount || 0),
      });
      setNewSaving({ goalId: newSaving.goalId, amount: "", date: "", description: "" });
      setNotice("Saving added.");
      await load();
    } catch {
      setError("Failed to add saving");
    } finally {
      setSubmittingSaving(false);
    }
  };

  const handleDelete = async (savingId) => {
    setError("");
    setNotice("");
    try {
      await savingService.deleteSaving(userId, savingId);
      setNotice("Deleted.");
      await load();
    } catch {
      setError("Failed to delete saving");
    }
  };

  const summaryTotals = useMemo(() => {
    if (!summaries.length) return { target: 0, saved: 0, pct: 0 };
    const target = summaries.reduce((a, g) => a + Number(g.targetAmount || 0), 0);
    const saved = summaries.reduce((a, g) => a + Number(g.saved || 0), 0);
    const pct = target > 0 ? Math.min(Math.round((saved / target) * 100), 100) : 0;
    return { target, saved, pct };
  }, [summaries]);

  return (
    <div className="container">
      <h2>Savings</h2>

      {(error || notice) && (
        <div className={`alert ${error ? "error" : "ok"}`}>{error || notice}</div>
      )}

      <h3 style={{ marginTop: 26 }}>Goals</h3>
      <section className="panel">
        <div className="panel__head">
          <h3>Create Goal</h3>
        </div>

        <form onSubmit={handleCreateGoal} className="goal-form" autoComplete="off">
          <input
            className="goal-form__input"
            placeholder="Goal Title (e.g., Emergency Fund)"
            value={newGoal.title}
            onChange={(e) => setNewGoal({ ...newGoal, title: e.target.value })}
            aria-label="Goal Title"
            required
          />

          <input
            className="goal-form__input"
            type="number"
            min="0"
            step="0.01"
            placeholder="Target Amount (e.g., 3000)"
            value={String(newGoal.targetAmount ?? "")}
            onChange={(e) => setNewGoal({ ...newGoal, targetAmount: e.target.value })}
            aria-label="Target Amount"
            required
          />

          <div className="input-with-addons">
            <input
              className="goal-form__input"
              type="date"
              value={String(newGoal.targetDate ?? "")}
              onChange={(e) => setNewGoal({ ...newGoal, targetDate: e.target.value })}
              aria-label="Target Date"
            />
            {newGoal.targetDate && (
              <button
                type="button"
                className="form-addon"
                onClick={() => setNewGoal({ ...newGoal, targetDate: "" })}
                aria-label="Clear target date"
                title="Clear"
              >
                ✕
              </button>
            )}
          </div>

          <input
            className="goal-form__input goal-form__input--wide"
            placeholder="Description (optional)"
            value={newGoal.description}
            onChange={(e) => setNewGoal({ ...newGoal, description: e.target.value })}
            aria-label="Goal Description"
          />

          <div className="goal-form__actions">
            <button type="submit" disabled={submittingGoal}>
              {submittingGoal ? "Saving…" : "Save Goal"}
            </button>
          </div>
        </form>

        {(goalError || goalNotice) && (
          <div className={`form-msg ${goalError ? "error" : "ok"}`}>
            {goalError || goalNotice}
          </div>
        )}
      </section>

      <table className="table">
        <thead>
          <tr>
            <th>Goal</th>
            <th>Saved / Target</th>
            <th>Target Date</th>
            <th>Progress</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {summaries.length ? (
            summaries.map((g) => (
              <tr key={g._id}>
                <td className="col-title">{g.title}</td>
                <td>
                  {currency(g.saved)} / {currency(g.targetAmount)}
                </td>
                <td>
                  {g.targetDate ? (
                    <>
                      {new Date(g.targetDate).toLocaleDateString()}
                      <small className="remaining-days" title={remainingShort(g.targetDate)}>
                        {" "}· {remainingShort(g.targetDate)}
                      </small>
                    </>
                  ) : (
                    "-"
                  )}
                </td>
                <td style={{ width: 220 }}>
                  <div className="progress">
                    <div
                      className="progress-bar"
                      style={{ width: `${Math.round((g.progress || 0) * 100)}%` }}
                    />
                  </div>
                  <small className="muted">{Math.round((g.progress || 0) * 100)}%</small>
                </td>
                <td>
                  <span className={`badge ${g.status?.replace(" ", "-") || "On-Track"}`}>
                    {g.status || "On Track"}
                  </span>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={5} className="empty">No goals yet. Create one above.</td>
            </tr>
          )}
        </tbody>
      </table>

      <hr className="section-divider" />

      <h3 style={{ marginTop: 26 }}>Savings</h3>
      <section className="panel" style={{ marginTop: 16 }}>
        <div className="panel__head">
          <h3>Add Saving</h3>
        </div>

        <form onSubmit={handleAddSaving} className="saving-form" autoComplete="off">
          <select
            className="saving-form__input"
            value={String(newSaving.goalId ?? "")}
            onChange={(e) => setNewSaving({ ...newSaving, goalId: e.target.value })}
            aria-label="Select Goal"
            required
          >
            <option value="">Select a Goal</option>
            {goals.map((g) => (
              <option key={g._id} value={g._id}>
                {g.title}
              </option>
            ))}
          </select>

          <input
            className="saving-form__input"
            type="number"
            min="0"
            step="0.01"
            placeholder="Amount (e.g., 200)"
            value={String(newSaving.amount ?? "")}
            onChange={(e) => setNewSaving({ ...newSaving, amount: e.target.value })}
            aria-label="Amount"
            required
          />

          <div className="input-with-addons">
            <input
              className="saving-form__input"
              type="date"
              value={String(newSaving.date ?? "")}
              onChange={(e) => setNewSaving({ ...newSaving, date: e.target.value })}
              aria-label="Date"
            />
            {newSaving.date && (
              <button
                type="button"
                className="form-addon"
                onClick={() => setNewSaving({ ...newSaving, date: "" })}
                aria-label="Clear date"
                title="Clear"
              >
                ✕
              </button>
            )}
          </div>

          <input
            className="saving-form__input saving-form__input--wide"
            placeholder="Description (optional)"
            value={newSaving.description}
            onChange={(e) => setNewSaving({ ...newSaving, description: e.target.value })}
            aria-label="Saving Description"
          />

          <div className="saving-form__actions">
            <button type="submit" disabled={submittingSaving}>
              {submittingSaving ? "Adding…" : "Add Saving"}
            </button>
          </div>
        </form>
      </section>

      <table className="table">
        <thead>
          <tr>
            <th>Goal</th>
            <th>Amount</th>
            <th>Date</th>
            <th>Description</th>
            <th style={{ width: 110 }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {savings.length ? (
            savings.map((s) => {
              const g = goals.find((x) => x._id === s.goalId);
              return (
                <tr key={s._id}>
                  <td className="col-title">{g ? g.title : "-"}</td>
                  <td>{currency(s.amount)}</td>
                  <td>{s.date ? new Date(s.date).toLocaleDateString() : "-"}</td>
                  <td className="muted">{s.description}</td>
                  <td>
                    <button className="btn-danger" onClick={() => handleDelete(s._id)}>
                      Delete
                    </button>
                  </td>
                </tr>
              );
            })
          ) : (
            <tr>
              <td colSpan={5} className="empty">No savings found.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default Savings;
