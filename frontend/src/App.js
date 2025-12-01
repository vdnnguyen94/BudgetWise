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
import Savings from "./pages/Savings";
import ParentDashboard from './pages/ParentDashboard';
import ProtectedRoute from './components/ProtectedRoutes';
import AIChat from './pages/AIChat';
import './App.css';
import { isTokenExpired } from './utilities/apiInterceptor';
import { toast } from 'react-toastify';

function App() {
    const [isAuthenticated, setIsAuthenticated] = useState(() => {
        // Check both token existence AND validity
        const token = localStorage.getItem('token');
        if (!token) return false;
        
        // Check if token is expired
        if (isTokenExpired()) {
            // Clean up expired token
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            localStorage.removeItem('userId');
            localStorage.removeItem('userRole');
            return false;
        }
        
        return true;
    });

    // Check token validity on mount and periodically
    useEffect(() => {
        const token = localStorage.getItem('token');
        console.log('App mounted - Token exists:', !!token);
        
        if (token) {
            if (isTokenExpired()) {
                console.log('🚨 Token expired on mount - logging out');
                handleLogout();
                toast.error('Your session has expired. Please login again.');
            } else {
                setIsAuthenticated(true);
                console.log('✅ Token valid');
            }
        } else {
            setIsAuthenticated(false);
        }

        // Listen for token expiration events from API calls
        const handleTokenExpiredEvent = () => {
            console.log('🚨 Token expired event received');
            toast.error('Your session has expired. Please login again.');
            handleLogout();
        };

        window.addEventListener('token-expired', handleTokenExpiredEvent);

        // Check token expiration every 5 minutes
        const intervalId = setInterval(() => {
            const token = localStorage.getItem('token');
            if (token && isTokenExpired()) {
                console.log('🚨 Token expired (periodic check) - logging out');
                toast.warning('Your session has expired. Please login again.');
                handleLogout();
            }
        }, 5 * 60 * 1000); // Check every 5 minutes

        return () => {
            window.removeEventListener('token-expired', handleTokenExpiredEvent);
            clearInterval(intervalId);
        };
    }, []);

    const handleLogout = () => {
        setIsAuthenticated(false);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('userId');
        localStorage.removeItem('userRole');
        
        // Force reload to clear any cached data
        window.location.href = '/';
    };

    return (
        <Router>
          <Navbar isAuthenticated={isAuthenticated} handleLogout={handleLogout} />
          <Routes>
            <Route path="/" element={<Home />} />
    
            <Route path="/budget" element={
              <ProtectedRoute isAuthenticated={isAuthenticated}>
                <Budget />
              </ProtectedRoute>
            }/>
    
            <Route path="/expenses" element={
              <ProtectedRoute isAuthenticated={isAuthenticated}>
                <ExpensePage />
              </ProtectedRoute>
            }/>
    
            <Route path="/income" element={
              <ProtectedRoute isAuthenticated={isAuthenticated}>
                <Income />
              </ProtectedRoute>
            }/>
    
            <Route path="/saving" element={
              <ProtectedRoute isAuthenticated={isAuthenticated}>
                <Savings />
              </ProtectedRoute>
            }/>
    
            <Route path="/goals" element={
              <ProtectedRoute isAuthenticated={isAuthenticated}>
                <Goals />
              </ProtectedRoute>
            }/>
    
            <Route path="/report" element={
              <ProtectedRoute isAuthenticated={isAuthenticated}>
                <MonthlyReport />
              </ProtectedRoute>
            }/>
            
            <Route path="/ai-chat" element={
              <ProtectedRoute isAuthenticated={isAuthenticated}>
                <AIChat />
              </ProtectedRoute>
            }/>
    
            <Route path="/loan" element={
              <ProtectedRoute isAuthenticated={isAuthenticated}>
                <Loan />
              </ProtectedRoute>
            }/>
    
            <Route path="/profile" element={
              <ProtectedRoute isAuthenticated={isAuthenticated}>
                <
// @ts-ignore
                UserPage />
              </ProtectedRoute>
            }/>
    
            <Route path="/parent-dashboard" element={
              <ProtectedRoute isAuthenticated={isAuthenticated}>
                <ParentDashboard />
              </ProtectedRoute>
            }/>
    
            <Route path="/user-management" element={
              <ProtectedRoute isAuthenticated={isAuthenticated}>
                <UserManagement />
              </ProtectedRoute>
            }/>
    
            <Route path="/shared" element={
              <ProtectedRoute isAuthenticated={isAuthenticated}>
                <DashboardWrapper />
              </ProtectedRoute>
            }/>
          </Routes>
        </Router>
    );
}

export default App;


