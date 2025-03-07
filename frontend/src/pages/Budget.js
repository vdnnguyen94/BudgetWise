import React, { useEffect, useState } from "react";
import budgetService from "../services/budgetService";
import budgetCategoryService from "../services/budgetCategoryService";
import "./Budget.css";

// Budget.js
const Budget = () => {
    const userId = localStorage.getItem("userId");

    const [budget, setBudget] = useState(null);
    const [totalBudget, setTotalBudget] = useState("");
    const [categories, setCategories] = useState([]);
    const [newCategoryName, setNewCategoryName] = useState("");
    const [categoryLimit, setCategoryLimit] = useState(""); // New state for category limit
    const [error, setError] = useState("");

    useEffect(() => {
        fetchBudget();
    }, []);

    // Fetch Budget
    const fetchBudget = async () => {
        try {
            const data = await budgetService.getBudget(userId);
            if (data && data.totalBudget) {
                setBudget(data);
                setTotalBudget(data.totalBudget);
                console.log("BUDGET ID: ", data._id);
                fetchCategories(data._id);  // Fetch categories using budgetId
            }
        } catch (error) {
            setError("Failed to fetch budget.");
        }
    };

    // Fetch Categories with budgetId
    const fetchCategories = async (budgetId) => {
        try {
            console.log("DEBUG: budgetID ", budgetId);
            const data = await budgetCategoryService.getCategories(budgetId);
            setCategories(data);
        } catch (error) {
            setError("Failed to fetch categories.");
        }
    };

    // Create or Update Budget
    const handleBudgetSubmit = async (e) => {
        e.preventDefault();
        try {
            const updatedBudget = await budgetService.createOrUpdateBudget(userId, { totalBudget });
            setBudget(updatedBudget);
        } catch (error) {
            setError("Failed to save budget.");
        }
    };

    // Add Category
    const handleAddCategory = async (e) => {
        e.preventDefault();
        if (categoryLimit <= totalBudget) {
            try {
                const categoryData = { name: newCategoryName, limit: categoryLimit };
                const category = await budgetCategoryService.createCategory(budget._id, categoryData); // Use budget._id for budgetId
                setCategories([...categories, category]);
                setNewCategoryName(""); // Reset input field
                setCategoryLimit(""); // Reset limit input
                updateTotalBudget(); // Update total budget
            } catch (error) {
                setError("Failed to add category.");
            }
        } else {
            setError("Category limit cannot exceed total budget.");
        }
    };


    const handleUpdateCategory = (categoryId) => {
        // Placeholder logic for now, you can replace it with your modal or update functionality
        console.log(`Update category with ID: ${categoryId}`);
        // For example, you can use a modal to edit the category name or limit
        // This would be where you implement the update flow
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

    // Update Total Budget based on categories
    const updateTotalBudget = () => {
        let total = 0;
        categories.forEach((category) => {
            total += category.limit || 0; // Assuming each category has a 'limit' field
        });
        setTotalBudget(total);
    };

    return (
        <div className="budget-page">
            <h1 className="page-title">Budget Page</h1>
            <h2>Budget Management</h2>
            {error && <p style={{ color: "red" }}>{error}</p>}

            {budget ? (
                <div>
                    <p><strong>Current Budget:</strong> ${budget.totalBudget}</p>
                    <button onClick={handleBudgetSubmit}>Update Budget</button>
                    <div>
                        <h3>Budget Categories</h3>
                        {categories.length === 0 ? (
                            <p>No budget categories, please create a budget category.</p>
                        ) : (
                            <ul>
                                {categories.map((category) => (
                                    <li key={category._id}>
                                        {category.name} - ${category.limit} 
                                        <button onClick={() => handleUpdateCategory(category._id)}>Update</button>
                                        <button onClick={() => handleDeleteCategory(category._id)}>Delete</button>
                                    </li>
                                ))}
                            </ul>
                        )}
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
                    </div>
                </div>
            ) : (
                <div>
                    <h3>No Budget, please create one</h3>
                    <form onSubmit={handleBudgetSubmit}>
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
        </div>
    );
};

export default Budget;
