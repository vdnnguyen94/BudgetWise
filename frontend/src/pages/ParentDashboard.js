import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import parentService from '../services/parentService';

const ParentDashboard = () => {
    console.log('ParentDashboard component mounted');
    console.log('Token:', localStorage.getItem('token'));
    console.log('UserRole:', localStorage.getItem('userRole'));
    
    const [children, setChildren] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [selectedChild, setSelectedChild] = useState(null);
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        dateOfBirth: '',
        allowance: 0,
        spendingLimit:'',
        monthlyBudget: ''
    });

    // Fetch children on component mount
    useEffect(() => {
        console.log('useEffect running - fetching children');
        fetchChildren();
    }, []);

    const fetchChildren = async () => {
        try {
            console.log('Fetching children...');
            setLoading(true);
            const data = await parentService.getChildren();
            console.log('Children data received:', data);
            setChildren(data.children || []);
        } catch (error) {
            console.error('Error fetching children:', error);
            toast.error(error.message || 'Failed to load children');
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        // Prevent negative numbers: ensures allowance, spending limit, and monthly budget stay 0 or positive
         if (['allowance', 'spendingLimit', 'monthlyBudget'].includes(name)) {
            const num = value === '' ? '' : Math.max(0, Number(value));
            setFormData(prev => ({ ...prev, [name]: num }));
            return;
        }
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleAddChild = async (e) => {
        e.preventDefault();
        try {
            await parentService.addChild(formData);
            toast.success('Child account created successfully!');
            setShowAddModal(false);
            setFormData({
                username: '',
                email: '',
                password: '',
                dateOfBirth: '',
                allowance: 0,
                spendingLimit: '',
                monthlyBudget: ''
            });
            fetchChildren();
        } catch (error) {
            toast.error(error.message || 'Failed to add child');
        }
    };

    const handleEditChild = (child) => {
        setSelectedChild(child);
        setFormData({
            username: child.username,
            dateOfBirth: child.dateOfBirth ? child.dateOfBirth.split('T')[0] : '',
            allowance: child.allowance || 0,
            spendingLimit: child.spendingLimit > 0 ? child.spendingLimit : '',
            monthlyBudget: child.monthlyBudget > 0 ? child.monthlyBudget : ''
        });
        setShowEditModal(true);
    };

    const handleUpdateChild = async (e) => {
        e.preventDefault();
        try {
            const updateData = {
                username: formData.username,
                dateOfBirth: formData.dateOfBirth,
                allowance: parseFloat(formData.allowance) || 0,
                spendingLimit: formData.spendingLimit === '' ? 0 : Number(formData.spendingLimit),
                monthlyBudget: formData.monthlyBudget === '' ? 0 : Number(formData.monthlyBudget)
            };
            await parentService.updateChild(selectedChild._id, updateData);
            toast.success('Child account updated successfully!');
            setShowEditModal(false);
            setSelectedChild(null);
            fetchChildren();
        } catch (error) {
            toast.error(error.message || 'Failed to update child');
        }
    };

    const handleRemoveChild = async (childId) => {
        if (window.confirm('Are you sure you want to remove this child account? This action cannot be undone.')) {
            try {
                await parentService.removeChild(childId);
                toast.success('Child account removed successfully!');
                fetchChildren();
            } catch (error) {
                toast.error(error.message || 'Failed to remove child');
            }
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="text-xl">Loading...</div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">Manage Children Accounts</h1>
                <button
                    onClick={() => setShowAddModal(true)}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg transition"
                >
                    Add Child Account
                </button>
            </div>

            {children.length === 0 ? (
                <div className="text-center py-12">
                    <p className="text-gray-500 text-lg">No child accounts yet.</p>
                    <p className="text-gray-400 mt-2">Click "Add Child Account" to get started.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {children.map((child) => (
                        <div key={child._id} className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
                            <div className="flex justify-between items-start mb-4">
                                <h3 className="text-xl font-semibold">{child.username}</h3>
                                <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">
                                    {child.role}
                                </span>
                            </div>
                            
                            <div className="space-y-2 mb-4">
                                <p className="text-gray-600">
                                    <span className="font-medium">Email:</span> {child.email}
                                </p>
                                {child.dateOfBirth && (
                                    <p className="text-gray-600">
                                        <span className="font-medium">Date of Birth:</span>{' '}
                                        {new Date(child.dateOfBirth).toLocaleDateString()}
                                    </p>
                                )}
                                <p className="text-gray-600">
                                    <span className="font-medium">Allowance:</span> ${child.allowance || 0}
                                </p>
                                <p className="text-gray-600">
                                    <span className="font-medium">Spending Limit:</span>{' '}
                                    {child.spendingLimit > 0 ? `$${child.spendingLimit}` : '—'}
                                </p>
                                <p className="text-gray-600">
                                    <span className="font-medium">Monthly Budget:</span>{' '}
                                    {child.monthlyBudget > 0 ? `$${child.monthlyBudget}` : '—'}
                                </p>
                            </div>

                            <div className="flex gap-2">
                                <button
                                    onClick={() => handleEditChild(child)}
                                    className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-2 rounded transition"
                                >
                                    Edit
                                </button>
                                <button
                                    onClick={() => handleRemoveChild(child._id)}
                                    className="flex-1 bg-red-500 hover:bg-red-600 text-white py-2 rounded transition"
                                >
                                    Remove
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Add Child Modal */}
            {showAddModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
                        <h2 className="text-2xl font-bold mb-6">Add Child Account</h2>
                        <form onSubmit={handleAddChild}>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">Username *</label>
                                    <input
                                        type="text"
                                        name="username"
                                        value={formData.username}
                                        onChange={handleInputChange}
                                        required
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Email *</label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleInputChange}
                                        required
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Password *</label>
                                    <input
                                        type="password"
                                        name="password"
                                        value={formData.password}
                                        onChange={handleInputChange}
                                        required
                                        minLength="6"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Date of Birth</label>
                                    <input
                                        type="date"
                                        name="dateOfBirth"
                                        value={formData.dateOfBirth}
                                        onChange={handleInputChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Allowance ($)</label>
                                    <input
                                        type="number"
                                        name="allowance"
                                        value={formData.allowance}
                                        onChange={handleInputChange}
                                        min="0"
                                        step="0.01"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                            </div>
                            <div className="flex gap-3 mt-6">
                                <button
                                    type="submit"
                                    className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-2 rounded-lg transition"
                                >
                                    Add Child
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowAddModal(false);
                                        setFormData({
                                            username: '',
                                            email: '',
                                            password: '',
                                            dateOfBirth: '',
                                            allowance: 0,
                                            spendingLimit: '',
                                            monthlyBudget: ''
                                        });
                                    }}
                                    className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 py-2 rounded-lg transition"
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Edit Child Modal */}
            {showEditModal && selectedChild && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
                        <h2 className="text-2xl font-bold mb-6">Edit Child Account</h2>
                        <form onSubmit={handleUpdateChild}>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">Username</label>
                                    <input
                                        type="text"
                                        name="username"
                                        value={formData.username}
                                        onChange={handleInputChange}
                                        required
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Date of Birth</label>
                                    <input
                                        type="date"
                                        name="dateOfBirth"
                                        value={formData.dateOfBirth}
                                        onChange={handleInputChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Allowance ($)</label>
                                    <input
                                        type="number"
                                        name="allowance"
                                        value={formData.allowance}
                                        onChange={handleInputChange}
                                        min="0"
                                        step="0.01"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                                {/*  Edit fields for spending limit & monthly budget */}
                                <div className="pt-2">
                                    <label className="block text-sm font-medium mb-1">Spending Limit ($)</label>
                                    <input
                                        type="number"
                                        name="spendingLimit"
                                        value={formData.spendingLimit}
                                        onChange={handleInputChange}
                                        min="0"
                                        step="0.01"
                                        placeholder="Leave empty for no limit"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Monthly Budget ($)</label>
                                    <input
                                        type="number"
                                        name="monthlyBudget"
                                        value={formData.monthlyBudget}
                                        onChange={handleInputChange}
                                        min="0"
                                        step="0.01"
                                        placeholder="Leave empty for no cap"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                            </div>
                            <div className="flex gap-3 mt-6">
                                <button
                                    type="submit"
                                    className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-2 rounded-lg transition"
                                >
                                    Update
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowEditModal(false);
                                        setSelectedChild(null);
                                    }}
                                    className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 py-2 rounded-lg transition"
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ParentDashboard;