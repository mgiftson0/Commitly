"use client";

import React, { useState } from "react";
import Link from "next/link";

interface ApiKey {
  id: string;
  name: string;
  key: string; // Masked for display
  service: string;
  expiresAt?: string; // ISO date string
  isActive: boolean;
}

interface LogEntry {
  id: string;
  timestamp: string;
  level: "INFO" | "WARN" | "ERROR" | "DEBUG";
  message: string;
  source: string;
}

const mockApiKeys: ApiKey[] = [
  {
    id: "api_001",
    name: "Email Service API",
    key: "sk_***********abc",
    service: "SendGrid",
    expiresAt: "2024-12-31T23:59:59Z",
    isActive: true,
  },
  {
    id: "api_002",
    name: "SMS OTP Gateway",
    key: "pk_***********xyz",
    service: "Twilio",
    expiresAt: undefined,
    isActive: true,
  },
  {
    id: "api_003",
    name: "Payment Gateway",
    key: "sk_***********def",
    service: "Stripe",
    expiresAt: "2023-11-15T23:59:59Z", // Expired
    isActive: false,
  },
];

const mockServerLogs: LogEntry[] = [
  {
    id: "log_001",
    timestamp: "2023-10-26T14:30:00Z",
    level: "INFO",
    message: "User 'john.doe' logged in successfully.",
    source: "AuthService",
  },
  {
    id: "log_002",
    timestamp: "2023-10-26T14:25:10Z",
    level: "WARN",
    message:
      "High latency detected for Goal API endpoint '/api/goals'. Duration: 550ms",
    source: "PerformanceMonitor",
  },
  {
    id: "log_003",
    timestamp: "2023-10-26T14:20:05Z",
    level: "ERROR",
    message:
      "Failed to send email for user 'jane.smith'. Reason: SMTP connection refused.",
    source: "NotificationService",
  },
  {
    id: "log_004",
    timestamp: "2023-10-26T14:15:00Z",
    level: "DEBUG",
    message: "Processing background job 'clean_temp_files'.",
    source: "JobScheduler",
  },
];

