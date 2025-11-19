const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

const incomeService = {
    getIncome: async (userId) => {
        try {
            console.log(`Fetching income for user: ${userId}`);
            const response = await fetch(`${API_URL}/api/income/${userId}`);
            const data = await response.json();
            console.log("Income API Response:", data);
            return data;
        } catch (error) {
            console.error("Error fetching income:", error);
            return [];
        }
    },

    /*createIncome: async (userId, incomeData) => {
        try {
            const response = await fetch(`${API_URL}/api/income/${userId}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(incomeData),
            });
            const data = await response.json();
            console.log("Created Income:", data);
            return data;
        } catch (error) {
            console.error("Error creating income:", error);
            return null;
        }
    },*/

    createIncome: async (userId, incomeData) => {
        try {
            const response = await fetch(`${API_URL}/api/income/${userId}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${localStorage.getItem("token") || ""}`
            },
            body: JSON.stringify(incomeData),
            });

            // Check if the request succeeded
            if (!response.ok) {
            const errData = await response.json().catch(() => ({}));
            throw new Error(errData.message || `Failed to add income (HTTP ${response.status})`);
            }

            const data = await response.json();
            console.log("Created Income:", data);
            return data; 

        } catch (error) {
            console.error("Error creating income:", error);
            throw error;
        }
    },


    getSingleIncome: async (userId, incomeId) => {
        try {
            const response = await fetch(`${API_URL}/api/income/${userId}/${incomeId}`);
            const data = await response.json();
            console.log("Fetched Single Income:", data);
            return data;
        } catch (error) {
            console.error("Error fetching single income:", error);
            return null;
        }
    },

    updateIncome: async (userId, incomeId, updatedData) => {
        try {
            const response = await fetch(`${API_URL}/api/income/${userId}/${incomeId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(updatedData),
            });
            const data = await response.json();
            console.log("Updated Income:", data);
            return data;
        } catch (error) {
            console.error("Error updating income:", error);
            return null;
        }
    },

    deleteIncome: async (userId, incomeId) => {
        try {
            const response = await fetch(`${API_URL}/api/income/${userId}/${incomeId}`, { method: "DELETE" });
            console.log("Deleted Income:", incomeId);
            return response.json();
        } catch (error) {
            console.error("Error deleting income:", error);
            return null;
        }
    },

    getIncomeByDateRange: async (userId, startDate, endDate) => {
        try {
            console.log(`Fetching income for user: ${userId} from ${startDate} to ${endDate}`);
            const response = await fetch(`${API_URL}/api/income/${userId}?startDate=${startDate}&endDate=${endDate}`);
            const data = await response.json();
            console.log("Income by Date Range API Response:", data);
            return data;
        } catch (error) {
            console.error("Error fetching income by date range:", error);
            return [];
        }
    },
};

export default incomeService;
