const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

const reportService = {
  getReport: async (userId, month) => {
    const response = await fetch(`${API_URL}/api/reports/${userId}/report/${month}`);
    if (!response.ok) throw new Error("Failed to fetch report");
    return response.json();
  },
};

export default reportService;
