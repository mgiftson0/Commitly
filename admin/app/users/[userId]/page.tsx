"use client";

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';

interface User {
  id: string;
  username: string;
  email: string;
  displayName: string;
  profilePicture: string; // URL to profile picture
  status: 'active' | 'suspended' | 'pending_kyc';
  role: 'user' | 'moderator' | 'admin' | 'verified';
  kycStatus: 'approved' | 'rejected' | 'pending' | 'not_submitted';
  lastLogin: string; // ISO date string
  goalActivity: number;
  kycSubmissionDate?: string;
  kycDocuments?: string[]; // URLs to documents
  activityLog: { timestamp: string; action: string }[];
}

// Mock data (replace with API calls in a real application)
const mockUsers: User[] = [
  {
    id: 'usr_001',
    username: 'john.doe',
    email: 'john.doe@example.com',
    displayName: 'John Doe',
    profilePicture: 'https://via.placeholder.com/150/0000FF/808080?text=JD',
    status: 'active',
    role: 'user',
    kycStatus: 'approved',
    lastLogin: '2023-10-26T10:00:00Z',
    goalActivity: 15,
    kycSubmissionDate: '2023-10-20T10:00:00Z',
    kycDocuments: ['https://via.placeholder.com/600/0000FF/FFFFFF?text=KYC_Doc1.pdf', 'https://via.placeholder.com/600/0000FF/FFFFFF?text=KYC_Doc2.jpg'],
    activityLog: [
      { timestamp: '2023-10-26T10:00:00Z', action: 'Logged in' },
      { timestamp: '2023-10-25T15:30:00Z', action: 'Created new goal "Learn Next.js"' },
      { timestamp: '2023-10-25T10:00:00Z', action: 'Logged out' },
    ],
  },
  {
    id: 'usr_002',
    username: 'jane.smith',
    email: 'jane.smith@example.com',
    displayName: 'Jane Smith',
    profilePicture: 'https://via.placeholder.com/150/FF0000/FFFFFF?text=JS',
    status: 'suspended',
    role: 'user',
    kycStatus: 'pending',
    lastLogin: '2023-10-25T14:30:00Z',
    goalActivity: 7,
    kycSubmissionDate: '2023-10-24T12:00:00Z',
    kycDocuments: ['https://via.placeholder.com/600/FF0000/FFFFFF?text=KYC_Doc_Jane.pdf'],
    activityLog: [
      { timestamp: '2023-10-25T14:30:00Z', action: 'Logged in' },
      { timestamp: '2023-10-24T12:00:00Z', action: 'Submitted KYC documents' },
      { timestamp: '2023-10-23T09:00:00Z', action: 'Account suspended by Admin' },
    ],
  },
  {
    id: 'usr_003',
    username: 'new_user_pending',
    email: 'new.user@example.com',
    displayName: 'New User',
    profilePicture: 'https://via.placeholder.com/150/00FF00/000000?text=NU',
    status: 'pending_kyc',
    role: 'user',
    kycStatus: 'not_submitted',
    lastLogin: '2023-10-25T18:00:00Z',
    goalActivity: 0,
    activityLog: [
      { timestamp: '2023-10-25T18:00:00Z', action: 'Registered new account' },
    ],
  },
];

