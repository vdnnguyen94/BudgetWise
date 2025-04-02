import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Budget from './pages/Budget';
import UserPage from './pages/UserPage';
import UserManagement from './pages/UserManagement';
import ExpensePage from './pages/Expense';
import Loan from "./pages/Loan";
import Income from "./pages/Income";
import Goals from "./pages/Goals";
import DashboardWrapper from './pages/DashboardWrapper';
import MonthlyReport from './pages/ReportPage';

import './App.css';

function App() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    // Check localStorage for existing login session on mount
    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            setIsAuthenticated(true);
        }
    }, []);

    const handleLogout = () => {
        setIsAuthenticated(false);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
    };

    return (
        <Router>
            <Navbar isAuthenticated={isAuthenticated} handleLogout={handleLogout} />
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/budget" element={<Budget />} />
                <Route path="/expenses" element={<ExpensePage />} />
                <Route path="/income" element={<Income />} />
                <Route path="/user" element={<UserPage setIsAuthenticated={setIsAuthenticated} />} />
                <Route path="/user-management" element={<UserManagement />} />
                <Route path="/loan" element={<Loan />} />
                <Route path="/goals" element={<Goals />} />
                <Route path="/dashboard/:role" element={<DashboardWrapper />} />
                <Route path="/report" element={<MonthlyReport />} />


            </Routes>
        </Router>
    );
}

export default App;
