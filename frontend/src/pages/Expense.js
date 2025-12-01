import React, { useState, useEffect } from "react"; 
import budgetService from "../services/budgetService";
import expenseService from "../services/expenseService";
import budgetCategoryService from "../services/budgetCategoryService";
import "./Expense.css";
import goalService from "../services/goalService";
import subscriptionService from "../services/subscriptionService"; 

const ExpensePage = () => {
  const userId = localStorage.getItem("userId");

  const [expenses, setExpenses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isTableVisible, setIsTableVisible] = useState(true);
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);
  const [error, setError] = useState("");
  const [budgetId, setBudgetId] = useState(null);
  const [goals, setGoals] = useState([]);
  const [newExpense, setNewExpense] = useState({
    category: "", 
    amount: 0, 
    description: "",
    date: "",
    goal: "",
    paymentMethod: "",
  });

  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState("");

  // Date range states
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // SUBSCRIPTIONS STATE 
  const [subscriptions, setSubscriptions] = useState([]);                       
  const [isSubscriptionFormVisible, setIsSubscriptionFormVisible] = useState(false); 
  const [isEditingSubscription, setIsEditingSubscription] = useState(false);   
  const [editingSubscription, setEditingSubscription] = useState(null);        
  const [subscriptionError, setSubscriptionError] = useState("");              
  const [newSubscription, setNewSubscription] = useState({                     
    name: "",
    amount: 0,
    frequency: "Monthly",
    nextPaymentDate: "",
    isActive: true,
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

  // Fetch Expenses
  useEffect(() => {
    if (budgetId) {
        fetchExpenses();
        fetchCategories(budgetId); // Fetch categories when budgetId is available
    }
  }, [budgetId]);  // Refetch expenses when budgetId changes

  const fetchExpenses = async () => {
    try {
        const data = await expenseService.getExpenses(userId, { startDate, endDate });
        setExpenses(data);
        console.log("Fetched Expenses:", data); // Log the fetched expenses
    } catch (error) {
        setError("Failed to fetch expenses.");
    }
  };

  // Fetch Goals
  useEffect(() => {
    const fetchGoals = async () => {
      try {
        const goalData = await goalService.getGoals(userId);
        setGoals(goalData);
      } catch (error) {
        console.error("Failed to fetch goals:", error);
      }
    };
  
    if (userId) {
      fetchGoals(); // fetch goals 
    }
  }, [userId]);

  //  Fetch Subscriptions 
  useEffect(() => {                                           
    if (!userId) return;                                     
    const fetchSubs = async () => {                           
      try {
        const data = await subscriptionService.getSubscriptions(userId);
        setSubscriptions(data);
      } catch (err) {
        console.error("Failed to fetch subscriptions:", err);
        setSubscriptionError("Failed to fetch subscriptions.");
      }
    };
    fetchSubs();
  }, [userId]);                                               

  // Handle Add Expense
  const handleAddExpense = async (e) => {
    e.preventDefault();
    const currentDate = new Date().toISOString().split("T")[0]; // Get current date in YYYY-MM-DD format

    // Validate that the date is not in the future
    if (newExpense.date > currentDate) {
        setError("Expense date cannot be in the future.");
        return;
    }

    if (newExpense.amount <= 0) {
        setError("Amount cannot be negative.");
        return;
    }

    try {
        // Ensure category is included
        const expenseData = {
            categoryId: newExpense.category, 
            amount: newExpense.amount,
            description: newExpense.description,
            date: newExpense.date,
            goalId: newExpense.goal || null,
            paymentMethod: newExpense.paymentMethod,
        };
        console.log("CDEBUG CATEGORY ID of EXPENSE: ", expenseData);
        await expenseService.createExpense(userId, expenseData);
        setNewExpense({ category: "", amount: 0, description: "", date: "" , goal: "", paymentMethod: "",});
        fetchExpenses();  // Refetch expenses after adding
        setIsFormVisible(false);  // Hide the form
    } catch (error) {
        setError("Failed to add expense.");
    }
  };

  // Handle Update Expense
  const handleUpdateExpense = async (e) => {
    e.preventDefault();
    if (newExpense.amount < 0) {
      setError("Amount cannot be negative.");
      return;
    }

    try {
      const updatedExpenseData = {
        categoryId: newExpense.category,
        amount: newExpense.amount,
        description: newExpense.description,
        date: newExpense.date,
        goalId: newExpense.goal || null,
        paymentMethod: newExpense.paymentMethod,
      };

      await expenseService.updateExpense(userId, editingExpense._id, updatedExpenseData);
      setIsEditing(false);
      setEditingExpense(null);
      setIsFormVisible(false);
      fetchExpenses();  // Refetch the expenses after updating
    } catch (error) {
      setError("Failed to update expense.");
    }
  };

  // Show the Update Expense Form
  const handleEditExpense = (expense) => {
    
    const categoryId =
      expense.categoryId && expense.categoryId._id
        ? expense.categoryId._id
        : expense.categoryId || "";

    setIsEditing(true);
    setEditingExpense(expense);
    setNewExpense({
      category: categoryId,                                 
      amount: expense.amount,
      description: expense.description,
      date: expense.date ? expense.date.split("T")[0] : "",
      goal: expense.goalId || "",
      paymentMethod: expense.paymentMethod || "",
    });
    setIsFormVisible(true);
  };

  // Handle Delete Expense
  const handleDeleteExpense = async (expenseId) => {
    try {
      await expenseService.deleteExpense(userId, expenseId);
      fetchExpenses();  // Refetch expenses after deletion
    } catch (error) {
      setError("Failed to delete expense.");
    }
  };

  // Toggle visibility of the expense table
  const toggleTableVisibility = () => {
    setIsTableVisible(!isTableVisible);
  };

  // Toggle visibility of the Add Expense form
  const toggleFormVisibility = () => {
    setIsFormVisible(!isFormVisible);
    setIsEditing(false);  // Close editing form when toggling
  };

  // Handle date range filter submission
  const handleDateRangeSubmit = (e) => {
    e.preventDefault();
    fetchExpenses(); // Fetch expenses based on the selected date range
  };

  // Export expenses to CSV
  const exportToCSV = () => {
    const csvData = [
      ["Category", "Amount", "Date", "Description"],
      ...expenses.map(expense => [
        expense.categoryId ? expense.categoryId.name : "No category",
        expense.amount,
        new Date(expense.date).toISOString().split("T")[0],
        expense.description
      ])
    ];

    const csvContent = "data:text/csv;charset=utf-8," + csvData.map(e => e.join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "expenses.csv");
    document.body.appendChild(link);
    link.click();
  };

  const visibleExpenses = selectedCategoryFilter 
    ? expenses.filter((expense) => { 
        const id = expense.categoryId?._id || expense.categoryId; 
        return id === selectedCategoryFilter; 
      }) 
    : expenses; 

  //  SUBSCRIPTIONS HANDLERS (CRUD for recurring plans) 
  const toggleSubscriptionFormVisibility = () => {                         
    setIsSubscriptionFormVisible(!isSubscriptionFormVisible);
    setIsEditingSubscription(false);
    setEditingSubscription(null);
    setSubscriptionError("");
  };

  const handleAddSubscription = async (e) => {                             
    e.preventDefault();
    setSubscriptionError("");

    if (newSubscription.amount <= 0) {
      setSubscriptionError("Amount must be greater than 0.");
      return;
    }

    if (!newSubscription.nextPaymentDate) {
      setSubscriptionError("Next payment date is required.");
      return;
    }

    try {
      const subData = {
        name: newSubscription.name,
        amount: newSubscription.amount,
        frequency: newSubscription.frequency,
        nextPaymentDate: newSubscription.nextPaymentDate,
        isActive: newSubscription.isActive,
      };

      await subscriptionService.createSubscription(userId, subData);

      setNewSubscription({
        name: "",
        amount: 0,
        frequency: "Monthly",
        nextPaymentDate: "",
        isActive: true,
      });

      const updated = await subscriptionService.getSubscriptions(userId);
      setSubscriptions(updated);
      setIsSubscriptionFormVisible(false);
    } catch (err) {
      console.error(err);
      setSubscriptionError("Failed to add subscription.");
    }
  };

  const handleEditSubscription = (sub) => {                                
    setIsEditingSubscription(true);
    setEditingSubscription(sub);
    setNewSubscription({
      name: sub.name,
      amount: sub.amount,
      frequency: sub.frequency || "Monthly",
      nextPaymentDate: sub.nextPaymentDate
        ? sub.nextPaymentDate.split("T")[0]
        : "",
      isActive: sub.isActive,
    });
    setIsSubscriptionFormVisible(true);
    setSubscriptionError("");
  };

  const handleUpdateSubscription = async (e) => {                          
    e.preventDefault();
    setSubscriptionError("");

    if (newSubscription.amount <= 0) {
      setSubscriptionError("Amount must be greater than 0.");
      return;
    }

    try {
      const updatedData = {
        name: newSubscription.name,
        amount: newSubscription.amount,
        frequency: newSubscription.frequency,
        nextPaymentDate: newSubscription.nextPaymentDate,
        isActive: newSubscription.isActive,
      };

      await subscriptionService.updateSubscription(
        userId,
        editingSubscription._id,
        updatedData
      );

      const updated = await subscriptionService.getSubscriptions(userId);
      setSubscriptions(updated);

      setIsEditingSubscription(false);
      setEditingSubscription(null);
      setIsSubscriptionFormVisible(false);
    } catch (err) {
      console.error(err);
      setSubscriptionError("Failed to update subscription.");
    }
  };

  const handleDeleteSubscription = async (subId) => {                      
    try {
      await subscriptionService.deleteSubscription(userId, subId);
      const updated = await subscriptionService.getSubscriptions(userId);
      setSubscriptions(updated);
    } catch (err) {
      console.error(err);
      setSubscriptionError("Failed to delete subscription.");
    }
  };

  return (
    <div className="expense-container">
      <h1>Expense Management</h1>
      <button onClick={toggleTableVisibility}>
        {isTableVisible ? "Hide Expense Table" : "Show Expense Table"}
      </button>

      {/* Date Range Filter */}
      <form onSubmit={handleDateRangeSubmit}>
        <input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
        />
        <input
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
        />
        <button type="submit">Filter Expenses</button>
      </form>

      {/* Export to CSV Button */}
      <button onClick={exportToCSV}>Export to CSV</button>

      {/* Show the "Add Expense" button */}
      <button onClick={toggleFormVisibility}>
        {isFormVisible ? "Cancel" : "Add Expense"}
      </button>

      {/* Category filter dropdown */} 
      <select 
        value={selectedCategoryFilter} 
        onChange={(e) => setSelectedCategoryFilter(e.target.value)} 
        style={{ maxWidth: "200px", marginLeft: "10px", marginTop: "5px" }} 
      > 
        <option value="">All Categories</option> 
        {categories.map((category) => ( 
          <option key={category._id} value={category._id}> 
            {category.name} 
          </option>
        ))} 
      </select> 

      {/* If no expenses are found */}
      {expenses.length === 0 && !isFormVisible && (
        <p>No expenses, please add your expense.</p>
      )}

      {/* Expense Table */}
      {isTableVisible && (
        <table>
          <thead>
            <tr>
              <th>Category</th>
              <th>Amount</th>
              <th>Date</th>
              <th>Description</th>
              <th>Payment Method</th> {/* Add Payment Method column */}
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {visibleExpenses.map((expense) => ( 
              <tr key={expense._id}>
                <td>{expense.categoryId ? expense.categoryId.name : "No category"}</td>
                <td>{"$" + parseFloat(expense.amount).toFixed(2)}</td>
                <td>{new Date(expense.date).toISOString().split("T")[0]}</td>
                <td>{expense.description}</td>
                <td>{expense.paymentMethod || "N/A"}</td> {/* Display Payment Method */}
                <td>
                  <button onClick={() => handleEditExpense(expense)}>Update</button>
                  <button onClick={() => handleDeleteExpense(expense._id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* Add or Edit Expense Form */}
      {(isFormVisible || isEditing) && (
        <form onSubmit={isEditing ? handleUpdateExpense : handleAddExpense}>
          <h2>{isEditing ? "Update Expense" : "Add Expense"}</h2>
          <select
            value={newExpense.category}
            onChange={(e) => setNewExpense({ ...newExpense, category: e.target.value })}
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
            value={newExpense.amount}
            onChange={(e) =>
              setNewExpense({ ...newExpense, amount: parseFloat(e.target.value) })
            }
            required
            min="0"
            step="0.01"
          />
          <input
            type="text"
            placeholder="Description"
            value={newExpense.description}
            onChange={(e) =>
              setNewExpense({ ...newExpense, description: e.target.value })
            }
            required
          />
          <input
            type="date"
            value={newExpense.date}
            onChange={(e) => setNewExpense({ ...newExpense, date: e.target.value })}
            required
            max={new Date().toISOString().split("T")[0]}
          />

          <div>
            <select
              id="paymentMethod"
              value={newExpense.paymentMethod}
              onChange={(e) =>
                setNewExpense({ ...newExpense, paymentMethod: e.target.value })
              }
              style={{ width: "100%", padding: "8px", marginBottom: "15px" }}
            >
              <option value="">Select Payment Method</option>
              <option value="Cash">Cash</option>
              <option value="Credit Card">Credit Card</option>
              <option value="Debit Card">Debit Card</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <select
            value={newExpense.goal}
            onChange={(e) => setNewExpense({ ...newExpense, goal: e.target.value })}
          >
            <option value="">Optional: Link to Goal</option>
            {goals.map((goal) => (
              <option key={goal._id} value={goal._id}>
                {goal.title}
              </option>
            ))}
          </select>
          <button type="submit">{isEditing ? "Update Expense" : "Add Expense"}</button>
          <button type="button" onClick={toggleFormVisibility}>
            Cancel
          </button>
        </form>
      )}

      {error && <p style={{ color: "red" }}>{error}</p>}

      {/*  SUBSCRIPTIONS SECTION - Active plans + CRUD UI */}
      <hr style={{ margin: "2rem 0" }} /> 
      <h2>Subscription Plans (Recurring Expenses)</h2> 

      <button onClick={toggleSubscriptionFormVisibility}>
        {isSubscriptionFormVisible || isEditingSubscription
          ? "Cancel"
          : "Add Subscription"}
      </button>

      {subscriptions.length === 0 && !isSubscriptionFormVisible && !isEditingSubscription && (
        <p>No subscriptions yet. Add your recurring payments here.</p>  
      )}

      {subscriptions.length > 0 && (   
        <table style={{ marginTop: "1rem" }}>
          <thead>
            <tr>
              <th>Name</th>
              <th>Amount</th>
              <th>Frequency</th>
              <th>Next Payment</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {subscriptions.map((sub) => (
              <tr key={sub._id}>
                <td>{sub.name}</td>
                <td>${Number(sub.amount).toFixed(2)}</td>
                <td>{sub.frequency}</td>
                <td>
                  {sub.nextPaymentDate
                    ? new Date(sub.nextPaymentDate)
                        .toISOString()
                        .split("T")[0]
                    : "N/A"}
                </td>
                <td>{sub.isActive ? "Active" : "Stopped"}</td>
                <td>
                  <button onClick={() => handleEditSubscription(sub)}>
                    Edit
                  </button>
                  <button onClick={() => handleDeleteSubscription(sub._id)}>
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {(isSubscriptionFormVisible || isEditingSubscription) && ( 
        <form
          onSubmit={
            isEditingSubscription
              ? handleUpdateSubscription
              : handleAddSubscription
          }
          style={{ marginTop: "1rem" }}
        >
          <h3>
            {isEditingSubscription
              ? "Edit Subscription"
              : "Add New Subscription"}
          </h3>

          <input
            type="text"
            placeholder="Subscription Name (e.g. Netflix)"
            value={newSubscription.name}
            onChange={(e) =>
              setNewSubscription({ ...newSubscription, name: e.target.value })
            }
            required
          />

          <input
            type="number"
            placeholder="Amount"
            value={newSubscription.amount}
            onChange={(e) =>
              setNewSubscription({
                ...newSubscription,
                amount: parseFloat(e.target.value) || 0,
              })
            }
            required
            min="0"
            step="0.01"
          />

          <select
            value={newSubscription.frequency}
            onChange={(e) =>
              setNewSubscription({
                ...newSubscription,
                frequency: e.target.value,
              })
            }
          >
            <option value="Daily">Daily</option>
            <option value="Weekly">Weekly</option>
            <option value="Monthly">Monthly</option>
            <option value="Yearly">Yearly</option>
          </select>

          <input
            type="date"
            value={newSubscription.nextPaymentDate}
            onChange={(e) =>
              setNewSubscription({
                ...newSubscription,
                nextPaymentDate: e.target.value,
              })
            }
            required
          />

          <label style={{ display: "block", marginTop: "0.5rem" }}>
            <input
              type="checkbox"
              checked={newSubscription.isActive}
              onChange={(e) =>
                setNewSubscription({
                  ...newSubscription,
                  isActive: e.target.checked,
                })
              }
              style={{ marginRight: "0.5rem" }}
            />
            Active
          </label>

          <button type="submit" style={{ marginTop: "0.5rem" }}>
            {isEditingSubscription ? "Update Subscription" : "Add Subscription"}
          </button>
        </form>
      )}

      {subscriptionError && (
        <p style={{ color: "red", marginTop: "0.5rem" }}>
          {subscriptionError}
        </p>
      )}
    </div>
  );
};

export default ExpensePage;
