const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

const incomeService = {
    getIncome: async (userId) => {
        const response = await fetch(`${API_URL}/api/income/${userId}`);
        return response.json();
    },

    createIncome: async (userId, incomeData) => {
        const response = await fetch(`${API_URL}/api/income/${userId}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(incomeData),
        });
        return response.json();
    },

    updateIncome: async (userId, incomeId, updatedData) => {
        const response = await fetch(`${API_URL}/api/income/${userId}/${incomeId}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(updatedData),
        });
        return response.json();
    },

    deleteIncome: async (userId, incomeId) => {
        return fetch(`${API_URL}/api/income/${userId}/${incomeId}`, { method: "DELETE" });
    },
};

export default incomeService;