const UserDetailPage = () => {
  const router = useRouter();
  const params = useParams();
  const userId = params.userId as string;

  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState<Partial<User>>({});

  useEffect(() => {
    // In a real app, fetch user data from an API based on userId
    const fetchedUser = mockUsers.find((u) => u.id === userId);
    if (fetchedUser) {
      setUser(fetchedUser);
      setFormData(fetchedUser); // Initialize form data with current user data
    } else {
      // Handle user not found, e.g., redirect to 404 or user list
      console.error('User not found');
      // router.push('/admin/users'); // Redirect example
    }
    setLoading(false);
  }, [userId]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    // In a real app, send formData to an API to update the user
    console.log('Saving user data:', formData);
    if (user) {
      setUser((prevUser) => ({ ...prevUser!, ...formData }));
    }
    setEditMode(false);
    alert('User data updated (mock)');
  };

  const handleKycAction = (action: 'approve' | 'reject') => {
    if (!user) return;
    const newKycStatus = action === 'approve' ? 'approved' : 'rejected';
    setFormData((prev) => ({ ...prev, kycStatus: newKycStatus }));
    setUser((prev) => ({ ...prev!, kycStatus: newKycStatus }));
    alert(`KYC status ${action}ed for ${user.displayName} (mock)`);
  };

  const handleAccountStatusChange = (status: 'active' | 'suspended' | 'pending_kyc') => {
    if (!user) return;
    setFormData((prev) => ({ ...prev, status: status }));
    setUser((prev) => ({ ...prev!, status: status }));
    alert(`Account status changed to ${status} for ${user.displayName} (mock)`);
  };

  const handleDeleteAccount = () => {
    if (confirm(`Are you sure you want to delete user ${user?.displayName}? This action cannot be undone.`)) {
      // In a real app, send delete request to API
      console.log(`Deleting user ${user?.id}`);
      alert(`User ${user?.displayName} deleted (mock)`);
      router.push('/admin/users'); // Redirect after deletion
    }
  };

  const handlePasswordReset = () => {
    if (confirm(`Are you sure you want to trigger a password reset for ${user?.displayName}?`)) {
      // In a real app, send password reset request to API
      console.log(`Triggering password reset for user ${user?.id}`);
      alert(`Password reset link triggered for ${user?.displayName} (mock)`);
    }
  };

  const handleRoleChange = (newRole: 'user' | 'moderator' | 'admin' | 'verified') => {
    if (!user) return;
    setFormData((prev) => ({ ...prev, role: newRole }));
    setUser((prev) => ({ ...prev!, role: newRole }));
    alert(`Role changed to ${newRole} for ${user?.displayName} (mock)`);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p className="text-lg text-gray-700">Loading user data...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p className="text-lg text-red-600">User not found.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <header className="bg-white shadow p-4 rounded-lg mb-6 flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">User Details: {user.displayName}</h1>
        <div>
          {editMode ? (
            <>
              <button
                onClick={handleSave}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 mr-2"
              >
                Save Changes
              </button>
              <button
                onClick={() => {
                  setEditMode(false);
                  setFormData(user); // Revert changes if cancelled
                }}
                className="px-4 py-2 bg-gray-400 text-white rounded-md hover:bg-gray-500"
              >
                Cancel
              </button>
            </>
          ) : (
            <button
              onClick={() => setEditMode(true)}
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
            >
              Edit User
            </button>
          )}
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* User Profile and Basic Info */}
        <div className="lg:col-span-2 bg-white shadow-md rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Profile Information</h2>
          <div className="flex items-center space-x-4 mb-6">
            <img
              src={user.profilePicture}
              alt={user.displayName}
              className="w-24 h-24 rounded-full object-cover border-2 border-indigo-300"
            />
            <div>
              <p className="text-lg font-bold text-gray-900">{user.displayName}</p>
              <p className="text-gray-600">@{user.username}</p>
              <p className="text-gray-600">{user.email}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="displayName" className="block text-sm font-medium text-gray-700">Display Name</label>
              <input
                type="text"
                id="displayName"
                name="displayName"
                value={formData.displayName || ''}
                onChange={handleInputChange}
                readOnly={!editMode}
                className={`mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 ${!editMode ? 'bg-gray-50' : ''}`}
              />
            </div>
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700">Username</label>
              <input
                type="text"
                id="username"
                name="username"
                value={formData.username || ''}
                onChange={handleInputChange}
                readOnly={!editMode}
                className={`mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 ${!editMode ? 'bg-gray-50' : ''}`}
              />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email || ''}
                onChange={handleInputChange}
                readOnly={!editMode}
                className={`mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 ${!editMode ? 'bg-gray-50' : ''}`}
              />
            </div>
            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-700">Account Status</label>
              <select
                id="status"
                name="status"
                value={formData.status || 'active'}
                onChange={handleInputChange}
                disabled={!editMode}
                className={`mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 ${!editMode ? 'bg-gray-50' : ''}`}
              >
                <option value="active">Active</option>
                <option value="suspended">Suspended</option>
                <option value="pending_kyc">Pending KYC</option>
              </select>
            </div>
            <div>
              <label htmlFor="role" className="block text-sm font-medium text-gray-700">Role</label>
              <select
                id="role"
                name="role"
                value={formData.role || 'user'}
                onChange={handleInputChange}
                disabled={!editMode}
                className={`mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 ${!editMode ? 'bg-gray-50' : ''}`}
              >
                <option value="user">User</option>
                <option value="verified">Verified User</option>
                <option value="moderator">Moderator</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <div>
              <label htmlFor="lastLogin" className="block text-sm font-medium text-gray-700">Last Login</label>
              <input
                type="text"
                id="lastLogin"
                name="lastLogin"
                value={user.lastLogin ? new Date(user.lastLogin).toLocaleString() : 'N/A'}
                readOnly
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 bg-gray-50"
              />
            </div>
            <div>
              <label htmlFor="goalActivity" className="block text-sm font-medium text-gray-700">Goal Activity</label>
              <input
                type="number"
                id="goalActivity"
                name="goalActivity"
                value={formData.goalActivity || 0}
                onChange={handleInputChange}
                readOnly={!editMode}
                className={`mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 ${!editMode ? 'bg-gray-50' : ''}`}
              />
            </div>
          </div>
        </div>

        {/* KYC Management */}
        <div className="bg-white shadow-md rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">KYC Management</h2>
          <p className={`mb-2 text-sm ${user.kycStatus === 'approved' ? 'text-green-600' : user.kycStatus === 'pending' ? 'text-yellow-600' : 'text-red-600'}`}>
            Status: <span className="font-semibold capitalize">{user.kycStatus.replace('_', ' ')}</span>
          </p>
          {user.kycSubmissionDate && (
            <p className="text-sm text-gray-600 mb-4">
              Submitted: {new Date(user.kycSubmissionDate).toLocaleString()}
            </p>
          )}

          {user.kycDocuments && user.kycDocuments.length > 0 && (
            <div className="mb-4">
              <h3 className="text-md font-medium text-gray-700 mb-2">KYC Documents:</h3>
              <ul className="list-disc list-inside text-sm text-blue-600">
                {user.kycDocuments.map((doc, index) => (
                  <li key={index}>
                    <a href={doc} target="_blank" rel="noopener noreferrer" className="hover:underline">
                      Document {index + 1}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {user.kycStatus === 'pending' && (
            <div className="flex space-x-2 mt-4">
              <button
                onClick={() => handleKycAction('approve')}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
              >
                Approve KYC
              </button>
              <button
                onClick={() => handleKycAction('reject')}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
              >
                Reject KYC
              </button>
            </div>
          )}
        </div>

        {/* Account Actions */}
        <div className="lg:col-span-1 bg-white shadow-md rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Account Actions</h2>
          <div className="space-y-4">
            <button
              onClick={handlePasswordReset}
              className="w-full px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700"
            >
              Reset Password / Send Link
            </button>
            {user.status === 'active' ? (
              <button
                onClick={() => handleAccountStatusChange('suspended')}
                className="w-full px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
              >
                Suspend Account
              </button>
            ) : (
              <button
                onClick={() => handleAccountStatusChange('active')}
                className="w-full px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
              >
                Unsuspend Account
              </button>
            )}
            <button
              onClick={handleDeleteAccount}
              className="w-full px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
            >
              Delete Account
            </button>
          </div>
        </div>

        {/* User Activity Log */}
        <div className="lg:col-span-full bg-white shadow-md rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">User Activity Log</h2>
          {user.activityLog && user.activityLog.length > 0 ? (
            <ul className="divide-y divide-gray-200">
              {user.activityLog.map((log, index) => (
                <li key={index} className="py-2 text-sm text-gray-700">
                  <span className="font-medium text-gray-900">{new Date(log.timestamp).toLocaleString()}:</span> {log.action}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-600">No activity logged for this user.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserDetailPage;
