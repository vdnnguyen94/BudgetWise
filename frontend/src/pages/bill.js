import React, { useState, useEffect } from "react";
import billService from "../services/billService";
import budgetCategoryService from "../services/budgetCategoryService";
import "./bill.css";
import budgetService from "../services/budgetService";

const BillPage = () => {
  const userId = localStorage.getItem("userId");

  const [bills, setBills] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isTableVisible, setIsTableVisible] = useState(true);
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingBill, setEditingBill] = useState(null);
  const [error, setError] = useState("");
  const [budgetId, setBudgetId] = useState(null);
  const [newBill, setNewBill] = useState({
    category: "", 
    amount: 0, 
    description: "",
    date: "",
  });

  // Fetch Budget to get the budgetId
  useEffect(() => {
    const fetchBudget = async () => {
        try {
            console.log("USER ID :", userId);
            const data = await budgetService.getBudget(userId);  
            console.log("Fetched Budget:", data);
            if (data && data._id) {
                setBudgetId(data._id); 
                fetchCategories(data._id); // Fetch categories using the budgetId
            }
        } catch (error) {
            setError("Failed to fetch budget.");
        }
    };
    fetchBudget(); // Fetch the budget when component mounts
  }, [userId]);

  // Fetch Categories using budgetId
  const fetchCategories = async (budgetId) => {
    try {
        console.log("budget ID :", budgetId);
        const data = await budgetCategoryService.getCategories(budgetId);
        console.log("FETCH BUDGET: ", data);
        setCategories(data);
    } catch (error) {
        setError("Failed to fetch categories.");
    }
  };

  // Fetch Bills
  useEffect(() => {
    if (budgetId) {
        fetchBills();
        fetchCategories(budgetId); // Fetch categories when budgetId is available
    }
  }, [budgetId]);  // Refetch bills when budgetId changes

  const fetchBills = async () => {
    try {
        const data = await billService.getBills(userId);
        setBills(data);
        console.log("BILL DATA: ", data);
    } catch (error) {
        setError("Failed to fetch bills.");
    }
  };

  // Handle Add Bill
  const handleAddBill = async (e) => {
    e.preventDefault();
    // const currentDate = new Date().toISOString().split("T")[0]; // Get current date in YYYY-MM-DD format
    
    // // Validate that the date is not in the future
    // if (newBill.date > currentDate) {
    //     setError("Bill date cannot be in the future.");
    //     return;
    // }

    if (newBill.amount <= 0) {
        setError("Amount cannot be negative.");
        return;
    }

    try {
                // Ensure category is included
        const billData = {
            categoryId: newBill.category, 
            amount: newBill.amount,
            description: newBill.description,
            date: newBill.date
        };
        console.log("CDEBUG CATEGORY ID of EXPENSE: ", billData);
        await billService.createBill(userId, billData);
        setNewBill({ category: "", amount: 0, description: "", date: "" });  // Reset form
        fetchBills();  // Refetch bills after adding
        setIsFormVisible(false);  // Hide the form
    } catch (error) {
        setError("Failed to add bill.");
    }
  };

  // Handle Update Bill
  const handleUpdateBill = async (e) => {
    e.preventDefault();
    if (newBill.amount < 0) {
      setError("Amount cannot be negative.");
      return;
    }

    try {
      await billService.updateBill(userId, editingBill._id, newBill);
      setIsEditing(false);
      setEditingBill(null);
      setIsFormVisible(false);
      fetchBills();  // Refetch the bills after updating
    } catch (error) {
      setError("Failed to update bill.");
    }
  };

  // Show the Update Bill Form
  const handleEditBill = (bill) => {
    setIsEditing(true);
    setEditingBill(bill);
    setNewBill({ categoryId: bill.category, amount: bill.amount, description: bill.description });
    setIsFormVisible(true);
  };

  // Handle Delete Bill
  const handleDeleteBill = async (billId) => {
    try {
      await billService.deleteBill(userId, billId);
      fetchBills();  // Refetch bills after deletion
    } catch (error) {
      setError("Failed to delete bill.");
    }
  };

  // Toggle visibility of the bill table
  const toggleTableVisibility = () => {
    setIsTableVisible(!isTableVisible);
  };

  // Toggle visibility of the Add Bill form
  const toggleFormVisibility = () => {
    setIsFormVisible(!isFormVisible);
    setIsEditing(false);  // Close editing form when toggling
  };

  return (
    <div>
      <h1>Bill Management</h1>
      <button onClick={toggleTableVisibility}>
        {isTableVisible ? "Hide Bill Table" : "Show Bill Table"}
      </button>

      {/* Show the "Add Bill" button */}
      <button onClick={toggleFormVisibility}>
        {isFormVisible ? "Cancel" : "Add Bill"}
      </button>

      {/* If no bills are found */}
      {bills.length === 0 && !isFormVisible && (
        <p>No bills, please add your bill.</p>
      )}

      {/* Bill Table */}
      {isTableVisible && (
        <table>
          <thead>
            <tr>
              <th>Category</th>
              <th>Amount</th>
              <th>Date</th>
              <th>Description</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {bills.map((bill) => (
              <tr key={bill._id}>
                <td>{bill.categoryId ? bill.categoryId.name : "No category"}</td> 
                <td>{"$" + parseFloat(bill.amount).toFixed(2)}</td>
                <td>{bill.date}</td> 
                <td>{bill.description}</td>
                <td>
                  <button onClick={() => handleEditBill(bill)}>Update</button>
                  <button onClick={() => handleDeleteBill(bill._id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* Add or Edit Bill Form */}
      {(isFormVisible || isEditing) && (
        <form onSubmit={isEditing ? handleUpdateBill : handleAddBill}>
          <h2>{isEditing ? "Update Bill" : "Add Bill"}</h2>
          <select
            value={newBill.category}
            onChange={(e) => setNewBill({ ...newBill, category: e.target.value })}
            required
          >
            <option value="">Select Category</option>
            {categories.map((category) => (
              <option key={category._id} value={category._id}>
                {category.name}
              </option>
            ))}
          </select>
          <input
            type="number"
            placeholder="Amount"
            value={newBill.amount}
            onChange={(e) => setNewBill({ ...newBill, amount: e.target.value })}
            required
            min="0"
            step="0.01"
          />
          <input
            type="text"
            placeholder="Description"
            value={newBill.description}
            onChange={(e) => setNewBill({ ...newBill, description: e.target.value })}
            required
          />
          <input
            type="date"
            value={newBill.date}
            onChange={(e) => setNewBill({ ...newBill, date: e.target.value })}
            required
            //max={new Date().toISOString().split("T")[0]}
          />
          <button type="submit">{isEditing ? "Update Bill" : "Add Bill"}</button>
          <button type="button" onClick={toggleFormVisibility}>
            Cancel
          </button>
        </form>
      )}

      {error && <p style={{ color: "red" }}>{error}</p>}
    </div>
  );
};

export default BillPage;
