"use client";

import React, { useState } from 'react';
import Link from 'next/link';

interface User {
  id: string;
  username: string;
  email: string;
  displayName: string;
  status: 'active' | 'suspended' | 'pending_kyc';
  role: 'user' | 'moderator' | 'admin' | 'verified';
  kycStatus: 'approved' | 'rejected' | 'pending' | 'not_submitted';
  lastLogin: string; // ISO date string
  goalActivity: number;
}

const mockUsers: User[] = [
  {
    id: 'usr_001',
    username: 'john.doe',
    email: 'john.doe@example.com',
    displayName: 'John Doe',
    status: 'active',
    role: 'user',
    kycStatus: 'approved',
    lastLogin: '2023-10-26T10:00:00Z',
    goalActivity: 15,
  },
  {
    id: 'usr_002',
    username: 'jane.smith',
    email: 'jane.smith@example.com',
    displayName: 'Jane Smith',
    status: 'suspended',
    role: 'user',
    kycStatus: 'pending',
    lastLogin: '2023-10-25T14:30:00Z',
    goalActivity: 7,
  },
  {
    id: 'usr_003',
    username: 'admin_user',
    email: 'admin@example.com',
    displayName: 'Super Admin',
    status: 'active',
    role: 'admin',
    kycStatus: 'approved',
    lastLogin: '2023-10-26T11:00:00Z',
    goalActivity: 2,
  },
  {
    id: 'usr_004',
    username: 'moderator_alice',
    email: 'alice@example.com',
    displayName: 'Alice M.',
    status: 'active',
    role: 'moderator',
    kycStatus: 'approved',
    lastLogin: '2023-10-26T09:15:00Z',
    goalActivity: 10,
  },
  {
    id: 'usr_005',
    username: 'bob_goalie',
    email: 'bob@example.com',
    displayName: 'Bob The Goalie',
    status: 'active',
    role: 'verified',
    kycStatus: 'approved',
    lastLogin: '2023-10-26T08:45:00Z',
    goalActivity: 22,
  },
  {
    id: 'usr_006',
    username: 'new_user_pending',
    email: 'new.user@example.com',
    displayName: 'New User',
    status: 'pending_kyc',
    role: 'user',
    kycStatus: 'pending',
    lastLogin: '2023-10-25T18:00:00Z',
    goalActivity: 0,
  },
];

const UserManagementPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all'); // active, suspended, pending_kyc
  const [filterRole, setFilterRole] = useState('all'); // user, moderator, admin, verified
  const [filterKyc, setFilterKyc] = useState('all'); // approved, rejected, pending, not_submitted

  const filteredUsers = mockUsers.filter(user => {
    const matchesSearch = user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          user.displayName.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = filterStatus === 'all' || user.status === filterStatus;
    const matchesRole = filterRole === 'all' || user.role === filterRole;
    const matchesKyc = filterKyc === 'all' || user.kycStatus === filterKyc;

    return matchesSearch && matchesStatus && matchesRole && matchesKyc;
  });

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <header className="bg-white shadow p-4 rounded-lg mb-6">
        <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
        <p className="text-gray-600 mt-2">View, search, filter, and manage all registered users.</p>
      </header>

      <div className="bg-white shadow-md rounded-lg p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          <div>
            <label htmlFor="search" className="block text-sm font-medium text-gray-700">Search Users</label>
            <input
              type="text"
              id="search"
              placeholder="Search by username, email, display name..."
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div>
            <label htmlFor="statusFilter" className="block text-sm font-medium text-gray-700">Filter by Status</label>
            <select
              id="statusFilter"
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="all">All Statuses</option>
              <option value="active">Active</option>
              <option value="suspended">Suspended</option>
              <option value="pending_kyc">Pending KYC</option>
            </select>
          </div>

          <div>
            <label htmlFor="roleFilter" className="block text-sm font-medium text-gray-700">Filter by Role</label>
            <select
              id="roleFilter"
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
            >
              <option value="all">All Roles</option>
              <option value="user">User</option>
              <option value="moderator">Moderator</option>
              <option value="admin">Admin</option>
              <option value="verified">Verified</option>
            </select>
          </div>

          <div>
            <label htmlFor="kycFilter" className="block text-sm font-medium text-gray-700">Filter by KYC Status</label>
            <select
              id="kycFilter"
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
              value={filterKyc}
              onChange={(e) => setFilterKyc(e.target.value)}
            >
              <option value="all">All KYC Statuses</option>
              <option value="approved">Approved</option>
              <option value="pending">Pending</option>
              <option value="rejected">Rejected</option>
              <option value="not_submitted">Not Submitted</option>
            </select>
          </div>
        </div>
      </div>

      <div className="bg-white shadow-md rounded-lg p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">User List</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Username</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Display Name</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">KYC Status</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Login</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Goal Activity</th>
                <th scope="col" className="relative px-6 py-3"><span className="sr-only">Actions</span></th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-500">
                    No users found matching your criteria.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{user.username}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{user.displayName}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{user.email}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        user.status === 'active' ? 'bg-green-100 text-green-800' :
                        user.status === 'suspended' ? 'bg-red-100 text-red-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {user.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 capitalize">{user.role}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        user.kycStatus === 'approved' ? 'bg-green-100 text-green-800' :
                        user.kycStatus === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        user.kycStatus === 'rejected' ? 'bg-red-100 text-red-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {user.kycStatus.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {new Date(user.lastLogin).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{user.goalActivity}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Link href={`/admin/users/${user.id}`} className="text-indigo-600 hover:text-indigo-900 mr-4">
                        Edit
                      </Link>
                      <button className="text-red-600 hover:text-red-900">
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default UserManagementPage;
