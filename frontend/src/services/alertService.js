const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

const alertService = {
  getAlerts: async (userId, { status } = {}) => {
    const url = new URL(`${API_URL}/api/alerts/${userId}`);
    if (status) url.searchParams.append("status", status);

    const res = await fetch(url);
    if (!res.ok) {
      throw new Error("Failed to fetch alerts");
    }
    return res.json();
  },

  createAlert: async (userId, alertData) => {
    const res = await fetch(`${API_URL}/api/alerts/${userId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(alertData),
    });
    if (!res.ok) {
      throw new Error("Failed to create alert");
    }
    return res.json();
  },

  updateStatus: async (userId, alertId, status) => {
    const res = await fetch(`${API_URL}/api/alerts/${userId}/${alertId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    if (!res.ok) {
      throw new Error("Failed to update alert");
    }
    return res.json();
  },

  deleteAlert: async (userId, alertId) => {
    const res = await fetch(`${API_URL}/api/alerts/${userId}/${alertId}`, {
      method: "DELETE",
    });
    if (!res.ok) {
      throw new Error("Failed to delete alert");
    }
    return res.json();
  },
};

export default alertService;