const DeveloperControlsPage = () => {
  const [newApiKeyFormData, setNewApiKeyFormData] = useState<Partial<ApiKey>>({
    name: "",
    key: "",
    service: "",
    expiresAt: "",
    isActive: true,
  });

  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [logFilterLevel, setLogFilterLevel] = useState("all");
  const [logSearchTerm, setLogSearchTerm] = useState("");

  const handleApiKeyChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    setNewApiKeyFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleAddApiKey = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Adding new API Key:", newApiKeyFormData);
    alert(`API Key "${newApiKeyFormData.name}" added (mock)`);
    // In a real app, send to API and refresh list
    setNewApiKeyFormData({
      name: "",
      key: "",
      service: "",
      expiresAt: "",
      isActive: true,
    });
  };

  const handleToggleApiKeyStatus = (id: string, currentStatus: boolean) => {
    if (
      confirm(
        `Are you sure you want to ${currentStatus ? "deactivate" : "activate"} API Key ${id}?`,
      )
    ) {
      console.log(`Toggling status for API Key ${id} (mock)`);
      alert(`API Key status toggled (mock)`);
      // In a real app, send API call
    }
  };

  const handleDeleteApiKey = (id: string) => {
    if (confirm("Are you sure you want to delete this API Key?")) {
      console.log(`Deleting API Key ${id} (mock)`);
      alert(`API Key deleted (mock)`);
      // In a real app, send API call
    }
  };

  const handleToggleMaintenanceMode = () => {
    const newState = !maintenanceMode;
    if (
      confirm(
        `Are you sure you want to ${newState ? "enable" : "disable"} maintenance mode?`,
      )
    ) {
      setMaintenanceMode(newState);
      console.log(`Maintenance mode set to: ${newState} (mock)`);
      alert(`Maintenance mode ${newState ? "enabled" : "disabled"} (mock)`);
      // In a real app, send API call to backend
    }
  };

  const handleCreateTestUser = () => {
    if (confirm("Create a new test user?")) {
      console.log("Creating test user (mock)");
      alert("Test user created: test_user_XYZ (mock)");
      // In a real app, trigger API to create user
    }
  };

  const handleCreateDummyGoal = () => {
    if (confirm("Create a new dummy goal?")) {
      console.log("Creating dummy goal (mock)");
      alert("Dummy goal created: dummy_goal_ABC (mock)");
      // In a real app, trigger API to create goal
    }
  };

  const filteredLogs = mockServerLogs.filter((log) => {
    const matchesLevel =
      logFilterLevel === "all" || log.level === logFilterLevel;
    const matchesSearch =
      log.message.toLowerCase().includes(logSearchTerm.toLowerCase()) ||
      log.source.toLowerCase().includes(logSearchTerm.toLowerCase());
    return matchesLevel && matchesSearch;
  });

  return (
    <div>
      <header className="bg-white shadow p-4 rounded-lg mb-6">
        <h1 className="text-3xl font-bold text-gray-900">
          Developer & Technical Controls
        </h1>
        <p className="text-gray-600 mt-2">
          Manage API keys, view server logs, toggle maintenance mode, and create
          test data.
        </p>
      </header>

      {/* API Keys & Integrations */}
      <div className="bg-white shadow-md rounded-lg p-6 mb-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">
          API Keys & Integrations
        </h2>
        <div className="overflow-x-auto mb-4">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Name
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Service
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Key (Masked)
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Expires
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Active
                </th>
                <th scope="col" className="relative px-6 py-3">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {mockApiKeys.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-500"
                  >
                    No API keys configured.
                  </td>
                </tr>
              ) : (
                mockApiKeys.map((key) => (
                  <tr key={key.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {key.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {key.service}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-700">
                      {key.key}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {key.expiresAt
                        ? new Date(key.expiresAt).toLocaleDateString()
                        : "Never"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${key.isActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}
                      >
                        {key.isActive ? "Yes" : "No"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() =>
                          handleToggleApiKeyStatus(key.id, key.isActive)
                        }
                        className="text-indigo-600 hover:text-indigo-900 mr-4"
                      >
                        {key.isActive ? "Deactivate" : "Activate"}
                      </button>
                      <button
                        onClick={() => handleDeleteApiKey(key.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <h3 className="text-lg font-medium text-gray-700 mb-3">
          Add New API Key
        </h3>
        <form onSubmit={handleAddApiKey} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="apiName"
                className="block text-sm font-medium text-gray-700"
              >
                Name
              </label>
              <input
                type="text"
                id="apiName"
                name="name"
                value={newApiKeyFormData.name}
                onChange={handleApiKeyChange}
                required
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
              />
            </div>
            <div>
              <label
                htmlFor="apiService"
                className="block text-sm font-medium text-gray-700"
              >
                Service
              </label>
              <input
                type="text"
                id="apiService"
                name="service"
                value={newApiKeyFormData.service}
                onChange={handleApiKeyChange}
                required
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
              />
            </div>
          </div>
          <div>
            <label
              htmlFor="apiKey"
              className="block text-sm font-medium text-gray-700"
            >
              Key Value
            </label>
            <input
              type="text"
              id="apiKey"
              name="key"
              value={newApiKeyFormData.key}
              onChange={handleApiKeyChange}
              required
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 font-mono"
            />
          </div>
          <div>
            <label
              htmlFor="apiExpiresAt"
              className="block text-sm font-medium text-gray-700"
            >
              Expires At (Optional)
            </label>
            <input
              type="date"
              id="apiExpiresAt"
              name="expiresAt"
              value={
                newApiKeyFormData.expiresAt
                  ? newApiKeyFormData.expiresAt.substring(0, 10)
                  : ""
              }
              onChange={handleApiKeyChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Add API Key
          </button>
        </form>
      </div>

      {/* Server Logs & Activity */}
      <div className="bg-white shadow-md rounded-lg p-6 mb-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">
          Server Logs & Activity
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label
              htmlFor="logSearch"
              className="block text-sm font-medium text-gray-700"
            >
              Search Logs
            </label>
            <input
              type="text"
              id="logSearch"
              placeholder="Search by message or source..."
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
              value={logSearchTerm}
              onChange={(e) => setLogSearchTerm(e.target.value)}
            />
          </div>
          <div>
            <label
              htmlFor="logFilterLevel"
              className="block text-sm font-medium text-gray-700"
            >
              Filter by Level
            </label>
            <select
              id="logFilterLevel"
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
              value={logFilterLevel}
              onChange={(e) => setLogFilterLevel(e.target.value)}
            >
              <option value="all">All Levels</option>
              <option value="INFO">INFO</option>
              <option value="WARN">WARN</option>
              <option value="ERROR">ERROR</option>
              <option value="DEBUG">DEBUG</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Timestamp
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Level
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Source
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Message
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td
                    colSpan={4}
                    className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-500"
                  >
                    No logs found matching your criteria.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => (
                  <tr key={log.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {new Date(log.timestamp).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${log.level === "ERROR" ? "bg-red-100 text-red-800" : log.level === "WARN" ? "bg-yellow-100 text-yellow-800" : "bg-gray-100 text-gray-800"}`}
                      >
                        {log.level}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {log.source}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      {log.message}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Maintenance Mode */}
      <div className="bg-white shadow-md rounded-lg p-6 mb-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">
          Maintenance Mode
        </h2>
        <div className="flex items-center justify-between">
          <p className="text-gray-700">
            Current Status:{" "}
            <span
              className={`font-semibold ${maintenanceMode ? "text-red-600" : "text-green-600"}`}
            >
              {maintenanceMode ? "ENABLED" : "DISABLED"}
            </span>
          </p>
          <button
            onClick={handleToggleMaintenanceMode}
            className={`px-4 py-2 rounded-md ${maintenanceMode ? "bg-green-600 hover:bg-green-700" : "bg-red-600 hover:bg-red-700"} text-white`}
          >
            {maintenanceMode ? "Disable Maintenance" : "Enable Maintenance"}
          </button>
        </div>
        <p className="text-sm text-gray-600 mt-2">
          When enabled, users will see a maintenance page. Use for updates or
          emergency fixes.
        </p>
      </div>

      {/* QA & Testing Tools */}
      <div className="bg-white shadow-md rounded-lg p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">
          QA & Testing Tools
        </h2>
        <p className="text-gray-700 mb-4">
          Quickly generate test data for development and quality assurance.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button
            onClick={handleCreateTestUser}
            className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
          >
            Create Test User
          </button>
          <button
            onClick={handleCreateDummyGoal}
            className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
          >
            Create Dummy Goal
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeveloperControlsPage;
