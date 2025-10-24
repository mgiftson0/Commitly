"use client";

import React, { useState } from "react";

interface Announcement {
  id: string;
  title: string;
  content: string;
  target: "all" | "users" | "email_subscribers";
  sendMethod: "in_app" | "email" | "both";
  status: "draft" | "scheduled" | "sent";
  scheduledAt?: string; // ISO date string
  sentAt?: string; // ISO date string
}

interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  body: string; // HTML content
  type:
    | "goal_created"
    | "goal_completed"
    | "goal_missed"
    | "password_reset"
    | "kyc_status";
  lastUpdated: string; // ISO date string
}

const mockAnnouncements: Announcement[] = [
  {
    id: "ann_001",
    title: "Platform Update: New Features Live!",
    content: "Exciting new features have been rolled out. Check them out now!",
    target: "all",
    sendMethod: "in_app",
    status: "sent",
    sentAt: "2023-10-20T09:00:00Z",
  },
  {
    id: "ann_002",
    title: "Scheduled Maintenance",
    content:
      "The platform will undergo maintenance on Nov 1st from 2 AM to 4 AM UTC.",
    target: "all",
    sendMethod: "both",
    status: "scheduled",
    scheduledAt: "2023-11-01T02:00:00Z",
  },
];

const mockEmailTemplates: EmailTemplate[] = [
  {
    id: "tpl_001",
    name: "Goal Created Confirmation",
    subject: 'Your new goal "{{goalTitle}}" has been created!',
    body: "<html><body><p>Hi {{userName}},</p><p>You successfully created a new goal: <strong>{{goalTitle}}</strong>.</p><p>Keep up the great work!</p></body></html>",
    type: "goal_created",
    lastUpdated: "2023-09-15T10:00:00Z",
  },
  {
    id: "tpl_002",
    name: "Goal Missed Reminder",
    subject: 'Reminder: You missed your goal "{{goalTitle}}"',
    body: "<html><body><p>Hi {{userName}},</p><p>This is a friendly reminder that your goal <strong>{{goalTitle}}</strong> was marked as missed.</p><p>Don't give up!</p></body></html>",
    type: "goal_missed",
    lastUpdated: "2023-10-01T14:00:00Z",
  },
];

