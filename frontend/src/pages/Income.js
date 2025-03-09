import React, { useEffect, useState } from "react";
import incomeService from "../services/incomeService";
import "./Income.css";

const Income = () => {
    const userId = localStorage.getItem("userId");
    const [income, setIncome] = useState([]);
    const [newIncome, setNewIncome] = useState({ source: "", amount: 0, date: "", description: "" });
    const [error, setError] = useState("");

    useEffect(() => {
        fetchIncome();
    }, []);

    const fetchIncome = async () => {
        try {
            const data = await incomeService.getIncome(userId);
            setIncome(data);
        } catch (error) {
            setError("Failed to fetch income.");
        }
    };

    const handleAddIncome = async (e) => {
        e.preventDefault();
        try {
            await incomeService.createIncome(userId, newIncome);
            setNewIncome({ source: "", amount: 0, date: "", description: "" });
            fetchIncome();
        } catch (error) {
            setError("Failed to add income.");
        }
    };

    return (
        <div>
            <h1>Income Management</h1>
            {error && <p style={{ color: "red" }}>{error}</p>}
            <form onSubmit={handleAddIncome}>
                <input type="text" placeholder="Source" value={newIncome.source} onChange={(e) => setNewIncome({ ...newIncome, source: e.target.value })} required />
                <input type="number" placeholder="Amount" value={newIncome.amount} onChange={(e) => setNewIncome({ ...newIncome, amount: e.target.value })} required />
                <input type="date" value={newIncome.date} onChange={(e) => setNewIncome({ ...newIncome, date: e.target.value })} required />
                <input type="text" placeholder="Description" value={newIncome.description} onChange={(e) => setNewIncome({ ...newIncome, description: e.target.value })} />
                <button type="submit">Add Income</button>
            </form>
            <ul>
                {income.map((inc) => (
                    <li key={inc._id}>{inc.source} - ${inc.amount} - {new Date(inc.date).toLocaleDateString()}</li>
                ))}
            </ul>
        </div>
    );
};

export default Income;
