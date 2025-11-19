import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import "./Navbar.css";
// @ts-ignore
import home from "../assets/home.png";
// @ts-ignore
import budget from "../assets/budget.png";
// @ts-ignore
import user from "../assets/user.png";
// @ts-ignore
import expense from "../assets/expense.png";
// @ts-ignore
import reports from "../assets/report.png";
// @ts-ignore
import income from "../assets/income.png";
// @ts-ignore
import goal from "../assets/goal.png";


const Navbar = ({ isAuthenticated, handleLogout }) => {
    const [active, setActive] = useState(0);
    const [userRole, setUserRole] = useState(null);
    const location = useLocation();
    const navigate = useNavigate();

    // Get user role from localStorage
    useEffect(() => {
        const role = localStorage.getItem('userRole');
        setUserRole(role);
    }, [isAuthenticated]); // Re-check when authentication changes

    useEffect(() => {
        switch (location.pathname) {
            case "/":
                setActive(0);
                break;
            case "/budget":
                setActive(1);
                break;
            case "/expenses":
                setActive(2);
                break;
                case "/income":
                    setActive(3);
                    break;    
            case "/savings":
                setActive (4);
                break;
            case "/categories":
                setActive(5);
                break;
            case "/user":
                setActive(6);
                break;
            case "/settings":
                setActive(7);
                break;
            case "/parent-dashboard":
                setActive(8);
                break;
            case "/ai-chat":
                setActive(9);
                break;    
            default:
                setActive(10);
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

                <Link to="/expenses" className={`nav-item ${active === 2 ? "active" : ""}`}>
                    <img src={expense} alt="Expense" />
                    <span>Expenses</span>
                </Link>

                <Link to="/income" className={`nav-item ${active === 3 ? "active" : ""}`}>
                    <img src={income} alt="Income" />
                    <span>Income</span>
                </Link>

                <Link to="/saving" className={`nav-item ${active === 4 ? "active" : ""}`}>
                    <img src={income} alt="Savings" />
                    <span>Savings</span>
                </Link>

                <Link to="/report" className={`nav-item ${active === 5 ? "active" : ""}`}>
                    <img src={reports} alt="Reports" />
                    <span>Reports</span>
                </Link>

                <Link to="/user" className={`nav-item ${active === 6 ? "active" : ""}`}>
                    <img src={user} alt="User" />
                    <span>User</span>
                </Link>

                <Link to="/goals" className={`nav-item ${active === 7 ? "active" : ""}`}>
                    <img src={goal} alt="Goals" />
                    <span>Goals</span>
                </Link>

                <Link to="/ai-chat" className={`nav-item ${active === 9 ? "active" : ""}`}>
                    <span style={{fontSize: '28px'}}>🤖</span>
                    <span>AI Assistant</span>
                </Link>

                {/* Show Manage Children link only for Parent role users */}
                {isAuthenticated && userRole === 'Parent' && (
                    <Link to="/parent-dashboard" className={`nav-item ${active === 8 ? "active" : ""}`}>
                        <img src={user} alt="Children" />
                        <span>My Children</span>
                    </Link>
                )}


                <button className="login-logout-button" onClick={handleAuthAction}>
                    {isAuthenticated ? "Logout" : "Login"}
                </button>
            </nav>
        </>
    );
};

export default Navbar;