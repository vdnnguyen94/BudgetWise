const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

const expenseService = {
    getExpenses: async (userId, { startDate, endDate }) => {
        // Construct the URL with query parameters for date range
        const url = new URL(`${API_URL}/api/expenses/${userId}`);
        
        // Append date range parameters if they exist
        if (startDate) url.searchParams.append("startDate", startDate);
        if (endDate) url.searchParams.append("endDate", endDate);

        const response = await fetch(url);
        if (!response.ok) {
            throw new Error("Failed to fetch expenses");
        }
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
