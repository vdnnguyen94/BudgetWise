const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

const userService = {
    login: async (email, password) => {
        const response = await fetch(`${API_URL}/api/auth/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password }),
        });
        return response.json();
    },

    register: async (username, email, password, role = "Student") => {
        const response = await fetch(`${API_URL}/api/auth/register`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, email, password, role }),
        });
        return response.json();
    },

    logout: async () => {
        return fetch(`${API_URL}/api/auth/logout`, { method: "POST" });
    },

    getUserDetails: async (token) => {
        const response = await fetch(`${API_URL}/api/auth/me`, {
            method: "GET",
            headers: { Authorization: `Bearer ${token}` },
        });
        return response.json();
    },
};

export default userService;
