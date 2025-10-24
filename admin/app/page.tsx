"use client";

import React from 'react';
import { DashboardCard, StatsCard, RecentActivity, QuickActions } from './components';
import { mockStats, mockQuickActions, mockActivities } from './lib/mock-data';

const AdminDashboardPage = () => {
  return (
    <div className="space-y-8">
      {/* Enhanced Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-8 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-2">Admin Dashboard</h1>
            <p className="text-blue-100 text-lg">Welcome back! Here's what's happening on your platform today.</p>
          </div>
          <div className="text-6xl">
            🚀
          </div>
        </div>
        <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
          {mockStats.map((stat, index) => (
            <div key={`${stat.title}-${index}`} className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm">{stat.title}</p>
                  <p className="text-2xl font-bold">{stat.value}</p>
                </div>
                <div className="text-2xl">
                  {stat.icon}
                </div>
              </div>
              <p className="text-blue-100 text-xs mt-2">{stat.change}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <QuickActions actions={mockQuickActions} />

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Management Cards */}
        <div className="lg:col-span-2 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <DashboardCard
              title="User Management"
              description="View, edit, suspend, delete, and manage all user accounts, KYC, and roles."
              href="/users"
              buttonText="Manage Users"
              icon="👥"
              color="blue"
            />
            <DashboardCard
              title="Goal Management"
              description="Oversee, edit, moderate, and manage timeframes for all goals on the platform."
              href="/goals"
              buttonText="Manage Goals"
              icon="🎯"
              color="green"
            />
            <DashboardCard
              title="Accountability"
              description="Monitor accountability partner connections and manage abusive partnerships."
              href="/accountability"
              buttonText="View Connections"
              icon="🤝"
              color="purple"
            />
            <DashboardCard
              title="Verification & Moderation"
              description="Review verified badge requests, manage reported content and users."
              href="/moderation"
              buttonText="Moderate Content"
              icon="🛡️"
              color="red"
            />
            <DashboardCard
              title="Notifications"
              description="Send system announcements and customize email reminder templates."
              href="/notifications"
              buttonText="Manage Notifications"
              icon="📢"
              color="yellow"
            />
            <DashboardCard
              title="Analytics & Reports"
              description="Access platform statistics, user engagement, and export detailed reports."
              href="/analytics"
              buttonText="View Reports"
              icon="📊"
              color="indigo"
            />
            <DashboardCard
              title="Content Management"
              description="Manage static pages, featured content, testimonials, and KYC form fields."
              href="/content"
              buttonText="Edit Content"
              icon="📝"
              color="pink"
            />
            <DashboardCard
              title="System Configuration"
              description="Adjust dark/light mode defaults, goal time limits, and feature visibility."
              href="/settings"
              buttonText="Configure System"
              icon="⚙️"
              color="gray"
            />
            <DashboardCard
              title="Developer Controls"
              description="Manage API keys, view server logs, toggle maintenance mode, and create test data."
              href="/developer"
              buttonText="Access Controls"
              icon="🔧"
              color="purple"
            />
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <RecentActivity activities={mockActivities} maxItems={8} />

          {/* System Status */}
          <div className="bg-white shadow-md rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">System Status</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Database</span>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  Healthy
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">API Services</span>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  Operational
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Email Service</span>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                  Minor Issues
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">File Storage</span>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  Healthy
                </span>
              </div>
            </div>
          </div>

          {/* Platform Health */}
          <div className="bg-white shadow-md rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Platform Health</h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">Server Load</span>
                  <span className="font-medium">45%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-green-600 h-2 rounded-full" style={{ width: '45%' }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">Storage Used</span>
                  <span className="font-medium">67%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-yellow-600 h-2 rounded-full" style={{ width: '67%' }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">Active Sessions</span>
                  <span className="font-medium">1,234</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-blue-600 h-2 rounded-full" style={{ width: '78%' }}></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardPage;
