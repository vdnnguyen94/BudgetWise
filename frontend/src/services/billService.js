const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

const billService = {
    getBills: async (userId) => {
        const response = await fetch(`${API_URL}/api/bills/${userId}`);
        return response.json();
    },

    createBill: async (userId, billData) => {
        const response = await fetch(`${API_URL}/api/bills/${userId}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(billData),
        });
        return response.json();
    },
    updateBill: async (userId, billId, updatedData) => {
        const response = await fetch(`${API_URL}/api/bills/${userId}/${billId}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(updatedData),
        });
        return response.json();
    },
    deleteBill: async (userId, billId) => {
        return fetch(`${API_URL}/api/bills/${userId}/${billId}`, { method: "DELETE" });
    },
};

export default billService;
