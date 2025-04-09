const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

const savingService = {
  getSavings: async (userId) => {
    const response = await fetch(`${API_URL}/api/savings/${userId}`);
    if (!response.ok) throw new Error("Failed to fetch savings");
    return response.json();
  },
  createSaving: async (userId, saving) => {
    const response = await fetch(`${API_URL}/api/savings/${userId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(saving),
    });
    if (!response.ok) throw new Error("Failed to create saving");
    return response.json();
  },
  deleteSaving: async (userId, savingId) => {
    const response = await fetch(`${API_URL}/api/savings/${userId}/${savingId}`, {
      method: "DELETE",
    });
    if (!response.ok) throw new Error("Failed to delete saving");
    return response.json();
  },
};

export default savingService;
