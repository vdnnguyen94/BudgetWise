const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

const budgetCategoryService = {
    // Fetch categories for a specific budget (using budgetId)
    getCategories: async (budgetId) => {
        const response = await fetch(`${API_URL}/api/budget/${budgetId}/category`);
        return response.json();  // Returns categories data
    },

    // Create a new category for a given budget (using budgetId)
    createCategory: async (budgetId, categoryData) => {
        const response = await fetch(`${API_URL}/api/budget/${budgetId}/category`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(categoryData), // categoryData includes name and limit
        });
        return response.json();  // Returns the newly created category
    },

    // Delete a specific category for a given budget (using budgetId and categoryId)
    deleteCategory: async (budgetId, categoryId) => {
        const response = await fetch(`${API_URL}/api/budget/${budgetId}/category/${categoryId}`, {
            method: "DELETE",
        });
        return response.json();  // Returns success or error message
    },

    // Update a category (you can expand this function as needed)
    updateCategory: async (budgetId, categoryId, updatedData) => {
        const response = await fetch(`${API_URL}/api/budget/${budgetId}/category/${categoryId}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(updatedData), // data to update (e.g., name, limit)
        });
        return response.json();  // Returns updated category data
    }
};

export default budgetCategoryService;
