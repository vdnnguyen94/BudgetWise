import React, { useEffect, useState } from "react";
import savingService from "../services/savingService";
import './Savings.css';


const Savings = () => {
  const userId = localStorage.getItem("userId");
  const [savings, setSavings] = useState([]);
  const [newSaving, setNewSaving] = useState({
    title: "",
    amount: 0,
    date: "",
    description: "",
  });
  const [error, setError] = useState("");

  useEffect(() => {
    if (userId) fetchSavings();
  }, [userId]);

  const fetchSavings = async () => {
    try {
      const data = await savingService.getSavings(userId);
      setSavings(data);
    } catch (err) {
      setError("Failed to load savings.");
    }
  };

  const handleAddSaving = async (e) => {
    e.preventDefault();
    try {
      await savingService.createSaving(userId, newSaving);
      setNewSaving({ title: "", amount: 0, date: "", description: "" });
      fetchSavings();
    } catch (err) {
      setError("Failed to add saving");
    }
  };

  const handleDelete = async (savingId) => {
    try {
      await savingService.deleteSaving(userId, savingId);
      fetchSavings();
    } catch (err) {
      setError("Failed to delete saving");
    }
  };

  return (
    <div className="container">
      <h2>Savings</h2>
      {error && <p style={{ color: "red" }}>{error}</p>}

      <form onSubmit={handleAddSaving}>
        <input
          placeholder="Title"
          value={newSaving.title}
          onChange={(e) => setNewSaving({ ...newSaving, title: e.target.value })}
          required
        />
        <input
         type="number"
          min="0"
         step="0.01"
          placeholder="Amount"
         value={newSaving.amount === 0 ? "" : newSaving.amount}
         onChange={(e) =>
         setNewSaving({ ...newSaving, amount: +e.target.value })
         }
         required
       />

        <input
          type="date"
          value={newSaving.date}
          onChange={(e) => setNewSaving({ ...newSaving, date: e.target.value })}
        />
        <input
          placeholder="Description"
          value={newSaving.description}
          onChange={(e) => setNewSaving({ ...newSaving, description: e.target.value })}
        />
        <button type="submit">Add Saving</button>
      </form>

      <table>
        <thead>
          <tr>
            <th>Title</th>
            <th>Amount</th>
            <th>Date</th>
            <th>Description</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {savings.length > 0 ? (
            savings.map((s) => (
              <tr key={s._id}>
                <td>{s.title}</td>
                <td>${s.amount}</td>
                <td>{new Date(s.date).toLocaleDateString()}</td>
                <td>{s.description}</td>
                <td>
                  <button onClick={() => handleDelete(s._id)}>Delete</button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="5">No savings found.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default Savings;
