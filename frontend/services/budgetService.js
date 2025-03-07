const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

const budgetService = {
    getBudget: async (userId) => {
        const response = await fetch(`${API_URL}/api/budget/${userId}`);
        return response.json();
    },

    createOrUpdateBudget: async (userId, budgetData) => {
        const response = await fetch(`${API_URL}/api/budget/${userId}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(budgetData),
        });
        return response.json();
    },

    deleteBudget: async (userId) => {
        return fetch(`${API_URL}/api/budget/${userId}`, { method: "DELETE" });
    },
};

export default budgetService;
