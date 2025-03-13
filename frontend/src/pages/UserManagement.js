import React, { useEffect, useState } from "react";
import "./UserManagement.css";

const API_URL = process.env.REACT_APP_API_URL;

const UserManagement = () => {
    const [users, setUsers] = useState([]);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const token = localStorage.getItem("token");
            const response = await fetch(`${API_URL}/api/auth/users/`, {
                method: "GET",
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await response.json();

            if (response.ok) {
                setUsers(data);
            } else {
                setError(data.message || "Failed to fetch users.");
            }
        } catch (err) {
            setError("Server error. Try again later.");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (userId) => {
        if (!window.confirm("Are you sure you want to delete this user?")) return;

        try {
            const token = localStorage.getItem("token");
            const response = await fetch(`${API_URL}/api/auth/users/${userId}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` },
            });

            if (response.ok) {
                setUsers(users.filter(user => user._id !== userId));
            } else {
                setError("Failed to delete user.");
            }
        } catch (err) {
            setError("Server error. Try again later.");
        }
    };

    const handleRoleChange = async (userId, newRole) => {
        const confirmChange = window.confirm(`Are you sure you want to change the user's role to ${newRole}?`);
        if (!confirmChange) return;
    
        try {
            const token = localStorage.getItem("token");
            const response = await fetch(`${API_URL}/api/auth/users/${userId}`, {
                method: "PUT",
                headers: { 
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}` 
                },
                body: JSON.stringify({ role: newRole }),
            });
    
            if (response.ok) {
                setUsers(users.map(user => 
                    user._id === userId ? { ...user, role: newRole } : user
                ));
                alert("User role updated successfully!");
            } else {
                setError("Failed to update user role.");
            }
        } catch (err) {
            setError("Server error. Try again later.");
        }
    };

    return (
        <div className="user-management">
            <h2>User Management</h2>
            {error && <p className="error">{error}</p>}
            {loading ? (
                <p>Loading users...</p>
            ) : (
                <table>
                    <thead>
                        <tr>
                            <th>Username</th>
                            <th>Email</th>
                            <th>Role</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map((user) => (
                            <tr key={user._id}>
                                <td>{user.username}</td>
                                <td>{user.email}</td>
                                <td>
                                    <select
                                        value={user.role}
                                        onChange={(e) => handleRoleChange(user._id, e.target.value)}
                                    >
                                        <option value="Student">Student</option>
                                        <option value="Professional">Professional</option>
                                        <option value="Admin">Admin</option>
                                    </select>
                                </td>
                                <td>
                                    <button onClick={() => handleDelete(user._id)} className="delete-btn">
                                        Delete
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
};

export default UserManagement;
