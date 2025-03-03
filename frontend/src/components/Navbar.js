import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import "./Navbar.css";
import home from "../assets/home.png";
import budget from "../assets/budget.png";
import user from "../assets/user.png";
import settings from "../assets/settings.png";

const Navbar = ({ isAuthenticated, handleLogout }) => {
    const [active, setActive] = useState(0);
    const location = useLocation();
    const navigate = useNavigate();

    useEffect(() => {
        switch (location.pathname) {
            case "/":
                setActive(0);
                break;
            case "/budget":
                setActive(1);
                break;
            case "/user":
                setActive(2);
                break;
            case "/settings":
                setActive(3);
                break;
            default:
                setActive(0);
        }
    }, [location]);

    const handleAuthAction = () => {
        if (isAuthenticated) {
            handleLogout();
            navigate("/");
        } else {
            navigate("/user");
        }
    };

    return (
        <>
            <nav className="navbar-top">
                <div className="logo">BudgetWise</div>
            </nav>

            <nav className="navbar">
                <div className="logo-web">BudgetWise</div>

                <Link to="/" className={`nav-item ${active === 0 ? "active" : ""}`}>
                    <img src={home} alt="Home" />
                    <span>Home</span>
                </Link>

                <Link to="/budget" className={`nav-item ${active === 1 ? "active" : ""}`}>
                    <img src={budget} alt="Budget" />
                    <span>Budget</span>
                </Link>

                <Link to="/user" className={`nav-item ${active === 2 ? "active" : ""}`}>
                    <img src={user} alt="User" />
                    <span>User</span>
                </Link>

                <Link to="/settings" className={`nav-item ${active === 3 ? "active" : ""}`}>
                    <img src={settings} alt="Settings" />
                    <span>Settings</span>
                </Link>

                <button className="login-logout-button" onClick={handleAuthAction}>
                    {isAuthenticated ? "Logout" : "Login"}
                </button>
            </nav>
        </>
    );
};

export default Navbar;
