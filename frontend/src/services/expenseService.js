import { apiFetch } from '../utilities/apiInterceptor';

export const getExpenses = async (filters = {}) => {
  try {
    const { startDate, endDate, category } = filters || {};
    
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    if (category) params.append('category', category);
    
    const queryString = params.toString();
    const endpoint = `/api/expenses${queryString ? `?${queryString}` : ''}`;
    
    const response = await apiFetch(endpoint);
    
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
    const response = await apiFetch('/api/expenses', {
      method: 'POST',
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
    const response = await apiFetch(`/api/expenses/${id}`, {
      method: 'PUT',
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
    const response = await apiFetch(`/api/expenses/${id}`, {
      method: 'DELETE'
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
    if (!filters) filters = {};
    
    const params = new URLSearchParams();
    if (filters.startDate) params.append('startDate', filters.startDate);
    if (filters.endDate) params.append('endDate', filters.endDate);
    
    const queryString = params.toString();
    const endpoint = `/api/expenses/category/summary${queryString ? `?${queryString}` : ''}`;
    
    const response = await apiFetch(endpoint);
    
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