const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

const savingService = {
  getGoals: async (userId) => {
    const r = await fetch(`${API_URL}/api/saving-goals/${userId}`);
    if (!r.ok) throw new Error("Failed to fetch goals");
    return r.json();
  },
  createGoal: async (userId, goal) => {
    const r = await fetch(`${API_URL}/api/saving-goals/${userId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(goal),
    });
    if (!r.ok) throw new Error("Failed to create goal");
    return r.json();
  },
  getGoalSummaries: async (userId) => {
    const r = await fetch(`${API_URL}/api/saving-goals/${userId}/summary`);
    if (!r.ok) throw new Error("Failed to fetch goal summaries");
    return r.json();
  },

  getSavings: async (userId) => {
    const r = await fetch(`${API_URL}/api/savings/${userId}`);
    if (!r.ok) throw new Error("Failed to fetch savings");
    return r.json();
  },
  createSaving: async (userId, saving) => {
    const r = await fetch(`${API_URL}/api/savings/${userId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(saving), 
    });
    if (!r.ok) throw new Error("Failed to create saving");
    return r.json();
  },
  deleteSaving: async (userId, savingId) => {
    const r = await fetch(`${API_URL}/api/savings/${userId}/${savingId}`, { method: "DELETE" });
    if (!r.ok) throw new Error("Failed to delete saving");
    return r.json();
  },
};

export default savingService;
