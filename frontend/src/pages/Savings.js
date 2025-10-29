import React, { useEffect, useState } from "react";
import savingService from "../services/savingService";
import "./Savings.css";

const currency = (n) => `$${Number(n || 0).toFixed(2)}`;

const toDateOnlyLocal = (s) => {
  if (!s) return null;
  const m = String(s).match(/^(\d{4})-(\d{2})-(\d{2})/); 
  if (!m) return new Date(s); 
  const [, y, mm, dd] = m.map(Number);
  return new Date(y, (mm || 1) - 1, dd || 1);
};

const MS_PER_DAY = 24 * 60 * 60 * 1000;
const toMidnight = (d) => { const x = new Date(d); x.setHours(0,0,0,0); return x; };

const daysFromToday = (dateStr) => {
  if (!dateStr) return null;
  const today = toMidnight(new Date());
  const target = toMidnight(toDateOnlyLocal(dateStr)); 
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

  const [submittingGoal, setSubmittingGoal] = useState(false);
  const [submittingSaving, setSubmittingSaving] = useState(false);
  const [deletingGoalId, setDeletingGoalId] = useState("");

  const [goalMessage, setGoalMessage] = useState(null);
  const [savingMessage, setSavingMessage] = useState(null);

  const load = async () => {
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
      setGoalMessage({ type: "error", text: "Failed to load data." });
    }
  };

  useEffect(() => {
    if (userId) load().catch(() => setGoalMessage({ type: "error", text: "Failed to load data." }));
  }, [userId]);

  const handleCreateGoal = async (e) => {
    e.preventDefault();
    setGoalMessage(null);

    if (!newGoal.title || !newGoal.targetAmount) {
      setGoalMessage({ type: "error", text: "Please enter goal title and target amount." });
      return;
    }

    const titleTrim = String(newGoal.title || "").trim();
    const isDup = goals.some(
      (g) => String(g.title || "").trim().toLowerCase() === titleTrim.toLowerCase()
    );
    if (isDup) {
      setGoalMessage({
        type: "error",
        text: "A goal with this name already exists. Please choose a different name.",
      });
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
      setGoalMessage({ type: "ok", text: "Goal created." });
      await load();
    } catch {
      setGoalMessage({ type: "error", text: "Failed to create goal." });
    } finally {
      setSubmittingGoal(false);
    }
  };

  const handleAddSaving = async (e) => {
    e.preventDefault();
    setSavingMessage(null);

    if (!newSaving.goalId) {
      setSavingMessage({ type: "error", text: "Please select a goal." });
      return;
    }
    if (!newSaving.amount || Number(newSaving.amount) <= 0) {
      setSavingMessage({ type: "error", text: "Amount must be greater than 0." });
      return;
    }

    setSubmittingSaving(true);
    try {
      await savingService.createSaving(userId, {
        ...newSaving,
        amount: Number(newSaving.amount || 0),
      });
      setNewSaving({ goalId: newSaving.goalId, amount: "", date: "", description: "" });
      setSavingMessage({ type: "ok", text: "Saving added." });
      await load();
    } catch {
      setSavingMessage({ type: "error", text: "Failed to add saving." });
    } finally {
      setSubmittingSaving(false);
    }
  };

  const handleDelete = async (savingId) => {
    setSavingMessage(null);
    try {
      await savingService.deleteSaving(userId, savingId);
      setSavingMessage({ type: "ok", text: "Saving deleted." });
      await load();
    } catch {
      setSavingMessage({ type: "error", text: "Failed to delete saving." });
    }
  };

  const handleDeleteGoal = async (goalId) => {
    setGoalMessage(null);
    const ok = window.confirm("Delete this goal and all related savings?");
    if (!ok) return;
    setDeletingGoalId(goalId);
    try {
      await savingService.deleteGoal(userId, goalId);
      setGoalMessage({ type: "ok", text: "Goal deleted." });
      await load();
    } catch {
      setGoalMessage({ type: "error", text: "Failed to delete goal." });
    } finally {
      setDeletingGoalId("");
    }
  };

  return (
    <div className="container">
      <h2>Savings</h2>

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

        {goalMessage && (
          <div className={`form-msg ${goalMessage.type}`}>
            {goalMessage.text}
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
            <th style={{ width: 110 }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {summaries.length ? (
            summaries.map((g) => (
              <tr key={g._id}>
                <td className="col-title">{g.title}</td>
                <td>{currency(g.saved)} / {currency(g.targetAmount)}</td>
                <td>
                  {g.targetDate ? (
                    <>
                      {toDateOnlyLocal(g.targetDate)?.toLocaleDateString() }
                      <small className="remaining-days" title={remainingShort(g.targetDate)}>
                        {" "}· {remainingShort(g.targetDate)}
                      </small>
                    </>
                  ) : ("-")}
                </td>
                <td style={{ width: 220 }}>
                  <div className="progress">
                    <div className="progress-bar" style={{ width: `${Math.round((g.progress || 0) * 100)}%` }} />
                  </div>
                  <small className="muted">{Math.round((g.progress || 0) * 100)}%</small>
                </td>
                <td>
                  <span className={`badge ${g.status?.replace(" ", "-") || "On-Track"}`}>
                    {g.status || "On Track"}
                  </span>
                </td>
                <td>
                  <button
                    className="btn-danger btn-sm"
                    onClick={() => handleDeleteGoal(g._id)}
                    disabled={deletingGoalId === g._id}
                  >
                    {deletingGoalId === g._id ? "Deleting…" : "Delete"}
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr><td colSpan={6} className="empty">No goals yet. Create one above.</td></tr>
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
              <option key={g._id} value={g._id}>{g.title}</option>
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

        {savingMessage && (
          <div className={`form-msg ${savingMessage.type}`}>
            {savingMessage.text}
          </div>
        )}
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
                  <td>{s.date ? toDateOnlyLocal(s.date)?.toLocaleDateString() : "-" }</td>
                  <td className="muted">{s.description}</td>
                  <td>
                    <button className="btn-danger btn-sm" onClick={() => handleDelete(s._id)}>
                      Delete
                    </button>
                  </td>
                </tr>
              );
            })
          ) : (
            <tr><td colSpan={5} className="empty">No savings found.</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default Savings;
