"use client";

import React, { useState } from "react";

interface GeneralSettings {
  darkModeDefault: boolean;
  platformName: string;
  supportEmail: string;
}

interface GoalSettings {
  defaultTimeLimitHours: number;
  defaultGoalVisibility: "public" | "private";
  minGoalTitleLength: number;
}

interface FeatureToggles {
  commentsEnabled: boolean;
  milestonesEnabled: boolean;
  accountabilityPartnersEnabled: boolean;
  kycVerificationEnabled: boolean;
}

const mockGeneralSettings: GeneralSettings = {
  darkModeDefault: false,
  platformName: "Commitly",
  supportEmail: "support@commitly.com",
};

const mockGoalSettings: GoalSettings = {
  defaultTimeLimitHours: 24,
  defaultGoalVisibility: "public",
  minGoalTitleLength: 5,
};

const mockFeatureToggles: FeatureToggles = {
  commentsEnabled: true,
  milestonesEnabled: true,
  accountabilityPartnersEnabled: true,
  kycVerificationEnabled: true,
};

const SystemConfigurationPage = () => {
  const [generalSettings, setGeneralSettings] =
    useState<GeneralSettings>(mockGeneralSettings);
  const [goalSettings, setGoalSettings] =
    useState<GoalSettings>(mockGoalSettings);
  const [featureToggles, setFeatureToggles] =
    useState<FeatureToggles>(mockFeatureToggles);

  // General Settings Handlers
  const handleGeneralSettingChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    setGeneralSettings((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSaveGeneralSettings = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Saving general settings:", generalSettings);
    alert("General settings updated (mock)");
    // In a real app, send to API
  };

  // Goal Settings Handlers
  const handleGoalSettingChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    setGoalSettings((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSaveGoalSettings = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Saving goal settings:", goalSettings);
    alert("Goal settings updated (mock)");
    // In a real app, send to API
  };

  // Feature Toggle Handlers
  const handleFeatureToggleChange = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const { name, checked } = e.target;
    setFeatureToggles((prev) => ({ ...prev, [name]: checked }));
  };

  const handleSaveFeatureToggles = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Saving feature toggles:", featureToggles);
    alert("Feature toggles updated (mock)");
    // In a real app, send to API
  };

  // Data Management Handlers
  const handleBackupData = () => {
    if (confirm("Are you sure you want to initiate a data backup?")) {
      console.log("Initiating data backup (mock)");
      alert("Data backup initiated (mock)");
      // In a real app, trigger backup API
    }
  };

  const handleRestoreData = () => {
    if (
      confirm(
        "WARNING: Restoring data will overwrite current data. Proceed with caution. Are you sure?",
      )
    ) {
      console.log("Initiating data restore (mock)");
      alert("Data restore initiated (mock)");
      // In a real app, trigger restore API (requires file upload/selection)
    }
  };

  return (
    <div>
      <header className="bg-white shadow p-4 rounded-lg mb-6">
        <h1 className="text-3xl font-bold text-gray-900">
          System Configuration
        </h1>
        <p className="text-gray-600 mt-2">
          Manage system-wide settings, defaults, and feature toggles.
        </p>
      </header>

      {/* General Settings */}
      <div className="bg-white shadow-md rounded-lg p-6 mb-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">
          General Settings
        </h2>
        <form onSubmit={handleSaveGeneralSettings} className="space-y-4">
          <div>
            <label
              htmlFor="platformName"
              className="block text-sm font-medium text-gray-700"
            >
              Platform Name
            </label>
            <input
              type="text"
              id="platformName"
              name="platformName"
              value={generalSettings.platformName}
              onChange={handleGeneralSettingChange}
              required
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
            />
          </div>
          <div>
            <label
              htmlFor="supportEmail"
              className="block text-sm font-medium text-gray-700"
            >
              Support Email
            </label>
            <input
              type="email"
              id="supportEmail"
              name="supportEmail"
              value={generalSettings.supportEmail}
              onChange={handleGeneralSettingChange}
              required
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
            />
          </div>
          <div>
            <label
              htmlFor="darkModeDefault"
              className="flex items-center text-sm font-medium text-gray-700"
            >
              <input
                type="checkbox"
                id="darkModeDefault"
                name="darkModeDefault"
                checked={generalSettings.darkModeDefault}
                onChange={handleGeneralSettingChange}
                className="h-4 w-4 text-indigo-600 border-gray-300 rounded mr-2"
              />
              Enable Dark Mode by Default
            </label>
          </div>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Save General Settings
          </button>
        </form>
      </div>

      {/* Goal Settings */}
      <div className="bg-white shadow-md rounded-lg p-6 mb-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">
          Goal Settings
        </h2>
        <form onSubmit={handleSaveGoalSettings} className="space-y-4">
          <div>
            <label
              htmlFor="defaultTimeLimitHours"
              className="block text-sm font-medium text-gray-700"
            >
              Default Goal Time Limit (Hours)
            </label>
            <input
              type="number"
              id="defaultTimeLimitHours"
              name="defaultTimeLimitHours"
              value={goalSettings.defaultTimeLimitHours}
              onChange={handleGoalSettingChange}
              min="1"
              required
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
            />
          </div>
          <div>
            <label
              htmlFor="minGoalTitleLength"
              className="block text-sm font-medium text-gray-700"
            >
              Minimum Goal Title Length
            </label>
            <input
              type="number"
              id="minGoalTitleLength"
              name="minGoalTitleLength"
              value={goalSettings.minGoalTitleLength}
              onChange={handleGoalSettingChange}
              min="1"
              required
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
            />
          </div>
          <div>
            <label
              htmlFor="defaultGoalVisibility"
              className="block text-sm font-medium text-gray-700"
            >
              Default Goal Visibility
            </label>
            <select
              id="defaultGoalVisibility"
              name="defaultGoalVisibility"
              value={goalSettings.defaultGoalVisibility}
              onChange={handleGoalSettingChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
            >
              <option value="public">Public (Visible to everyone)</option>
              <option value="private">
                Private (Visible only to owner/partners)
              </option>
            </select>
          </div>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Save Goal Settings
          </button>
        </form>
      </div>

      {/* Feature Toggles */}
      <div className="bg-white shadow-md rounded-lg p-6 mb-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">
          Feature Toggles
        </h2>
        <form onSubmit={handleSaveFeatureToggles} className="space-y-4">
          <div>
            <label
              htmlFor="commentsEnabled"
              className="flex items-center text-sm font-medium text-gray-700"
            >
              <input
                type="checkbox"
                id="commentsEnabled"
                name="commentsEnabled"
                checked={featureToggles.commentsEnabled}
                onChange={handleFeatureToggleChange}
                className="h-4 w-4 text-indigo-600 border-gray-300 rounded mr-2"
              />
              Enable Comments on Goals
            </label>
          </div>
          <div>
            <label
              htmlFor="milestonesEnabled"
              className="flex items-center text-sm font-medium text-gray-700"
            >
              <input
                type="checkbox"
                id="milestonesEnabled"
                name="milestonesEnabled"
                checked={featureToggles.milestonesEnabled}
                onChange={handleFeatureToggleChange}
                className="h-4 w-4 text-indigo-600 border-gray-300 rounded mr-2"
              />
              Enable Goal Milestones
            </label>
          </div>
          <div>
            <label
              htmlFor="accountabilityPartnersEnabled"
              className="flex items-center text-sm font-medium text-gray-700"
            >
              <input
                type="checkbox"
                id="accountabilityPartnersEnabled"
                name="accountabilityPartnersEnabled"
                checked={featureToggles.accountabilityPartnersEnabled}
                onChange={handleFeatureToggleChange}
                className="h-4 w-4 text-indigo-600 border-gray-300 rounded mr-2"
              />
              Enable Accountability Partners
            </label>
          </div>
          <div>
            <label
              htmlFor="kycVerificationEnabled"
              className="flex items-center text-sm font-medium text-gray-700"
            >
              <input
                type="checkbox"
                id="kycVerificationEnabled"
                name="kycVerificationEnabled"
                checked={featureToggles.kycVerificationEnabled}
                onChange={handleFeatureToggleChange}
                className="h-4 w-4 text-indigo-600 border-gray-300 rounded mr-2"
              />
              Enable KYC Verification for Users
            </label>
          </div>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Save Feature Toggles
          </button>
        </form>
      </div>

      {/* Data Management */}
      <div className="bg-white shadow-md rounded-lg p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">
          Data Management
        </h2>
        <div className="space-y-4">
          <button
            onClick={handleBackupData}
            className="w-full px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
          >
            Initiate Data Backup
          </button>
          <button
            onClick={handleRestoreData}
            className="w-full px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
          >
            Restore Data (Requires File Upload)
          </button>
          <p className="text-sm text-gray-600 mt-2">
            Warning: Data restoration is a critical operation and should be
            performed with extreme caution.
          </p>
        </div>
      </div>
    </div>
  );
};

export default SystemConfigurationPage;
