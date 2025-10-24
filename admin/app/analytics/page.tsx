"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Line, Bar, Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
);

// Mock data for analytics
interface PlatformOverview {
  totalUsers: number;
  activeUsers: number;
  newSignupsToday: number;
  totalGoals: number;
  completedGoals: number;
  suspendedGoals: number;
}

interface EngagementMetric {
  name: string;
  value: number | string;
}

interface TopUser {
  id: string;
  username: string;
  goalsCompleted: number;
  activityScore: number;
}

interface PopularCategory {
  name: string;
  goalCount: number;
}

interface UserStreak {
  userId: string;
  username: string;
  currentStreak: number; // days
  longestStreak: number;
  consistencyRate: number; // percentage
}

const mockOverview: PlatformOverview = {
  totalUsers: 1250,
  activeUsers: 890,
  newSignupsToday: 45,
  totalGoals: 2100,
  completedGoals: 1550,
  suspendedGoals: 85,
};

const mockEngagementTrends: EngagementMetric[] = [
  { name: "Weekly Logins", value: "📈 +12% vs last week" },
  { name: "New Goals/Day", value: "📊 50 average" },
  { name: "Comments/Day", value: "💬 250 average" },
];

const mockTopUsers: TopUser[] = [
  {
    id: "usr_005",
    username: "bob_goalie",
    goalsCompleted: 50,
    activityScore: 980,
  },
  {
    id: "usr_001",
    username: "john.doe",
    goalsCompleted: 30,
    activityScore: 720,
  },
  {
    id: "usr_004",
    username: "moderator_alice",
    goalsCompleted: 25,
    activityScore: 650,
  },
];

const mockPopularCategories: PopularCategory[] = [
  { name: "Fitness", goalCount: 450 },
  { name: "Learning", goalCount: 380 },
  { name: "Personal Growth", goalCount: 300 },
];

const mockUserStreaks: UserStreak[] = [
  {
    userId: "usr_005",
    username: "bob_goalie",
    currentStreak: 35,
    longestStreak: 60,
    consistencyRate: 95,
  },
  {
    userId: "usr_001",
    username: "john.doe",
    currentStreak: 10,
    longestStreak: 20,
    consistencyRate: 80,
  },
  {
    userId: "usr_004",
    username: "moderator_alice",
    currentStreak: 5,
    longestStreak: 15,
    consistencyRate: 70,
  },
];

// Chart Data & Options
const userGrowthData = {
  labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul"],
  datasets: [
    {
      label: "New Users",
      data: [30, 45, 28, 80, 99, 43, 89],
      borderColor: "rgb(75, 192, 192)",
      tension: 0.1,
      fill: false,
    },
    {
      label: "Total Users",
      data: [1000, 1030, 1075, 1103, 1183, 1282, 1325],
      borderColor: "rgb(153, 102, 255)",
      tension: 0.1,
      fill: false,
    },
  ],
};

const userGrowthOptions = {
  responsive: true,
  plugins: {
    legend: {
      position: "top" as const,
    },
    title: {
      display: true,
      text: "User Growth Over Time",
    },
  },
};

const goalStatusData = {
  labels: ["Completed", "Active", "Suspended", "Archived", "Uncompleted"],
  datasets: [
    {
      label: "Goal Status",
      data: [
        mockOverview.completedGoals,
        mockOverview.totalGoals -
          mockOverview.completedGoals -
          mockOverview.suspendedGoals, // Active goals calculation
        mockOverview.suspendedGoals,
        50, // Mock archived goals
        20, // Mock uncompleted goals
      ],
      backgroundColor: [
        "rgba(75, 192, 192, 0.6)", // Completed
        "rgba(54, 162, 235, 0.6)", // Active
        "rgba(255, 99, 132, 0.6)", // Suspended
        "rgba(153, 102, 255, 0.6)", // Archived
        "rgba(255, 206, 86, 0.6)", // Uncompleted
      ],
      borderColor: [
        "rgba(75, 192, 192, 1)",
        "rgba(54, 162, 235, 1)",
        "rgba(255, 99, 132, 1)",
        "rgba(153, 102, 255, 1)",
        "rgba(255, 206, 86, 1)",
      ],
      borderWidth: 1,
    },
  ],
};

const goalStatusOptions = {
  responsive: true,
  plugins: {
    legend: {
      position: "top" as const,
    },
    title: {
      display: true,
      text: "Goal Status Distribution",
    },
  },
};

