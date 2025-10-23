"use client";

import React, { useState } from "react";
import Link from "next/link";

interface AccountabilityConnection {
  id: string;
  user1Id: string;
  user1Username: string;
  user2Id: string;
  user2Username: string;
  status: "active" | "pending" | "revoked" | "blocked";
  establishedDate: string; // ISO date string
  lastInteraction: string; // ISO date string
}

interface FlaggedInteraction {
  id: string;
  reporterId: string;
  reporterUsername: string;
  reportedEntity: "user" | "goal" | "message";
  reportedEntityId: string;
  reportedEntityDescription: string;
  reason: string;
  status: "pending" | "reviewed" | "resolved";
  timestamp: string; // ISO date string
}

const mockConnections: AccountabilityConnection[] = [
  {
    id: "conn_001",
    user1Id: "usr_001",
    user1Username: "john.doe",
    user2Id: "usr_002",
    user2Username: "jane.smith",
    status: "active",
    establishedDate: "2023-09-01T10:00:00Z",
    lastInteraction: "2023-10-25T14:30:00Z",
  },
  {
    id: "conn_002",
    user1Id: "usr_003",
    user1Username: "admin_user",
    user2Id: "usr_004",
    user2Username: "moderator_alice",
    status: "pending",
    establishedDate: "2023-10-20T11:00:00Z",
    lastInteraction: "2023-10-20T11:05:00Z",
  },
  {
    id: "conn_003",
    user1Id: "usr_005",
    user1Username: "bob_goalie",
    user2Id: "usr_001",
    user2Username: "john.doe",
    status: "revoked",
    establishedDate: "2023-08-15T09:00:00Z",
    lastInteraction: "2023-09-10T16:00:00Z",
  },
];

const mockFlaggedInteractions: FlaggedInteraction[] = [
  {
    id: "flag_001",
    reporterId: "usr_001",
    reporterUsername: "john.doe",
    reportedEntity: "message",
    reportedEntityId: "msg_123",
    reportedEntityDescription: "Abusive message in goal chat",
    reason: "Hate speech",
    status: "pending",
    timestamp: "2023-10-26T08:30:00Z",
  },
  {
    id: "flag_002",
    reporterId: "usr_004",
    reporterUsername: "moderator_alice",
    reportedEntity: "goal",
    reportedEntityId: "goal_002",
    reportedEntityDescription: "Goal 'Run a Marathon' content violation",
    reason: "Inappropriate content",
    status: "reviewed",
    timestamp: "2023-10-25T11:45:00Z",
  },
];

