const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

const expenseService = {
    getExpenses: async (userId) => {
        const response = await fetch(`${API_URL}/api/expenses/${userId}`);
        return response.json();
    },

    createExpense: async (userId, expenseData) => {
        const response = await fetch(`${API_URL}/api/expenses/${userId}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(expenseData),
        });
        return response.json();
    },
    updateExpense: async (userId, expenseId, updatedData) => {
        const response = await fetch(`${API_URL}/api/expenses/${userId}/${expenseId}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(updatedData),
        });
        return response.json();
    },
    deleteExpense: async (userId, expenseId) => {
        return fetch(`${API_URL}/api/expenses/${userId}/${expenseId}`, { method: "DELETE" });
    },
};

export default expenseService;
