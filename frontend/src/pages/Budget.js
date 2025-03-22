import React, { useEffect, useState } from "react";
import budgetService from "../services/budgetService";
import budgetCategoryService from "../services/budgetCategoryService";
import "./Budget.css";
import expenseService from "../services/expenseService"; // Adjust the path as necessary
import incomeService from "../services/incomeService"; // Adjust the path as necessary

const Budget = () => {
  const userId = localStorage.getItem("userId");

  const [budget, setBudget] = useState(null);
  const [totalBudget, setTotalBudget] = useState("");
  const [categories, setCategories] = useState([]);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [categoryLimit, setCategoryLimit] = useState(""); // New state for category limit
  const [error, setError] = useState("");
  const [showAddCategoryForm, setShowAddCategoryForm] = useState(false); // State to toggle the form visibility
  const [isEditingCategory, setIsEditingCategory] = useState(false); // State for editing
  const [editingCategory, setEditingCategory] = useState(null); // Store the category being edited
  const [showUpdateBudgetForm, setShowUpdateBudgetForm] = useState(false);// State to toggle budget update form
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  useEffect(() => {
    fetchBudget();
  }, []);

  // Fetch Budget

  
  const fetchBudget = async () => {
    try {
        const data = await budgetService.getBudget(userId, { startDate, endDate });
        if (data && data.totalBudget) {
            setBudget(data);
            setTotalBudget(data.totalBudget);
        }
    } catch (error) {
        setError("Failed to fetch budget.");
    }
};
// Fetch categories only after budget is fetched
    useEffect(() => {
        if (budget && budget._id) {  // Make sure budget is available
            console.log("TRYING TO FETCH BUDGET CATEGORY");
            console.log("BUDGET: ", budget);
            fetchCategories();  // Now fetch categories
        }
    }, [budget]);  // This will trigger whenever 'budget' changes

    const fetchCategories = async () => {
        try {
            const data = await budgetCategoryService.getCategories(budget._id); // Fetch categories using budget._id
            console.log("Fetched Categories:", data); // Check the fetched data
            setCategories(data);
        } catch (error) {
            setError("Failed to fetch categories.");
        }
    };
  // Add Category
  const handleAddCategory = async (e) => {
    e.preventDefault();
    if (categoryLimit <= totalBudget) {
      try {
        // Create a new category
        const categoryData = { name: newCategoryName, limit: categoryLimit };
        await budgetCategoryService.createCategory(budget._id, categoryData); // Use budget._id for budgetId
  
        // Refetch the budget and categories
        fetchBudget();  // Refetch the budget to update the totalBudget
        fetchCategories();  // Refetch categories to show the newly added category
  
        // Reset the form inputs
        setNewCategoryName(""); // Reset input field
        setCategoryLimit(""); // Reset limit input
        setShowAddCategoryForm(false); // Hide the form after adding the category
      } catch (error) {
        setError("Failed to add category.");
      }
    } else {
      setError("Category limit cannot exceed total budget.");
    }
  };
  

  // Delete Category
  const handleDeleteCategory = async (categoryId) => {
    try {
      await budgetCategoryService.deleteCategory(budget._id, categoryId); // Use budget._id for budgetId
      setCategories(categories.filter(category => category._id !== categoryId));
      updateTotalBudget(); // Update total budget
    } catch (error) {
      setError("Failed to delete category.");
    }
  };

  // Update Category (Show form with category data)
  const handleUpdateCategory = (category) => {
    setEditingCategory(category); // Set the category being edited
    setNewCategoryName(category.name); // Pre-fill name
    setCategoryLimit(category.limit); // Pre-fill limit
    setIsEditingCategory(true); // Show the form
  };

  // Submit Update Category
  const handleUpdateCategorySubmit = async (e) => {
    e.preventDefault();
    if (categoryLimit <= totalBudget) {
      try {
        const updatedCategory = { name: newCategoryName, limit: categoryLimit };
        const updated = await budgetCategoryService.updateCategory(budget._id, editingCategory._id, updatedCategory);
        setCategories(categories.map(cat => cat._id === updated._id ? updated : cat)); // Update the category in the state
        updateTotalBudget(); // Recalculate total budget
        setIsEditingCategory(false); // Close the form after update
      } catch (error) {
        setError("Failed to update category.");
      }
    } else {
      setError("Category limit cannot exceed total budget.");
    }
  };

  // Update Total Budget based on categories
  const updateTotalBudget = () => {
    let total = 0;
    categories.forEach((category) => {
      total += category.limit || 0; // Assuming each category has a 'limit' field
    });
    setTotalBudget(total);
  };

  // Update Budget
  const handleUpdateBudget = async (e) => {
    e.preventDefault();
    try {
      const updatedBudget = await budgetService.createOrUpdateBudget(userId, { totalBudget });
      setBudget(updatedBudget);
      setShowUpdateBudgetForm(false); // Close the form after updating
    } catch (error) {
      setError("Failed to update budget.");
    }
  };

  // Delete Budget
  const handleDeleteBudget = async () => {
    try {
      await budgetService.deleteBudget(budget._id);
      setBudget(null);
      setTotalBudget("");
      setCategories([]); // Clear categories when the budget is deleted
    } catch (error) {
      setError("Failed to delete budget.");
    }
  };

  const handleDateRangeSubmit = (e) => {
    e.preventDefault();
    fetchBudget(); // Fetch budget with the selected date range
};


  return (
    <div className="budget-page">
      <h1 className="page-title">Budget Page</h1>
      <h2>Budget Management</h2>
      {error && <p style={{ color: "red" }}>{error}</p>}

      {budget ? (
        <div>
          <p><strong>Current Budget:</strong> ${budget.totalBudget}</p>
          <button onClick={() => setShowUpdateBudgetForm(true)}>Update Budget</button>
          <button onClick={() => handleDeleteBudget()}>Delete Budget</button>

            {/* Update Budget Form */}
            {showUpdateBudgetForm && (
            <div>
              <h3>Update Budget</h3>
              <form onSubmit={handleUpdateBudget}>
                <input
                  type="number"
                  placeholder="Enter new total budget"
                  value={totalBudget}
                  onChange={(e) => setTotalBudget(e.target.value)}
                  required
                />
                <button type="submit">Update Budget</button>
              </form>
            </div>
          )}
          <div>
            <h3>Budget Categories</h3>
            {categories.length === 0 ? (
              <p>No budget categories, please create a budget category.</p>
            ) : (
              <ul>
                {categories.map((category) => (
                  <li key={category._id}>
                    {category.name} - ${category.limit} 
                    <button onClick={() => handleUpdateCategory(category)}>Update</button>
                    <button onClick={() => handleDeleteCategory(category._id)}>Delete</button>
                  </li>
                ))}
              </ul>
            )}
            <button onClick={() => setShowAddCategoryForm(!showAddCategoryForm)}>
              {showAddCategoryForm ? "Cancel" : "Add Category"}
            </button>

            {showAddCategoryForm && (
              <form onSubmit={handleAddCategory}>
                <input
                  type="text"
                  placeholder="Enter new category name"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  required
                />
                <input
                  type="number"
                  placeholder="Enter category limit"
                  value={categoryLimit}
                  onChange={(e) => setCategoryLimit(e.target.value)}
                  required
                />
                <button type="submit">Add Category</button>
              </form>
            )}
          </div>
        </div>
      ) : (
        <div>
          <h3>No Budget, please create one</h3>
          <form onSubmit={handleUpdateBudget}>
            <input
              type="number"
              placeholder="Enter total budget"
              value={totalBudget}
              onChange={(e) => setTotalBudget(e.target.value)}
              required
            />
            <button type="submit">Save Budget</button>
          </form>
        </div>
      )}

      {/* Update Category Form */}
      {isEditingCategory && (
        <div>
          <h3>Update Category</h3>
          <form onSubmit={handleUpdateCategorySubmit}>
            <input
              type="text"
              placeholder="Category Name"
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              required
            />
            <input
              type="number"
              placeholder="Category Limit"
              value={categoryLimit}
              onChange={(e) => setCategoryLimit(e.target.value)}
              required
            />
            <button type="submit">Update Category</button>
          </form>
        </div>
      )}

    

    </div>
  );
};

export default Budget;
