// import React, { useEffect, useState } from "react";
// import incomeService from "../services/incomeService";
// import "./Income.css";

// const Income = () => {
//     const userId = localStorage.getItem("userId");
//     const [incomeList, setIncomeList] = useState([]);  // List of incomes
//     const [newIncome, setNewIncome] = useState({ source: "", amount: 0, date: "", description: "" });
//     const [error, setError] = useState("");
//     const [totalIncome, setTotalIncome] = useState(0);

//     useEffect(() => {
//         fetchIncome();
//     }, []);

//     const fetchIncome = async () => {
//         try {
//             const data = await incomeService.getIncome(userId);
//             setIncomeList(data);
//             // Calculate total income
//             const total = data.reduce((sum, inc) => sum + inc.amount, 0);
//             setTotalIncome(total);
//         } catch (error) {
//             setError("Failed to fetch income.");
//         }
//     };

//     const handleAddIncome = async (e) => {
//         e.preventDefault();
//         try {
//             await incomeService.createIncome(userId, newIncome);
//             setNewIncome({ source: "", amount: 0, date: "", description: "" });
//             fetchIncome();
//         } catch (error) {
//             setError("Failed to add income.");
//         }
//     };

//     const handleDeleteIncome = async (incomeId) => {
//         try {
//             await incomeService.deleteIncome(userId, incomeId);
//             fetchIncome();
//         } catch (error) {
//             setError("Failed to delete income.");
//         }
//     };

//     return (
//         <div className="income-container">
//             <h1>Income Management</h1>
//             {error && <p style={{ color: "red" }}>{error}</p>}

//             {/* Income Summary */}
//             <div className="summary-box">
//                 <h3>Total Income: ${totalIncome}</h3>
//             </div>

//             {/* Income Entry Form */}
//             <form onSubmit={handleAddIncome}>
//                 <input type="text" placeholder="Source" value={newIncome.source} onChange={(e) => setNewIncome({ ...newIncome, source: e.target.value })} required />
//                 <input type="number" placeholder="Amount" value={newIncome.amount} onChange={(e) => setNewIncome({ ...newIncome, amount: Number(e.target.value) })} required />
//                 <input type="date" value={newIncome.date} onChange={(e) => setNewIncome({ ...newIncome, date: e.target.value })} required />
//                 <input type="text" placeholder="Description" value={newIncome.description} onChange={(e) => setNewIncome({ ...newIncome, description: e.target.value })} />
//                 <button type="submit">Add Income</button>
//             </form>

//             {/* Income List */}
//             <ul>
//                 {incomeList.length > 0 ? (
//                     incomeList.map((inc) => (
//                         <li key={inc._id}>
//                             <span>{inc.source} - ${inc.amount} - {new Date(inc.date).toLocaleDateString()}</span>
//                             <button className="delete-btn" onClick={() => handleDeleteIncome(inc._id)}>Delete</button>
//                         </li>
//                     ))
//                 ) : (
//                     <p>No income records found.</p>
//                 )}
//             </ul>
//         </div>
//     );
// };

// export default Income;
import React, { useEffect, useState } from "react";
import incomeService from "../services/incomeService";
import "./Income.css";

const Income = () => {
    const userId = localStorage.getItem("userId");
    const [incomeList, setIncomeList] = useState([]);
    const [newIncome, setNewIncome] = useState({ source: "", amount: 0, date: "", description: "" });
    const [error, setError] = useState("");
    const [totalIncome, setTotalIncome] = useState(0);
    const [filter, setFilter] = useState("monthly"); // Default filter is monthly

    useEffect(() => {
        fetchIncome();
    }, [filter]); // Fetch income when the filter changes

    const fetchIncome = async () => {
        try {
            const data = await incomeService.getIncome(userId);
            
            // Filter income based on selected filter
            const filteredData = filterIncome(data, filter);

            setIncomeList(filteredData);

            // Calculate total income
            const total = filteredData.reduce((sum, inc) => sum + inc.amount, 0);
            setTotalIncome(total);
        } catch (error) {
            setError("Failed to fetch income.");
        }
    };

    const filterIncome = (data, filterType) => {
        const today = new Date();
        return data.filter((inc) => {
            const incomeDate = new Date(inc.date);
            if (filterType === "monthly") {
                return incomeDate.getMonth() === today.getMonth() && incomeDate.getFullYear() === today.getFullYear();
            } else if (filterType === "weekly") {
                const oneWeekAgo = new Date();
                oneWeekAgo.setDate(today.getDate() - 7);
                return incomeDate >= oneWeekAgo;
            }
            return true; // Default: show all income
        });
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

    const handleDeleteIncome = async (incomeId) => {
        try {
            await incomeService.deleteIncome(userId, incomeId);
            fetchIncome();
        } catch (error) {
            setError("Failed to delete income.");
        }
    };

    return (
        <div className="income-container">
            <h1>Income Management</h1>
            {error && <p style={{ color: "red" }}>{error}</p>}

            {/* Income Summary */}
            <div className="summary-box">
                <h3>Total {filter === "monthly" ? "Monthly" : "Weekly"} Income: ${totalIncome}</h3>
                <select onChange={(e) => setFilter(e.target.value)} value={filter}>
                    <option value="monthly">Monthly</option>
                    <option value="weekly">Weekly</option>
                    <option value="all">All Time</option>
                </select>
            </div>

            {/* Income List */}
            <h2>Your Income History</h2>
            <ul>
                {incomeList.length > 0 ? (
                    incomeList.map((inc) => (
                        <li key={inc._id}>
                            <span>{inc.source} - ${inc.amount} - {new Date(inc.date).toLocaleDateString()}</span>
                            <button className="delete-btn" onClick={() => handleDeleteIncome(inc._id)}>Delete</button>
                        </li>
                    ))
                ) : (
                    <p>No income records found.</p>
                )}
            </ul>

            {/* Income Entry Form */}
            <h2>Add New Income</h2>
            <form onSubmit={handleAddIncome}>
                <input type="text" placeholder="Source" value={newIncome.source} onChange={(e) => setNewIncome({ ...newIncome, source: e.target.value })} required />
                <input type="number" placeholder="Amount" value={newIncome.amount} onChange={(e) => setNewIncome({ ...newIncome, amount: Number(e.target.value) })} required />
                <input type="date" value={newIncome.date} onChange={(e) => setNewIncome({ ...newIncome, date: e.target.value })} required />
                <input type="text" placeholder="Description" value={newIncome.description} onChange={(e) => setNewIncome({ ...newIncome, description: e.target.value })} />
                <button type="submit">Add Income</button>
            </form>
        </div>
    );
};

export default Income;
