import React, { useEffect, useMemo, useState } from "react";
import goalService from "../services/goalService.js";
import "./Goals.css";

const GoalForm = ({ mode, values, setValues, busy, onSubmit, onCancel }) => {
  const isCreate = mode === "create";
  const buttonText = isCreate ? (busy ? "Adding…" : "Add Goal") : (busy ? "Saving…" : "Save");

  return (
    <form onSubmit={(e) => { e.preventDefault(); onSubmit(); }} className="goal-form form-grid">
      <input
        className="control"
        placeholder="Goal Title"
        value={values.title}
        onChange={(e) => setValues({ ...values, title: e.target.value })}
        required
      />
      <input
        className="control"
        type="number"
        placeholder="Target Amount"
        value={values.targetAmount}
        onChange={(e) => setValues({ ...values, targetAmount: e.target.value })}
        min="0"
        step="0.01"
        required
      />
      <input
        className="control"
        type="number"
        placeholder="Starting Amount"
        value={values.currentAmount}
        onChange={(e) => setValues({ ...values, currentAmount: e.target.value })}
        min="0"
        step="0.01"
      />
      <input
        className="control"
        type="date"
        value={values.deadline}
        onChange={(e) => setValues({ ...values, deadline: e.target.value })}
      />

      <input
        className="control"
        placeholder="25,50,75,100"
        value={values.alertPercentages}
        onChange={(e) => setValues({ ...values, alertPercentages: e.target.value })}
      />
      <input
        className="control"
        placeholder="7"
        value={values.alertBeforeDays}
        onChange={(e) => setValues({ ...values, alertBeforeDays: e.target.value })}
      />
      <input
        className="control"
        placeholder="Description"
        value={values.description}
        onChange={(e) => setValues({ ...values, description: e.target.value })}
      />

      <div className="form-actions">
        <button type="submit" className="btn-primary" disabled={busy}>{buttonText}</button>
        {!isCreate && (
          <button type="button" className="btn-secondary" onClick={onCancel}>Cancel</button>
        )}
      </div>
    </form>
  );
};

const normalizeGoalPayload = (v) => {
  const toNum = (x, fb = 0) => {
    const n = Number(x);
    return Number.isFinite(n) ? n : fb;
  };
  const toInt = (x, fb = 0) => {
    const n = parseInt(x, 10);
    return Number.isFinite(n) ? n : fb;
  };
  const toPercArray = (x) => {
    if (Array.isArray(x)) return x.map((n) => parseInt(n, 10)).filter(Number.isFinite);
    if (typeof x === "string") {
      const arr = x.split(/[,\s]+/).map((n) => parseInt(n, 10)).filter(Number.isFinite);
      return arr.length ? arr : undefined;
    }
    return undefined;
  };

  const payload = {
    title: (v.title ?? "").trim(),
    targetAmount: toNum(v.targetAmount, 0),
    currentAmount: toNum(v.currentAmount, 0),
    description: v.description ?? "",
  };

  if (v.deadline) payload.deadline = v.deadline;
  const ap = toPercArray(v.alertPercentages);
  if (ap) payload.alertPercentages = ap;
  if (v.alertBeforeDays !== undefined) payload.alertBeforeDays = toInt(v.alertBeforeDays, 7);

  return payload;
};

