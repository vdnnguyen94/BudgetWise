import React, { useEffect, useState } from "react";
import incomeService from "../services/incomeService";
import "./Income.css";
import { toast } from "react-toastify"; 

const Income = () => {
    const userId = localStorage.getItem("userId");
    const [incomeList, setIncomeList] = useState([]);
    const [editingId, setEditingId] = useState(null);
    const [newIncome, setNewIncome] = useState({
        source: "",
        amount: "",
        date: "",
        description: "",
        recurrence: "one-time",
    });
    const [error, setError] = useState("");
    const [totalIncome, setTotalIncome] = useState(0);

    useEffect(() => {
        fetchIncome();
    }, []);

    const fetchIncome = async () => {
        try {
            const data = await incomeService.getIncome(userId);
            setIncomeList(data);
            const total = data.reduce((sum, inc) => sum + inc.amount, 0);
            setTotalIncome(total);
        } catch (error) {
            setError("Failed to fetch income.");
        }
    };

    const handleAddIncome = async (e) => {
        e.preventDefault();
        try {
            const incomeToAdd = {
                ...newIncome,
                amount: parseFloat(newIncome.amount),
                recurrence: newIncome.recurrence || "one-time",
            };

            await incomeService.createIncome(userId, incomeToAdd);
            toast.success("Income added successfully"); 
            setNewIncome({ source: "", amount: "", date: "", description: "", recurrence: "one-time" });
            fetchIncome();
        } catch (error) {
            setError("Failed to add income.");
        }
    };

    const handleDeleteIncome = async (incomeId) => {
        try {
            await incomeService.deleteIncome(userId, incomeId);
            toast.success("Income deleted successfully");
            fetchIncome();
        } catch (error) {
            setError("Failed to delete income.");
        }
    };

    const handleUpdateIncome = async (incomeId, updatedIncome) => {
        try {
            const formatted = { ...updatedIncome, amount: parseFloat(updatedIncome.amount) };
            await incomeService.updateIncome(userId, incomeId, formatted);
            toast.success("Income updated successfully");
            setEditingId(null); 
            fetchIncome();
        } catch {
            setError("Failed to update income.");
        }
    };

    const handleEditClick = (id) => {
        setEditingId(id);
    };

    const handleCancelEdit = () => {
        setEditingId(null);
        fetchIncome();
    };

    const totalSalary = incomeList
        .filter((i) => i.source === "Salary")
        .reduce((sum, i) => sum + i.amount, 0);

    return (
        <div className="income-container">
            <h1>Income Management</h1>
            {error && <p style={{ color: "red" }}>{error}</p>}

            <div className="summary-box">
                <h3>Total Income: ${totalIncome.toFixed(2)}</h3>
                <p>Salary: ${totalSalary.toFixed(2)}</p>
                <p>Other Income: ${(totalIncome - totalSalary).toFixed(2)}</p>
            </div>


            <h2>Add New Income</h2>
            <form onSubmit={handleAddIncome}>
                <select
                    value={newIncome.source}
                    onChange={(e) => setNewIncome({ ...newIncome, source: e.target.value })}
                    required
                >
                    <option value="">Select Source</option>
                    <option value="Salary">Salary</option>
                    <option value="Freelancing">Freelancing</option>
                    <option value="Business">Business</option>
                    <option value="Investments">Investments</option>
                    <option value="Rental Income">Rental Income</option>
                    <option value="YouTube Ad Revenue">YouTube Ad Revenue</option>
                    <option value="Affiliate Marketing">Affiliate Marketing</option>
                    <option value="Pension">Pension</option>
                    <option value="Student Grants">Student Grants</option>
                    <option value="Reselling">Reselling</option>
                </select>

                <input
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="Amount"
                    value={newIncome.amount}
                    onChange={(e) => setNewIncome({ ...newIncome, amount: e.target.value })}
                    required
                />

                <input
                    type="date"
                    value={newIncome.date}
                    onChange={(e) => setNewIncome({ ...newIncome, date: e.target.value })}
                    required
                />

                <input
                    type="text"
                    placeholder="Description"
                    value={newIncome.description}
                    onChange={(e) => setNewIncome({ ...newIncome, description: e.target.value })}
                />

                <select
                    value={newIncome.recurrence}
                    onChange={(e) => setNewIncome({ ...newIncome, recurrence: e.target.value })}
                >
                    <option value="one-time">One-Time</option>
                    <option value="weekly">Weekly</option>
                    <option value="biweekly">Biweekly</option>
                    <option value="monthly">Monthly</option>
                </select>

                <button type="submit">Add Income</button>
            </form>

            <h2>Your Income History</h2>
            <table>
                <thead>
                    <tr>
                        <th>Source</th>
                        <th>Amount ($)</th>
                        <th>Date</th>
                        <th>Description</th>
                        <th>Recurrence</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {incomeList.length > 0 ? (
                        incomeList.map((inc) => (
                            <tr key={inc._id}>
                                <td>{inc.source}</td>
                                <td>
                                    {editingId === inc._id ? (
                                        <input
                                            type="number"
                                            step="0.01"
                                            value={inc.amount}
                                            onChange={(e) =>
                                                setIncomeList((prev) =>
                                                    prev.map((i) =>
                                                        i._id === inc._id
                                                            ? { ...i, amount: e.target.value }
                                                            : i
                                                    )
                                                )
                                            }
                                        />
                                    ) : (
                                        inc.amount.toFixed(2)
                                    )}
                                </td>
                                <td>{new Date(inc.date).toLocaleDateString()}</td>
                                <td>{inc.description || "-"}</td>
                                <td>
                                    {editingId === inc._id ? (
                                        <select
                                            value={inc.recurrence}
                                            onChange={(e) =>
                                                setIncomeList((prev) =>
                                                    prev.map((i) =>
                                                        i._id === inc._id
                                                            ? { ...i, recurrence: e.target.value }
                                                            : i
                                                    )
                                                )
                                            }
                                        >
                                            <option value="one-time">One-Time</option>
                                            <option value="weekly">Weekly</option>
                                            <option value="biweekly">Biweekly</option>
                                            <option value="monthly">Monthly</option>
                                        </select>
                                    ) : (
                                        inc.recurrence
                                    )}
                                </td>
                                <td>
                                    {editingId === inc._id ? (
                                        <>
                                            <button
                                                onClick={() => handleUpdateIncome(inc._id, inc)}
                                                style={{
                                                    backgroundColor: "#007bff",
                                                    color: "white",
                                                    border: "none",
                                                    padding: "5px 10px",
                                                    borderRadius: "5px",
                                                    marginRight: "6px",
                                                }}
                                            >
                                                Update
                                            </button>
                                            <button
                                                onClick={handleCancelEdit}
                                                style={{
                                                    backgroundColor: "gray",
                                                    color: "white",
                                                    border: "none",
                                                    padding: "5px 10px",
                                                    borderRadius: "5px",
                                                }}
                                            >
                                                Cancel
                                            </button>
                                        </>
                                    ) : (
                                        <>
                                            <button
                                                onClick={() => handleEditClick(inc._id)}
                                                style={{
                                                    backgroundColor: "#007bff",
                                                    color: "white",
                                                    border: "none",
                                                    padding: "5px 10px",
                                                    borderRadius: "5px",
                                                    marginRight: "6px",
                                                }}
                                            >
                                                Edit
                                            </button>
                                            <button
                                                className="delete-btn"
                                                onClick={() => handleDeleteIncome(inc._id)}
                                            >
                                                Delete
                                            </button>
                                        </>
                                    )}
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan={6}>No income records found.</td>
                        </tr>
                    )}
                </tbody>

            </table>
        </div>
    );
};

export default Income;
