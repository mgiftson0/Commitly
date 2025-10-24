"use client";

import React, { useState } from "react";
import Link from "next/link";

interface VerifiedBadgeRequest {
  id: string;
  userId: string;
  username: string;
  submissionDate: string; // ISO date string
  status: "pending" | "approved" | "rejected";
  documents: string[]; // URLs to verification documents
}

interface ModeratedItem {
  id: string;
  reporterId?: string;
  reporterUsername?: string;
  entityType: "goal" | "note" | "message" | "user";
  entityId: string;
  entityDescription: string; // Brief description of the reported content/user
  reason: string;
  status: "pending" | "under_review" | "action_taken" | "dismissed";
  timestamp: string; // ISO date string
}

const mockBadgeRequests: VerifiedBadgeRequest[] = [
  {
    id: "badge_001",
    userId: "usr_006",
    username: "new_user_pending",
    submissionDate: "2023-10-25T10:30:00Z",
    status: "pending",
    documents: [
      "https://via.placeholder.com/600/0000FF/FFFFFF?text=ID_Doc_User6.pdf",
    ],
  },
  {
    id: "badge_002",
    userId: "usr_005",
    username: "bob_goalie",
    submissionDate: "2023-10-20T14:00:00Z",
    status: "approved",
    documents: [
      "https://via.placeholder.com/600/FF0000/FFFFFF?text=ID_Doc_Bob.pdf",
    ],
  },
];

const mockModeratedItems: ModeratedItem[] = [
  {
    id: "mod_001",
    reporterId: "usr_001",
    reporterUsername: "john.doe",
    entityType: "message",
    entityId: "msg_456",
    entityDescription: "Offensive language in private message",
    reason: "Hate speech",
    status: "pending",
    timestamp: "2023-10-26T12:00:00Z",
  },
  {
    id: "mod_002",
    reporterId: "usr_002",
    reporterUsername: "jane.smith",
    entityType: "goal",
    entityId: "goal_002",
    entityDescription: 'Goal title: "Illegal activity plan"',
    reason: "Illegal content",
    status: "under_review",
    timestamp: "2023-10-25T09:00:00Z",
  },
  {
    id: "mod_003",
    reporterId: "usr_004",
    reporterUsername: "moderator_alice",
    entityType: "user",
    entityId: "usr_002",
    entityDescription: "User profile: jane.smith",
    reason: "Repeated harassment",
    status: "action_taken",
    timestamp: "2023-10-24T16:00:00Z",
  },
];