const AnalyticsReportsPage = () => {
  const [reportType, setReportType] = useState("user");
  const [reportFormat, setReportFormat] = useState("csv");

  const handleExportReport = () => {
    alert(`Exporting ${reportType} report as ${reportFormat} (mock)`);
    console.log(`Exporting ${reportType} report as ${reportFormat}`);
    // In a real app, trigger an API endpoint for report generation and download
  };

  return (
    <div>
      <header className="bg-white shadow p-4 rounded-lg mb-6">
        <h1 className="text-3xl font-bold text-gray-900">
          Analytics & Reports
        </h1>
        <p className="text-gray-600 mt-2">
          Access platform-wide analytics, track engagement, and generate
          reports.
        </p>
      </header>

      {/* Platform Overview */}
      <div className="bg-white shadow-md rounded-lg p-6 mb-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">
          Platform Overview
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          <div className="bg-blue-50 p-4 rounded-md text-center">
            <p className="text-3xl font-bold text-blue-800">
              {mockOverview.totalUsers}
            </p>
            <p className="text-sm text-blue-600">Total Users</p>
          </div>
          <div className="bg-green-50 p-4 rounded-md text-center">
            <p className="text-3xl font-bold text-green-800">
              {mockOverview.activeUsers}
            </p>
            <p className="text-sm text-green-600">Active Users</p>
          </div>
          <div className="bg-yellow-50 p-4 rounded-md text-center">
            <p className="text-3xl font-bold text-yellow-800">
              {mockOverview.newSignupsToday}
            </p>
            <p className="text-sm text-yellow-600">New Signups (Today)</p>
          </div>
          <div className="bg-purple-50 p-4 rounded-md text-center">
            <p className="text-3xl font-bold text-purple-800">
              {mockOverview.totalGoals}
            </p>
            <p className="text-sm text-purple-600">Total Goals</p>
          </div>
          <div className="bg-teal-50 p-4 rounded-md text-center">
            <p className="text-3xl font-bold text-teal-800">
              {mockOverview.completedGoals}
            </p>
            <p className="text-sm text-teal-600">Completed Goals</p>
          </div>
          <div className="bg-red-50 p-4 rounded-md text-center">
            <p className="text-3xl font-bold text-red-800">
              {mockOverview.suspendedGoals}
            </p>
            <p className="text-sm text-red-600">Suspended Goals</p>
          </div>
        </div>
        <div className="mt-6 p-4 border border-gray-200 rounded-md bg-white text-gray-700">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">
            User Growth (Chart)
          </h3>
          <div className="h-64">
            <Line data={userGrowthData} options={userGrowthOptions} />
          </div>
        </div>
        <div className="mt-4 p-4 border border-gray-200 rounded-md bg-white text-gray-700">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">
            Goal Status Distribution (Chart)
          </h3>
          <div className="h-64 flex justify-center items-center">
            <div className="w-80 h-80">
              {/* Pie chart can be smaller and centered */}
              <Pie data={goalStatusData} options={goalStatusOptions} />
            </div>
          </div>
        </div>
      </div>

      {/* Engagement Trends & Top Categories */}
      <div className="bg-white shadow-md rounded-lg p-6 mb-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">
          Engagement Trends & Popular Categories
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-medium text-gray-700 mb-3">
              Key Engagement Metrics
            </h3>
            <ul className="space-y-2">
              {mockEngagementTrends.map((metric, index) => (
                <li key={index} className="flex items-center text-gray-700">
                  <span className="font-semibold w-32">{metric.name}:</span>{" "}
                  {metric.value}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-medium text-gray-700 mb-3">
              Top Active Users
            </h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Username
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Goals Comp.
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Activity Score
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {mockTopUsers.map((user) => (
                    <tr key={user.id}>
                      <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-blue-600 hover:underline">
                        <Link href={`/admin/users/${user.id}`}>
                          {user.username}
                        </Link>
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-700">
                        {user.goalsCompleted}
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-700">
                        {user.activityScore}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <h3 className="text-lg font-medium text-gray-700 mb-3 mt-6">
              Popular Goal Categories
            </h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Category
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Goal Count
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {mockPopularCategories.map((category, index) => (
                    <tr key={index}>
                      <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900">
                        {category.name}
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-700">
                        {category.goalCount}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* User Streaks & Consistency */}
      <div className="bg-white shadow-md rounded-lg p-6 mb-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">
          User Streaks & Consistency Rates
        </h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Username
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Current Streak (Days)
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Longest Streak (Days)
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Consistency Rate (%)
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {mockUserStreaks.map((user) => (
                <tr key={user.userId}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600 hover:underline">
                    <Link href={`/admin/users/${user.userId}`}>
                      {user.username}
                    </Link>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                    {user.currentStreak}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                    {user.longestStreak}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                    {user.consistencyRate}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Report Export */}
      <div className="bg-white shadow-md rounded-lg p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">
          Report Export
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          <div>
            <label
              htmlFor="reportType"
              className="block text-sm font-medium text-gray-700"
            >
              Select Report Type
            </label>
            <select
              id="reportType"
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
            >
              <option value="user">User Data</option>
              <option value="goal">Goal Data</option>
              <option value="activity">Activity Logs</option>
              <option value="kyc">KYC Submissions</option>
            </select>
          </div>
          <div>
            <label
              htmlFor="reportFormat"
              className="block text-sm font-medium text-gray-700"
            >
              Select Format
            </label>
            <select
              id="reportFormat"
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
              value={reportFormat}
              onChange={(e) => setReportFormat(e.target.value)}
            >
              <option value="csv">CSV</option>
              <option value="pdf">PDF</option>
              <option value="json">JSON</option>
            </select>
          </div>
          <button
            onClick={handleExportReport}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 md:col-span-1"
          >
            Export Report
          </button>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsReportsPage;
