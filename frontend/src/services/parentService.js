const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

// Get authentication token from localStorage
const getAuthHeader = () => {
    const token = localStorage.getItem('token');
    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    };
};

// Get all children for the authenticated parent
export const getChildren = async () => {
    try {
        const response = await fetch(`${API_URL}/api/parent/children`, {
            method: 'GET',
            headers: getAuthHeader(),
            credentials: 'include'
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to fetch children');
        }

        return await response.json();
    } catch (error) {
        console.error('Error fetching children:', error);
        throw error;
    }
};

// Get a specific child by ID
export const getChildById = async (childId) => {
    try {
        const response = await fetch(`${API_URL}/api/parent/children/${childId}`, {
            method: 'GET',
            headers: getAuthHeader(),
            credentials: 'include'
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to fetch child details');
        }

        return await response.json();
    } catch (error) {
        console.error('Error fetching child:', error);
        throw error;
    }
};

// Add a new child account
export const addChild = async (childData) => {
    try {
        const response = await fetch(`${API_URL}/api/parent/children`, {
            method: 'POST',
            headers: getAuthHeader(),
            credentials: 'include',
            body: JSON.stringify(childData)
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || error.errors?.[0]?.msg || 'Failed to add child');
        }

        return await response.json();
    } catch (error) {
        console.error('Error adding child:', error);
        throw error;
    }
};

// Update child account
export const updateChild = async (childId, updateData) => {
    try {
        const response = await fetch(`${API_URL}/api/parent/children/${childId}`, {
            method: 'PUT',
            headers: getAuthHeader(),
            credentials: 'include',
            body: JSON.stringify(updateData)
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || error.errors?.[0]?.msg || 'Failed to update child');
        }

        return await response.json();
    } catch (error) {
        console.error('Error updating child:', error);
        throw error;
    }
};

// Remove a child account
export const removeChild = async (childId) => {
    try {
        const response = await fetch(`${API_URL}/api/parent/children/${childId}`, {
            method: 'DELETE',
            headers: getAuthHeader(),
            credentials: 'include'
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Failed to remove child');
        }

        return await response.json();
    } catch (error) {
        console.error('Error removing child:', error);
        throw error;
    }
};

const parentService = {
    getChildren,
    getChildById,
    addChild,
    updateChild,
    removeChild
};

export default parentService;