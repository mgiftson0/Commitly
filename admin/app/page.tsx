import React from 'react';
import Link from 'next/link';

const AdminDashboardPage = () => {
  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <header className="bg-white shadow p-4 rounded-lg mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-600 mt-2">Overview of the Commitly platform administration.</p>
      </header>
      <main className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* User Management Card */}
        <div className="bg-white shadow-md rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">User Management</h2>
          <p className="text-gray-600">View, edit, suspend, delete, and manage all user accounts, KYC, and roles.</p>
          <Link href="/admin/users" className="mt-4 inline-block px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
            Go to Users
          </Link>
        </div>

        {/* Goal Management Card */}
        <div className="bg-white shadow-md rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Goal Management</h2>
          <p className="text-gray-600">Oversee, edit, moderate, and manage timeframes for all goals on the platform.</p>
          <Link href="/admin/goals" className="mt-4 inline-block px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
            Go to Goals
          </Link>
        </div>

        {/* Accountability & Relationship Management Card */}
        <div className="bg-white shadow-md rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Accountability & Relationships</h2>
          <p className="text-gray-600">Monitor accountability partner connections and manage abusive partnerships.</p>
          <Link href="/admin/accountability" className="mt-4 inline-block px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
            Manage Connections
          </Link>
        </div>

        {/* Verification & Moderation Card */}
        <div className="bg-white shadow-md rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Verification & Moderation</h2>
          <p className="text-gray-600">Review verified badge requests, manage reported content and users.</p>
          <Link href="/admin/moderation" className="mt-4 inline-block px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
            Moderate Content
          </Link>
        </div>

        {/* Notification & Communication Control Card */}
        <div className="bg-white shadow-md rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Notifications & Communication</h2>
          <p className="text-gray-600">Send system announcements and customize email reminder templates.</p>
          <Link href="/admin/notifications" className="mt-4 inline-block px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
            Manage Notifications
          </Link>
        </div>

        {/* Analytics & Reports Card */}
        <div className="bg-white shadow-md rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Analytics & Reports</h2>
          <p className="text-gray-600">Access platform statistics, user engagement, and export detailed reports.</p>
          <Link href="/admin/analytics" className="mt-4 inline-block px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
            View Reports
          </Link>
        </div>

        {/* Content Management Card */}
        <div className="bg-white shadow-md rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Content Management</h2>
          <p className="text-gray-600">Manage static pages, featured content, testimonials, and KYC form fields.</p>
          <Link href="/admin/content" className="mt-4 inline-block px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
            Edit Content
          </Link>
        </div>

        {/* System Configuration Card */}
        <div className="bg-white shadow-md rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">System Configuration</h2>
          <p className="text-gray-600">Adjust dark/light mode defaults, goal time limits, and feature visibility.</p>
          <Link href="/admin/settings" className="mt-4 inline-block px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
            Configure System
          </Link>
        </div>

        {/* Developer & Technical Controls Card */}
        <div className="bg-white shadow-md rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Developer Controls</h2>
          <p className="text-gray-600">Manage API keys, view server logs, toggle maintenance mode, and create test data.</p>
          <Link href="/admin/developer" className="mt-4 inline-block px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
            Access Controls
          </Link>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboardPage;
