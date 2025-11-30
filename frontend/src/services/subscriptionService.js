const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

const subscriptionService = {
  getSubscriptions: async (userId) => {
    const response = await fetch(`${API_URL}/api/subscriptions/${userId}`);
    if (!response.ok) {
      throw new Error("Failed to fetch subscriptions");
    }
    return response.json();
  },

  createSubscription: async (userId, subData) => {
    const response = await fetch(`${API_URL}/api/subscriptions/${userId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(subData),
    });
    if (!response.ok) {
      throw new Error("Failed to create subscription");
    }
    return response.json();
  },

  updateSubscription: async (userId, subId, updatedData) => {
    const response = await fetch(
      `${API_URL}/api/subscriptions/${userId}/${subId}`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedData),
      }
    );
    if (!response.ok) {
      throw new Error("Failed to update subscription");
    }
    return response.json();
  },

  deleteSubscription: async (userId, subId) => {
    const response = await fetch(
      `${API_URL}/api/subscriptions/${userId}/${subId}`,
      { method: "DELETE" }
    );
    if (!response.ok) {
      throw new Error("Failed to delete subscription");
    }
    return response.json();
  },
};

export default subscriptionService;