const ModerationPage = () => {
  const [badgeSearchTerm, setBadgeSearchTerm] = useState("");
  const [badgeFilterStatus, setBadgeFilterStatus] = useState("all");

  const [moderationSearchTerm, setModerationSearchTerm] = useState("");
  const [moderationFilterStatus, setModerationFilterStatus] = useState("all");

  const filteredBadgeRequests = mockBadgeRequests.filter((req) => {
    const matchesSearch =
      req.username.toLowerCase().includes(badgeSearchTerm.toLowerCase()) ||
      req.userId.toLowerCase().includes(badgeSearchTerm.toLowerCase());
    const matchesStatus =
      badgeFilterStatus === "all" || req.status === badgeFilterStatus;
    return matchesSearch && matchesStatus;
  });

  const filteredModeratedItems = mockModeratedItems.filter((item) => {
    const matchesSearch =
      item.reporterUsername
        ?.toLowerCase()
        .includes(moderationSearchTerm.toLowerCase()) ||
      item.entityDescription
        .toLowerCase()
        .includes(moderationSearchTerm.toLowerCase()) ||
      item.reason.toLowerCase().includes(moderationSearchTerm.toLowerCase());
    const matchesStatus =
      moderationFilterStatus === "all" ||
      item.status === moderationFilterStatus;
    return matchesSearch && matchesStatus;
  });

  const handleBadgeRequestAction = (
    id: string,
    action: "approve" | "reject",
  ) => {
    if (confirm(`Are you sure you want to ${action} badge request ${id}?`)) {
      console.log(`${action} badge request ${id} (mock)`);
      alert(`Badge request ${id} ${action}d (mock)`);
      // In a real app, update state or refetch data
    }
  };

  const handleModerationAction = (
    id: string,
    action: "review" | "take_action" | "dismiss" | "delete",
  ) => {
    if (
      confirm(
        `Are you sure you want to ${action.replace("_", " ")} item ${id}?`,
      )
    ) {
      console.log(`${action} moderation item ${id} (mock)`);
      alert(`Moderation item ${id} ${action.replace("_", " ")} (mock)`);
      // In a real app, update state or refetch data
    }
  };

  return (
    <div>
      <header className="bg-white shadow p-4 rounded-lg mb-6">
        <h1 className="text-3xl font-bold text-gray-900">
          Verification & Moderation
        </h1>
        <p className="text-gray-600 mt-2">
          Review and approve verified badge requests, manage reported content
          and users.
        </p>
      </header>

      {/* Verified Badge Requests */}
      <div className="bg-white shadow-md rounded-lg p-6 mb-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">
          Verified Badge Requests
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label
              htmlFor="badgeSearch"
              className="block text-sm font-medium text-gray-700"
            >
              Search Requests
            </label>
            <input
              type="text"
              id="badgeSearch"
              placeholder="Search by username, ID..."
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
              value={badgeSearchTerm}
              onChange={(e) => setBadgeSearchTerm(e.target.value)}
            />
          </div>
          <div>
            <label
              htmlFor="badgeStatusFilter"
              className="block text-sm font-medium text-gray-700"
            >
              Filter by Status
            </label>
            <select
              id="badgeStatusFilter"
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
              value={badgeFilterStatus}
              onChange={(e) => setBadgeFilterStatus(e.target.value)}
            >
              <option value="all">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
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
                  User
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Submission Date
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
                  Documents
                </th>
                <th scope="col" className="relative px-6 py-3">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredBadgeRequests.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-500"
                  >
                    No badge requests found matching your criteria.
                  </td>
                </tr>
              ) : (
                filteredBadgeRequests.map((req) => (
                  <tr key={req.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600 hover:underline">
                      <Link href={`/admin/users/${req.userId}`}>
                        {req.username}
                      </Link>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {new Date(req.submissionDate).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          req.status === "approved"
                            ? "bg-green-100 text-green-800"
                            : req.status === "pending"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-red-100 text-red-800"
                        }`}
                      >
                        {req.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-600">
                      {req.documents.map((doc, index) => (
                        <a
                          key={index}
                          href={doc}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block hover:underline"
                        >
                          Document {index + 1}
                        </a>
                      ))}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      {req.status === "pending" && (
                        <>
                          <button
                            onClick={() =>
                              handleBadgeRequestAction(req.id, "approve")
                            }
                            className="text-green-600 hover:text-green-900 mr-4"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() =>
                              handleBadgeRequestAction(req.id, "reject")
                            }
                            className="text-red-600 hover:text-red-900"
                          >
                            Reject
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Moderation Dashboard for Flagged Content & Users */}
      <div className="bg-white shadow-md rounded-lg p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">
          Moderation Dashboard
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label
              htmlFor="moderationSearch"
              className="block text-sm font-medium text-gray-700"
            >
              Search Flagged Items
            </label>
            <input
              type="text"
              id="moderationSearch"
              placeholder="Search by reporter, description, reason..."
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
              value={moderationSearchTerm}
              onChange={(e) => setModerationSearchTerm(e.target.value)}
            />
          </div>
          <div>
            <label
              htmlFor="moderationStatusFilter"
              className="block text-sm font-medium text-gray-700"
            >
              Filter by Status
            </label>
            <select
              id="moderationStatusFilter"
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
              value={moderationFilterStatus}
              onChange={(e) => setModerationFilterStatus(e.target.value)}
            >
              <option value="all">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="under_review">Under Review</option>
              <option value="action_taken">Action Taken</option>
              <option value="dismissed">Dismissed</option>
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
                  Entity
                </th>
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
              {filteredModeratedItems.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-500"
                  >
                    No flagged items found matching your criteria.
                  </td>
                </tr>
              ) : (
                filteredModeratedItems.map((item) => (
                  <tr key={item.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      <span className="capitalize">{item.entityType}</span>:{" "}
                      {item.entityDescription} (ID:{" "}
                      <Link
                        href={`/admin/${item.entityType === "user" ? "users" : item.entityType === "goal" ? "goals" : "#"}/${item.entityId}`}
                        className="text-blue-600 hover:underline"
                      >
                        {item.entityId}
                      </Link>
                      )
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-600 hover:underline">
                      {item.reporterUsername ? (
                        <Link href={`/admin/users/${item.reporterId}`}>
                          {item.reporterUsername}
                        </Link>
                      ) : (
                        "N/A"
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-red-700">
                      {item.reason}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          item.status === "pending"
                            ? "bg-yellow-100 text-yellow-800"
                            : item.status === "under_review"
                              ? "bg-blue-100 text-blue-800"
                              : item.status === "action_taken"
                                ? "bg-red-100 text-red-800"
                                : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {item.status.replace("_", " ")}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {new Date(item.timestamp).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      {item.status === "pending" && (
                        <button
                          onClick={() =>
                            handleModerationAction(item.id, "review")
                          }
                          className="text-blue-600 hover:text-blue-900 mr-4"
                        >
                          Review
                        </button>
                      )}
                      {item.status !== "action_taken" && (
                        <button
                          onClick={() =>
                            handleModerationAction(item.id, "take_action")
                          }
                          className="text-orange-600 hover:text-orange-900 mr-4"
                        >
                          Take Action
                        </button>
                      )}
                      {item.status !== "dismissed" && (
                        <button
                          onClick={() =>
                            handleModerationAction(item.id, "dismiss")
                          }
                          className="text-gray-600 hover:text-gray-900 mr-4"
                        >
                          Dismiss
                        </button>
                      )}
                      <button
                        onClick={() =>
                          handleModerationAction(item.id, "delete")
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

export default ModerationPage;