const NotificationsPage = () => {
  const [announcementFormData, setAnnouncementFormData] = useState<
    Partial<Announcement>
  >({
    title: "",
    content: "",
    target: "all",
    sendMethod: "in_app",
    status: "draft",
    scheduledAt: "",
  });

  const [emailTemplateFormData, setEmailTemplateFormData] = useState<
    Partial<EmailTemplate>
  >({
    name: "",
    subject: "",
    body: "",
    type: "goal_created",
  });

  const handleAnnouncementChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = e.target;
    setAnnouncementFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCreateAnnouncement = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Creating announcement:", announcementFormData);
    alert("Announcement created/scheduled (mock)");
    // In a real app, send to API and refresh list
    setAnnouncementFormData({
      title: "",
      content: "",
      target: "all",
      sendMethod: "in_app",
      status: "draft",
      scheduledAt: "",
    });
  };

  const handleEmailTemplateChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = e.target;
    setEmailTemplateFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSaveEmailTemplate = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Saving email template:", emailTemplateFormData);
    alert("Email template saved (mock)");
    // In a real app, send to API and refresh list
  };

  const handleTriggerNotification = (notificationType: string) => {
    if (
      confirm(
        `Are you sure you want to manually trigger a "${notificationType}" notification?`,
      )
    ) {
      console.log(
        `Manually triggering ${notificationType} notification (mock)`,
      );
      alert(`"${notificationType}" notification triggered (mock)`);
      // In a real app, send API call to trigger
    }
  };

  return (
    <div>
      <header className="bg-white shadow p-4 rounded-lg mb-6">
        <h1 className="text-3xl font-bold text-gray-900">
          Notification & Communication Control
        </h1>
        <p className="text-gray-600 mt-2">
          Send system-wide announcements, manage email templates, and trigger
          notifications.
        </p>
      </header>

      {/* System Announcements */}
      <div className="bg-white shadow-md rounded-lg p-6 mb-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">
          System Announcements
        </h2>
        <form onSubmit={handleCreateAnnouncement} className="space-y-4">
          <div>
            <label
              htmlFor="announcementTitle"
              className="block text-sm font-medium text-gray-700"
            >
              Title
            </label>
            <input
              type="text"
              id="announcementTitle"
              name="title"
              value={announcementFormData.title}
              onChange={handleAnnouncementChange}
              required
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
            />
          </div>
          <div>
            <label
              htmlFor="announcementContent"
              className="block text-sm font-medium text-gray-700"
            >
              Content
            </label>
            <textarea
              id="announcementContent"
              name="content"
              rows={4}
              value={announcementFormData.content}
              onChange={handleAnnouncementChange}
              required
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
            ></textarea>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label
                htmlFor="announcementTarget"
                className="block text-sm font-medium text-gray-700"
              >
                Target Audience
              </label>
              <select
                id="announcementTarget"
                name="target"
                value={announcementFormData.target}
                onChange={handleAnnouncementChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
              >
                <option value="all">All Users</option>
                <option value="users">Registered Users</option>
                <option value="email_subscribers">Email Subscribers</option>
              </select>
            </div>
            <div>
              <label
                htmlFor="announcementSendMethod"
                className="block text-sm font-medium text-gray-700"
              >
                Send Method
              </label>
              <select
                id="announcementSendMethod"
                name="sendMethod"
                value={announcementFormData.sendMethod}
                onChange={handleAnnouncementChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
              >
                <option value="in_app">In-App</option>
                <option value="email">Email</option>
                <option value="both">Both</option>
              </select>
            </div>
            <div>
              <label
                htmlFor="announcementStatus"
                className="block text-sm font-medium text-gray-700"
              >
                Status
              </label>
              <select
                id="announcementStatus"
                name="status"
                value={announcementFormData.status}
                onChange={handleAnnouncementChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
              >
                <option value="draft">Draft</option>
                <option value="scheduled">Scheduled</option>
                <option value="sent">Send Now</option>
              </select>
            </div>
          </div>
          {announcementFormData.status === "scheduled" && (
            <div>
              <label
                htmlFor="scheduledAt"
                className="block text-sm font-medium text-gray-700"
              >
                Schedule Date/Time
              </label>
              <input
                type="datetime-local"
                id="scheduledAt"
                name="scheduledAt"
                value={
                  announcementFormData.scheduledAt
                    ? announcementFormData.scheduledAt.substring(0, 16)
                    : ""
                }
                onChange={handleAnnouncementChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
              />
            </div>
          )}
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            {announcementFormData.status === "sent"
              ? "Send Announcement"
              : "Save & Schedule Announcement"}
          </button>
        </form>

        <h3 className="text-lg font-semibold text-gray-800 mt-8 mb-4">
          Existing Announcements
        </h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Title
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Target
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Method
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
                  Date
                </th>
                <th scope="col" className="relative px-6 py-3">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {mockAnnouncements.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-500"
                  >
                    No announcements found.
                  </td>
                </tr>
              ) : (
                mockAnnouncements.map((ann) => (
                  <tr key={ann.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {ann.title}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 capitalize">
                      {ann.target.replace("_", " ")}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 capitalize">
                      {ann.sendMethod.replace("_", " ")}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          ann.status === "sent"
                            ? "bg-green-100 text-green-800"
                            : ann.status === "scheduled"
                              ? "bg-blue-100 text-blue-800"
                              : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {ann.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {ann.scheduledAt
                        ? new Date(ann.scheduledAt).toLocaleString()
                        : ann.sentAt
                          ? new Date(ann.sentAt).toLocaleString()
                          : "N/A"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button className="text-indigo-600 hover:text-indigo-900 mr-4">
                        Edit
                      </button>
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

      {/* Email Reminder Templates */}
      <div className="bg-white shadow-md rounded-lg p-6 mb-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">
          Email Reminder Templates
        </h2>
        <form onSubmit={handleSaveEmailTemplate} className="space-y-4">
          <div>
            <label
              htmlFor="templateName"
              className="block text-sm font-medium text-gray-700"
            >
              Template Name
            </label>
            <input
              type="text"
              id="templateName"
              name="name"
              value={emailTemplateFormData.name}
              onChange={handleEmailTemplateChange}
              required
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
            />
          </div>
          <div>
            <label
              htmlFor="templateType"
              className="block text-sm font-medium text-gray-700"
            >
              Template Type
            </label>
            <select
              id="templateType"
              name="type"
              value={emailTemplateFormData.type}
              onChange={handleEmailTemplateChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
            >
              <option value="goal_created">Goal Created</option>
              <option value="goal_completed">Goal Completed</option>
              <option value="goal_missed">Goal Missed</option>
              <option value="password_reset">Password Reset</option>
              <option value="kyc_status">KYC Status Update</option>
            </select>
          </div>
          <div>
            <label
              htmlFor="templateSubject"
              className="block text-sm font-medium text-gray-700"
            >
              Subject
            </label>
            <input
              type="text"
              id="templateSubject"
              name="subject"
              value={emailTemplateFormData.subject}
              onChange={handleEmailTemplateChange}
              required
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
            />
          </div>
          <div>
            <label
              htmlFor="templateBody"
              className="block text-sm font-medium text-gray-700"
            >
              Body (HTML)
            </label>
            <textarea
              id="templateBody"
              name="body"
              rows={8}
              value={emailTemplateFormData.body}
              onChange={handleEmailTemplateChange}
              required
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 font-mono text-xs"
            ></textarea>
            <p className="mt-1 text-sm text-gray-500">
              Use placeholders like{" "}
              <code className="bg-gray-200 p-1 rounded">{"{{userName}}"}</code>,{" "}
              <code className="bg-gray-200 p-1 rounded">{"{{goalTitle}}"}</code>
              .
            </p>
          </div>
          <button
            type="submit"
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
          >
            Save Template
          </button>
        </form>

        <h3 className="text-lg font-semibold text-gray-800 mt-8 mb-4">
          Existing Templates
        </h3>
        <div className="overflow-x-auto">
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
                  Type
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Subject
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Last Updated
                </th>
                <th scope="col" className="relative px-6 py-3">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {mockEmailTemplates.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-500"
                  >
                    No email templates found.
                  </td>
                </tr>
              ) : (
                mockEmailTemplates.map((template) => (
                  <tr key={template.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {template.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 capitalize">
                      {template.type.replace("_", " ")}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {template.subject}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {new Date(template.lastUpdated).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button className="text-indigo-600 hover:text-indigo-900 mr-4">
                        Edit
                      </button>
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

      {/* Manual Notification Triggers */}
      <div className="bg-white shadow-md rounded-lg p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">
          Manual Notification Triggers
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button
            onClick={() =>
              handleTriggerNotification("Goal Reminder (e.g., missed)")
            }
            className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
          >
            Trigger Goal Reminder
          </button>
          <button
            onClick={() => handleTriggerNotification("System Update (in-app)")}
            className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
          >
            Trigger In-App System Update
          </button>
          <button
            onClick={() =>
              handleTriggerNotification("KYC Status Update (email)")
            }
            className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
          >
            Trigger KYC Status Email
          </button>
          {/* Add more manual triggers as needed */}
        </div>
      </div>
    </div>
  );
};

export default NotificationsPage;
