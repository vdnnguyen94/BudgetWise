const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

const savingService = {
  getGoals: async (userId) => {
    const res = await fetch(`${API_URL}/api/saving-goals/${userId}`);
    if (!res.ok) throw new Error("Failed to fetch goals");
    return res.json();
  },

  createGoal: async (userId, goal) => {
    const res = await fetch(`${API_URL}/api/saving-goals/${userId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(goal),
    });
    if (!res.ok) throw new Error("Failed to create goal");
    return res.json();
  },

  getGoalSummaries: async (userId) => {
    const res = await fetch(`${API_URL}/api/saving-goals/${userId}/summary`);
    if (!res.ok) throw new Error("Failed to fetch goal summaries");
    return res.json();
  },

  deleteGoal: async (userId, goalId) => {
    const res = await fetch(`${API_URL}/api/saving-goals/${userId}/${goalId}`, {
      method: "DELETE",
    });
    if (!res.ok) throw new Error("Failed to delete goal");
    return res.json();
  },

  getSavings: async (userId) => {
    const res = await fetch(`${API_URL}/api/savings/${userId}`);
    if (!res.ok) throw new Error("Failed to fetch savings");
    return res.json();
  },

  createSaving: async (userId, saving) => {
    const res = await fetch(`${API_URL}/api/savings/${userId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(saving),
    });
    if (!res.ok) throw new Error("Failed to create saving");
    return res.json();
  },

  deleteSaving: async (userId, savingId) => {
    const res = await fetch(`${API_URL}/api/savings/${userId}/${savingId}`, {
      method: "DELETE",
    });
    if (!res.ok) throw new Error("Failed to delete saving");
    return res.json();
  },
};

export default savingService;