const Goals = () => {
  const userId = localStorage.getItem("userId");
  const [goals, setGoals] = useState([]);
  const [busy, setBusy] = useState({ create: false, save: false, contribute: {} });

  const emptyDraft = {
    title: "", targetAmount: "", currentAmount: "",
    deadline: "", description: "", alertPercentages: "25,50,75,100", alertBeforeDays: "7",
  };
  const [draft, setDraft] = useState(emptyDraft);
  const [editId, setEditId] = useState(null);
  const [edit, setEdit] = useState(null);
  const [contrib, setContrib] = useState({});

  const [alerts, setAlerts] = useState([]);

  const refresh = async () => {
    if (!userId) return;
    const data = await goalService.getGoals(userId);
    setGoals(Array.isArray(data) ? data : []);
  };

  useEffect(() => {
    if (userId) refresh();
  }, [userId]);

  const totalProgress = useMemo(() => {
    if (!goals.length) return 0;
    const sumT = goals.reduce((s, g) => s + Number(g?.targetAmount || 0), 0);
    const sumC = goals.reduce((s, g) => s + Number(g?.currentAmount || 0), 0);
    return sumT <= 0 ? 0 : Math.round((sumC / sumT) * 100);
  }, [goals]);

  const pullAlerts = async () => {
    if (!userId) return;
    try {
      const res = await goalService.checkAlerts(userId);
      if (res && Array.isArray(res.alerts) && res.alerts.length) {
        setAlerts((prev) => [...res.alerts, ...prev]);
      }
    } catch {  }
  };

  useEffect(() => {
    if (!userId) return;
    pullAlerts();
    const id = setInterval(pullAlerts, 30000);
    return () => clearInterval(id);
  }, [userId]);

  const onCreate = async () => {
    try {
      setBusy((b) => ({ ...b, create: true }));
      const payload = normalizeGoalPayload(draft);
      await goalService.createGoal(userId, payload);
      setDraft(emptyDraft);
      await refresh();
      await pullAlerts();
    } finally {
      setBusy((b) => ({ ...b, create: false }));
    }
  };

  const onEdit = (g) => {
    setEditId(g._id);
    setEdit({
      title: g.title || "",
      targetAmount: g.targetAmount ?? "",
      currentAmount: g.currentAmount ?? "",
      deadline: g.deadline ? String(g.deadline).slice(0, 10) : "",
      description: g.description || "",
      alertPercentages: (g.alertPercentages || []).join(","),
      alertBeforeDays: g.alertBeforeDays ?? "7",
    });
  };

  const onSave = async () => {
    if (!editId) return;
    try {
      setBusy((b) => ({ ...b, save: true }));
      const payload = normalizeGoalPayload(edit);
      await goalService.updateGoal(userId, editId, payload);
      setEditId(null);
      setEdit(null);
      await refresh();
      await pullAlerts();
    } finally {
      setBusy((b) => ({ ...b, save: false }));
    }
  };

  const onCancel = () => { setEditId(null); setEdit(null); };

  const onDelete = async (g) => {
    await goalService.deleteGoal(userId, g._id);
    await refresh();
    await pullAlerts();
  };

  const onContribute = async (g) => {
    const amount = Number(contrib[g._id]);
    if (!amount || amount <= 0) return;
    try {
      setBusy((b) => ({ ...b, contribute: { ...b.contribute, [g._id]: true } }));
      const res = await goalService.contributeGoal(userId, g._id, amount);
      if (res && Array.isArray(res.alerts) && res.alerts.length) {
        setAlerts((prev) => [...res.alerts, ...prev]);
      }
      await refresh();
      setContrib((m) => ({ ...m, [g._id]: "" }));
    } finally {
      setBusy((b) => ({ ...b, contribute: { ...b.contribute, [g._id]: false } }));
    }
  };

  const currency = (n) =>
    `$${Number(n ?? 0).toLocaleString(undefined, { minimumFractionDigits: 0 })}`;

  const toMidnight = (d) => { const x = new Date(d); x.setHours(0,0,0,0); return x; };
  const toDateOnlyLocal = (s) => {
    if (!s) return null;
    const m = String(s).match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (!m) return new Date(s);
    const [, y, mm, dd] = m.map(Number);
    return new Date(y, (mm || 1) - 1, dd || 1);
  };
  const daysFromToday = (dateStr) => {
    if (!dateStr) return null;
    const today = toMidnight(new Date());
    const target = toMidnight(toDateOnlyLocal(dateStr));
    return Math.round((target.getTime() - today.getTime()) / 86400000);
  };
  const remainingShort = (dateStr) => {
    const d = daysFromToday(dateStr);
    if (d === null) return "";
    if (d > 0) return `${d}d left`;
    if (d === 0) return "today";
    return `${Math.abs(d)}d overdue`;
  };
  const perc = (curr, target) => {
    const t = Number(target || 0), c = Number(curr || 0);
    return t <= 0 ? 0 : Math.round(Math.max(0, Math.min(1, c / t)) * 100);
  };

  return (
    <div className="container">
      <h2>Goals</h2>

      {alerts.length > 0 && (
        <div className="alert-box" role="status" aria-live="polite">
          {alerts.map((a, i) => (
            <div key={i} className={`alert-item alert-${a.type}`}>
              {a.type === "milestone" && <span>🎯 {a.message}</span>}
              {a.type === "deadline"  && <span>⏰ {a.message}</span>}
            </div>
          ))}
        </div>
      )}

      <section className="panel">
        <div className="panel__head"><h3>Create Goal</h3></div>
        <GoalForm
          mode="create"
          values={draft}
          setValues={setDraft}
          busy={busy.create}
          onSubmit={onCreate}
          onCancel={() => {}}
        />
      </section>

      {editId && (
        <section className="panel">
          <div className="panel__head"><h3>Edit Goal</h3></div>
          <GoalForm
            mode="edit"
            values={edit}
            setValues={setEdit}
            busy={busy.save}
            onSubmit={onSave}
            onCancel={onCancel}
          />
        </section>
      )}

      <table className="table">
        <thead>
          <tr>
            <th>Goal</th>
            <th>Saved / Target</th>
            <th>Deadline</th>
            <th className="col-progress">Progress</th>
            <th>Contribution</th>
            <th className="col-actions">Actions</th>
          </tr>
        </thead>
        <tbody>
          {goals.map((g) => {
            const p = perc(g.currentAmount, g.targetAmount);
            return (
              <tr key={g._id}>
                <td>{g.title}</td>
                <td>{currency(g.currentAmount)} / {currency(g.targetAmount)}</td>
                <td>
                  {g.deadline ? (
                    <>
                      <div>{toDateOnlyLocal(g.deadline)?.toLocaleDateString()}</div>
                      {" · "}
                      <small className="muted">
                        {remainingShort(g.deadline)}
                      </small>
                    </>
                  ) : (
                    "-"
                  )}
                </td>
                <td className="col-progress">
                  <div
                    className="progress"
                    role="progressbar"
                    aria-valuenow={p}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-label={`${p}%`}
                  >
                    <div className="progress-bar" style={{ width: `${p}%` }} />
                  </div>
                  <small>{p}%</small>
                  <br />
                  <small className="muted settings">
                    Alerts: {(g.alertPercentages || []).join(", ")}% · D-{g.alertBeforeDays}
                  </small>
                </td>
                <td>
                  <div className="inline-contrib">
                    <input
                      className="control"
                      type="number"
                      placeholder="Amount"
                      value={contrib[g._id] ?? ""}
                      onChange={(e) => setContrib((m) => ({ ...m, [g._id]: e.target.value }))}
                      min="0"
                      step="0.01"
                    />
                    <button
                      className="btn-primary btn-sm"
                      onClick={() => onContribute(g)}
                      disabled={!!busy.contribute[g._id]}
                    >
                      {busy.contribute[g._id] ? "Adding…" : "Add"}
                    </button>
                  </div>
                </td>
                <td className="col-actions">
                  <div className="row-actions">
                    <button className="btn-primary btn-sm" onClick={() => onEdit(g)}>Edit</button>
                    <button className="btn-danger btn-sm" onClick={() => onDelete(g)}>Delete</button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      <div className="totals">
        <span>Total progress: <strong>{totalProgress}%</strong></span>
      </div>
    </div>
  );
};

export default Goals;
