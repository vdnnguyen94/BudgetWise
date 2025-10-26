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



import './App.css';

function App() {
    const [isAuthenticated, setIsAuthenticated] = useState(() => {
        // Initialize state from localStorage immediately
        return !!localStorage.getItem('token');
    });

    // Check localStorage for existing login session on mount
    useEffect(() => {
        const token = localStorage.getItem('token');
        console.log('App mounted - Token exists:', !!token);
        console.log('isAuthenticated:', isAuthenticated);
        if (token) {
            setIsAuthenticated(true);
        } else {
            setIsAuthenticated(false);
        }
    }, []);

   // const handleLogout = () => {
     //   setIsAuthenticated(false);
       // localStorage.removeItem('token');
        //localStorage.removeItem('user');
    //};
    const handleLogout = () => {
        setIsAuthenticated(false);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('userId');
        localStorage.removeItem('userRole');
        window.location.reload(); // <-- important!
    };

    return (
        <Router>
          <Navbar isAuthenticated={isAuthenticated} handleLogout={handleLogout} />
          {/* Replaced <Routes> block with the one below for removing data after logout*/}
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
    
            <Route path="/parent-dashboard" element={<ParentDashboard />} />
    
            <Route path="/user" element={<UserPage setIsAuthenticated={setIsAuthenticated} />} />
            <Route path="/user-management" element={<UserManagement />} />
            <Route path="/loan" element={<Loan />} />
            <Route path="/dashboard/:role" element={<DashboardWrapper />} />
          </Routes>
        </Router>
      );
    }

export default App;