const AccountabilityManagementPage = () => {
  const [connectionSearchTerm, setConnectionSearchTerm] = useState("");
  const [connectionFilterStatus, setConnectionFilterStatus] = useState("all");

  const [flaggedSearchTerm, setFlaggedSearchTerm] = useState("");
  const [flaggedFilterStatus, setFlaggedFilterStatus] = useState("all");

  const filteredConnections = mockConnections.filter((conn) => {
    const matchesSearch =
      conn.user1Username
        .toLowerCase()
        .includes(connectionSearchTerm.toLowerCase()) ||
      conn.user2Username
        .toLowerCase()
        .includes(connectionSearchTerm.toLowerCase());
    const matchesStatus =
      connectionFilterStatus === "all" ||
      conn.status === connectionFilterStatus;
    return matchesSearch && matchesStatus;
  });

  const filteredFlaggedInteractions = mockFlaggedInteractions.filter((flag) => {
    const matchesSearch =
      flag.reporterUsername
        .toLowerCase()
        .includes(flaggedSearchTerm.toLowerCase()) ||
      flag.reportedEntityDescription
        .toLowerCase()
        .includes(flaggedSearchTerm.toLowerCase()) ||
      flag.reason.toLowerCase().includes(flaggedSearchTerm.toLowerCase());
    const matchesStatus =
      flaggedFilterStatus === "all" || flag.status === flaggedFilterStatus;
    return matchesSearch && matchesStatus;
  });

  const handleRevokeConnection = (id: string) => {
    if (confirm(`Are you sure you want to revoke connection ${id}?`)) {
      console.log(`Revoking connection ${id} (mock)`);
      alert(`Connection ${id} revoked (mock)`);
      // In a real app, update state or refetch data
    }
  };

  const handleBlockConnection = (id: string) => {
    if (confirm(`Are you sure you want to block connection ${id}?`)) {
      console.log(`Blocking connection ${id} (mock)`);
      alert(`Connection ${id} blocked (mock)`);
      // In a real app, update state or refetch data
    }
  };

  const handleFlaggedInteractionAction = (
    id: string,
    action: "reviewed" | "resolved" | "delete",
  ) => {
    if (confirm(`Are you sure you want to ${action} flagged item ${id}?`)) {
      console.log(`${action} flagged item ${id} (mock)`);
      alert(`Flagged item ${id} ${action} (mock)`);
      // In a real app, update state or refetch data
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <header className="bg-white shadow p-4 rounded-lg mb-6">
        <h1 className="text-3xl font-bold text-gray-900">
          Accountability & Relationship Management
        </h1>
        <p className="text-gray-600 mt-2">
          Monitor accountability partner connections and manage abusive
          partnerships.
        </p>
      </header>

      {/* Partner Connections Overview */}
      <div className="bg-white shadow-md rounded-lg p-6 mb-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">
          Partner Connections Overview
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label
              htmlFor="connectionSearch"
              className="block text-sm font-medium text-gray-700"
            >
              Search Connections
            </label>
            <input
              type="text"
              id="connectionSearch"
              placeholder="Search by username..."
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
              value={connectionSearchTerm}
              onChange={(e) => setConnectionSearchTerm(e.target.value)}
            />
          </div>
          <div>
            <label
              htmlFor="connectionStatusFilter"
              className="block text-sm font-medium text-gray-700"
            >
              Filter by Status
            </label>
            <select
              id="connectionStatusFilter"
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
              value={connectionFilterStatus}
              onChange={(e) => setConnectionFilterStatus(e.target.value)}
            >
              <option value="all">All Statuses</option>
              <option value="active">Active</option>
              <option value="pending">Pending</option>
              <option value="revoked">Revoked</option>
              <option value="blocked">Blocked</option>
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
                  User 1
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  User 2
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Status
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Established Date
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Last Interaction
                </th>
                <th scope="col" className="relative px-6 py-3">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredConnections.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-500"
                  >
                    No connections found matching your criteria.
                  </td>
                </tr>
              ) : (
                filteredConnections.map((conn) => (
                  <tr key={conn.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600 hover:underline">
                      <Link href={`/admin/users/${conn.user1Id}`}>
                        {conn.user1Username}
                      </Link>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600 hover:underline">
                      <Link href={`/admin/users/${conn.user2Id}`}>
                        {conn.user2Username}
                      </Link>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          conn.status === "active"
                            ? "bg-green-100 text-green-800"
                            : conn.status === "pending"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-red-100 text-red-800"
                        }`}
                      >
                        {conn.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {new Date(conn.establishedDate).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {new Date(conn.lastInteraction).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      {conn.status !== "revoked" &&
                        conn.status !== "blocked" && (
                          <button
                            onClick={() => handleRevokeConnection(conn.id)}
                            className="text-orange-600 hover:text-orange-900 mr-4"
                          >
                            Revoke
                          </button>
                        )}
                      {conn.status !== "blocked" && (
                        <button
                          onClick={() => handleBlockConnection(conn.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Block
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Flagged Interactions & Reports */}
      <div className="bg-white shadow-md rounded-lg p-6 mt-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">
          Flagged Interactions & Reports
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label
              htmlFor="flaggedSearch"
              className="block text-sm font-medium text-gray-700"
            >
              Search Flagged Items
            </label>
            <input
              type="text"
              id="flaggedSearch"
              placeholder="Search by reporter, reason, description..."
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
              value={flaggedSearchTerm}
              onChange={(e) => setFlaggedSearchTerm(e.target.value)}
            />
          </div>
          <div>
            <label
              htmlFor="flaggedStatusFilter"
              className="block text-sm font-medium text-gray-700"
            >
              Filter by Status
            </label>
            <select
              id="flaggedStatusFilter"
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
              value={flaggedFilterStatus}
              onChange={(e) => setFlaggedFilterStatus(e.target.value)}
            >
              <option value="all">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="reviewed">Reviewed</option>
              <option value="resolved">Resolved</option>
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
                  Reporter
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Reported Entity
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Reason
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Status
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Timestamp
                </th>
                <th scope="col" className="relative px-6 py-3">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredFlaggedInteractions.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-500"
                  >
                    No flagged interactions found matching your criteria.
                  </td>
                </tr>
              ) : (
                filteredFlaggedInteractions.map((flag) => (
                  <tr key={flag.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600 hover:underline">
                      <Link href={`/admin/users/${flag.reporterId}`}>
                        {flag.reporterUsername}
                      </Link>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      <span className="capitalize">{flag.reportedEntity}</span>:{" "}
                      {flag.reportedEntityDescription} (ID:{" "}
                      {flag.reportedEntityId})
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-red-700">
                      {flag.reason}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          flag.status === "pending"
                            ? "bg-yellow-100 text-yellow-800"
                            : flag.status === "reviewed"
                              ? "bg-blue-100 text-blue-800"
                              : "bg-green-100 text-green-800"
                        }`}
                      >
                        {flag.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {new Date(flag.timestamp).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      {flag.status === "pending" && (
                        <>
                          <button
                            onClick={() =>
                              handleFlaggedInteractionAction(
                                flag.id,
                                "reviewed",
                              )
                            }
                            className="text-blue-600 hover:text-blue-900 mr-4"
                          >
                            Mark Reviewed
                          </button>
                          <button
                            onClick={() =>
                              handleFlaggedInteractionAction(
                                flag.id,
                                "resolved",
                              )
                            }
                            className="text-green-600 hover:text-green-900 mr-4"
                          >
                            Resolve
                          </button>
                        </>
                      )}
                      <button
                        onClick={() =>
                          handleFlaggedInteractionAction(flag.id, "delete")
                        }
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
      </div>
    </div>
  );
};

export default AccountabilityManagementPage;
