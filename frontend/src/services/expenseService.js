// frontend/src/services/expenseService.js
// FIXED: Added null safety checks

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

export const getExpenses = async (filters = {}) => {
  try {
    // Add null/undefined checks
    const { startDate, endDate, category } = filters || {};
    
    const token = localStorage.getItem('token');
    
    // Build query params only if values exist
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    if (category) params.append('category', category);
    
    const queryString = params.toString();
    const url = `${API_URL}/api/expenses${queryString ? `?${queryString}` : ''}`;
    
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch expenses');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error in getExpenses:', error);
    throw error;
  }
};

export const createExpense = async (expenseData) => {
  try {
    const token = localStorage.getItem('token');
    
    const response = await fetch(`${API_URL}/api/expenses`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(expenseData)
    });
    
    if (!response.ok) {
      throw new Error('Failed to create expense');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error in createExpense:', error);
    throw error;
  }
};

export const updateExpense = async (id, expenseData) => {
  try {
    const token = localStorage.getItem('token');
    
    const response = await fetch(`${API_URL}/api/expenses/${id}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(expenseData)
    });
    
    if (!response.ok) {
      throw new Error('Failed to update expense');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error in updateExpense:', error);
    throw error;
  }
};

export const deleteExpense = async (id) => {
  try {
    const token = localStorage.getItem('token');
    
    const response = await fetch(`${API_URL}/api/expenses/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error('Failed to delete expense');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error in deleteExpense:', error);
    throw error;
  }
};

export const getCategoryExpenses = async (filters = {}) => {
  try {
    // Null safety check
    if (!filters) filters = {};
    
    const token = localStorage.getItem('token');
    
    const params = new URLSearchParams();
    if (filters.startDate) params.append('startDate', filters.startDate);
    if (filters.endDate) params.append('endDate', filters.endDate);
    
    const queryString = params.toString();
    const url = `${API_URL}/api/expenses/category/summary${queryString ? `?${queryString}` : ''}`;
    
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch category expenses');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error in getCategoryExpenses:', error);
    throw error;
  }
};

export default {
  getExpenses,
  createExpense,
  updateExpense,
  deleteExpense,
  getCategoryExpenses
};