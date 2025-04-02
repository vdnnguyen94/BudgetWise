import React, { useEffect, useState } from "react";
import './UserPage.css';
import { Link, useNavigate } from "react-router-dom";

const API_URL = process.env.REACT_APP_API_URL;

const UserPage = ({ setIsAuthenticated }) => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [username, setUsername] = useState("");
    const [role, setRole] = useState("Student");
    const [user, setUser] = useState(null);
    const [error, setError] = useState("");
    const [isRegistering, setIsRegistering] = useState(false);

    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (token) {
            fetchUserInfo(token);
        }
    }, []);

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch(`${API_URL}/api/auth/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();

            if (response.ok) {
                localStorage.setItem("token", data.token);
                localStorage.setItem("userId", data.user._id);
                localStorage.setItem("userRole", data.user.role);

                setIsAuthenticated(true);
                navigate("/"); // Go to Home where dashboard will load
            } else {
                setError(data.message || "Invalid credentials!");
            }
        } catch (err) {
            setError("Server error. Try again later.");
        }
    };

    const handleDemoLogin = async () => {
        try {
            const response = await fetch(`${API_URL}/api/auth/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: "van@gmail.com", password: "qwe123" }),
            });

            const data = await response.json();

            if (response.ok) {
                localStorage.setItem("token", data.token);
                localStorage.setItem("userId", data.user._id);
                localStorage.setItem("userRole", data.user.role);

                setIsAuthenticated(true);
                navigate("/"); // now it'll navigate to home 
            } else {
                setError(data.message || "Demo login failed!");
            }
        } catch (err) {
            setError("Server error. Try again later.");
        }
    };

    const handleRegister = async (e) => {
        e.preventDefault();

        try {
            const response = await fetch(`${API_URL}/api/auth/register`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    username,
                    email,
                    password,
                    role
                }),
            });

            const data = await response.json();

            if (response.ok) {
                setIsRegistering(false);
                setError("");
                alert("Registration successful! Please log in.");
            } else {
                if (data.errors && data.errors.length > 0) {
                    setError(data.errors[0].msg);
                } else if (data.message) {
                    setError(data.message);
                } else {
                    setError("Registration failed! Please try again.");
                }
            }
        } catch (err) {
            console.error("REGISTER ERROR:", err);
            setError("Server error. Please try again later.");
        }
    };

    const fetchUserInfo = async (token) => {
        try {
            const response = await fetch(`${API_URL}/api/auth/me`, {
                method: "GET",
                headers: { Authorization: `Bearer ${token}` },
            });

            const data = await response.json();
            if (response.ok) {
                setUser(data);
            } else {
                setError("Failed to fetch user data.");
            }
        } catch (err) {
            setError("Error fetching user details.");
        }
    };

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("userId");
        localStorage.removeItem("userRole");
        setUser(null);
        setEmail("");
        setPassword("");
        setIsAuthenticated(false);
        navigate("/");
    };

    return (
        <div className="user-page">
            {user ? (
                <div className="user-info">
                    <h2>Welcome, {user.username}!</h2>
                    <p><strong>Email:</strong> {user.email}</p>
                    <p><strong>Role:</strong> {user.role}</p>
                    <p><strong>Joined On:</strong> {new Date(user.createdAt).toLocaleDateString()}</p>

                    {user.role === "Admin" && (
                        <Link to="/user-management">
                            <button style={{ marginBottom: "10px", backgroundColor: "#007bff", color: "white" }}>
                                User Management
                            </button>
                        </Link>
                    )}
                    <button onClick={handleLogout}>Logout</button>
                </div>
            ) : (
                <div className="form-container">
                    <h2>{isRegistering ? "Register" : "Login"}</h2>
                    {error && <p className="error">{error}</p>}
                    <form onSubmit={isRegistering ? handleRegister : handleLogin}>
                        {isRegistering && (
                            <>
                                <select value={role} onChange={(e) => setRole(e.target.value)}>
                                    <option value="Student">Student</option>
                                    <option value="Parent">Parent</option>
                                    <option value="Professional">Professional</option>
                                    <option value="Admin">Admin</option>
                                </select>
                                <input
                                    type="text"
                                    placeholder="Username"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    required
                                />
                            </>
                        )}
                        <input
                            type="email"
                            placeholder="Email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                        <input
                            type="password"
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                        <button type="submit">{isRegistering ? "Register" : "Login"}</button>
                    </form>
                    <button onClick={() => setIsRegistering(!isRegistering)}>
                        {isRegistering ? "Already have an account? Login" : "Don't have an account? Register"}
                    </button>
                    <button
                        onClick={handleDemoLogin}
                        style={{ marginTop: "10px", backgroundColor: "#28a745", color: "white" }}
                    >
                        Demo Sign-In
                    </button>
                </div>
            )}
        </div>
    );
};

export default UserPage;
