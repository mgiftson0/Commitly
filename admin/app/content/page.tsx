"use client";

import React, { useState } from "react";
import Link from "next/link";

interface StaticPage {
  id: string;
  name: string;
  slug: string;
  content: string; // Markdown or HTML
  lastUpdated: string; // ISO date string
}

interface FeaturedGoal {
  id: string;
  goalId: string;
  goalTitle: string;
  featuredOrder: number;
  isActive: boolean;
}

interface Testimonial {
  id: string;
  authorName: string;
  authorTitle: string;
  quote: string;
  imageUrl: string;
  isActive: boolean;
}

interface KycFormField {
  id: string;
  label: string;
  type: "text" | "number" | "date" | "select" | "file";
  required: boolean;
  options?: string[]; // For select type
  placeholder?: string;
}

const mockStaticPages: StaticPage[] = [
  {
    id: "page_001",
    name: "About Us",
    slug: "about",
    content: "## About Commitly\nThis is the *about us* page content.",
    lastUpdated: "2023-10-20T10:00:00Z",
  },
  {
    id: "page_002",
    name: "Help Center",
    slug: "help",
    content: "## Need Help?\nFind answers to common questions here.",
    lastUpdated: "2023-10-25T14:00:00Z",
  },
  {
    id: "page_003",
    name: "FAQ",
    slug: "faq",
    content: "## Frequently Asked Questions\nYour questions, answered.",
    lastUpdated: "2023-10-26T09:00:00Z",
  },
];

const mockFeaturedGoals: FeaturedGoal[] = [
  {
    id: "fg_001",
    goalId: "goal_001",
    goalTitle: "Learn Next.js Deeply",
    featuredOrder: 1,
    isActive: true,
  },
  {
    id: "fg_002",
    goalId: "goal_003",
    goalTitle: "Daily Meditation",
    featuredOrder: 2,
    isActive: true,
  },
];

const mockTestimonials: Testimonial[] = [
  {
    id: "test_001",
    authorName: "Alice B.",
    authorTitle: "Verified User",
    quote: "Commitly helped me achieve my fitness goals faster than ever!",
    imageUrl: "https://via.placeholder.com/50/FF00FF/FFFFFF?text=AB",
    isActive: true,
  },
  {
    id: "test_002",
    authorName: "Bob C.",
    authorTitle: "Early Adopter",
    quote: "The accountability features are a game-changer.",
    imageUrl: "https://via.placeholder.com/50/00FFFF/000000?text=BC",
    isActive: false,
  },
];

const mockKycFormFields: KycFormField[] = [
  {
    id: "kyc_field_001",
    label: "Full Legal Name",
    type: "text",
    required: true,
    placeholder: "As per ID document",
  },
  {
    id: "kyc_field_002",
    label: "Date of Birth",
    type: "date",
    required: true,
  },
  {
    id: "kyc_field_003",
    label: "Country of Residence",
    type: "select",
    required: true,
    options: ["USA", "Canada", "UK", "Australia", "Other"],
  },
  {
    id: "kyc_field_004",
    label: "ID Document Upload",
    type: "file",
    required: true,
  },
];

const ContentManagementPage = () => {
  const [selectedStaticPage, setSelectedStaticPage] =
    useState<StaticPage | null>(null);
  const [staticPageFormData, setStaticPageFormData] = useState<
    Partial<StaticPage>
  >({});

  const [featuredGoalFormData, setFeaturedGoalFormData] = useState<
    Partial<FeaturedGoal>
  >({
    goalId: "",
    goalTitle: "",
    featuredOrder: mockFeaturedGoals.length + 1,
    isActive: true,
  });

  const [testimonialFormData, setTestimonialFormData] = useState<
    Partial<Testimonial>
  >({
    authorName: "",
    authorTitle: "",
    quote: "",
    imageUrl: "",
    isActive: true,
  });

  const [kycFieldFormData, setKycFieldFormData] = useState<
    Partial<KycFormField>
  >({
    label: "",
    type: "text",
    required: false,
    options: [],
    placeholder: "",
  });
  const [editingKycField, setEditingKycField] = useState<KycFormField | null>(
    null,
  );

  // Static Page Handlers
  const handleSelectStaticPage = (page: StaticPage) => {
    setSelectedStaticPage(page);
    setStaticPageFormData(page);
  };

  const handleStaticPageChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setStaticPageFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSaveStaticPage = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Saving static page:", staticPageFormData);
    alert(`Static page "${staticPageFormData.name}" updated (mock)`);
    // In a real app, send data to API and refresh list
    setSelectedStaticPage(null);
    setStaticPageFormData({});
  };

  // Featured Goals Handlers
  const handleFeaturedGoalChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value, type, checked } = e.target;
    setFeaturedGoalFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleAddFeaturedGoal = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Adding featured goal:", featuredGoalFormData);
    alert(`Featured goal "${featuredGoalFormData.goalTitle}" added (mock)`);
    // In a real app, send data to API and refresh list
    setFeaturedGoalFormData({
      goalId: "",
      goalTitle: "",
      featuredOrder: mockFeaturedGoals.length + 1,
      isActive: true,
    });
  };

  const handleToggleFeaturedGoalStatus = (
    id: string,
    currentStatus: boolean,
  ) => {
    if (
      confirm(
        `Are you sure you want to ${currentStatus ? "deactivate" : "activate"} this featured goal?`,
      )
    ) {
      console.log(`Toggling status for featured goal ${id} (mock)`);
      alert(`Featured goal status toggled (mock)`);
      // In a real app, send API call
    }
  };

  const handleDeleteFeaturedGoal = (id: string) => {
    if (confirm("Are you sure you want to delete this featured goal?")) {
      console.log(`Deleting featured goal ${id} (mock)`);
      alert(`Featured goal deleted (mock)`);
      // In a real app, send API call
    }
  };

  // Testimonial Handlers
  const handleTestimonialChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value, type, checked } = e.target;
    setTestimonialFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleAddTestimonial = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Adding testimonial:", testimonialFormData);
    alert(`Testimonial from "${testimonialFormData.authorName}" added (mock)`);
    // In a real app, send data to API and refresh list
    setTestimonialFormData({
      authorName: "",
      authorTitle: "",
      quote: "",
      imageUrl: "",
      isActive: true,
    });
  };

  const handleToggleTestimonialStatus = (
    id: string,
    currentStatus: boolean,
  ) => {
    if (
      confirm(
        `Are you sure you want to ${currentStatus ? "deactivate" : "activate"} this testimonial?`,
      )
    ) {
      console.log(`Toggling status for testimonial ${id} (mock)`);
      alert(`Testimonial status toggled (mock)`);
      // In a real app, send API call
    }
  };

  const handleDeleteTestimonial = (id: string) => {
    if (confirm("Are you sure you want to delete this testimonial?")) {
      console.log(`Deleting testimonial ${id} (mock)`);
      alert(`Testimonial deleted (mock)`);
      // In a real app, send API call
    }
  };

  // KYC Form Field Handlers
  const handleKycFieldChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => {
    const { name, value, type, checked } = e.target;
    setKycFieldFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleAddKycField = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Adding KYC field:", kycFieldFormData);
    alert(`KYC field "${kycFieldFormData.label}" added (mock)`);
    // In a real app, send data to API and refresh list
    setKycFieldFormData({
      label: "",
      type: "text",
      required: false,
      options: [],
      placeholder: "",
    });
  };

  const handleEditKycField = (field: KycFormField) => {
    setEditingKycField(field);
    setKycFieldFormData(field);
  };

  const handleUpdateKycField = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Updating KYC field:", kycFieldFormData);
    alert(`KYC field "${kycFieldFormData.label}" updated (mock)`);
    setEditingKycField(null);
    setKycFieldFormData({
      label: "",
      type: "text",
      required: false,
      options: [],
      placeholder: "",
    });
  };

  const handleDeleteKycField = (id: string) => {
    if (confirm("Are you sure you want to delete this KYC form field?")) {
      console.log(`Deleting KYC field ${id} (mock)`);
      alert(`KYC field deleted (mock)`);
      // In a real app, send API call
    }
  };

  return (
    <div>
      <header className="bg-white shadow p-4 rounded-lg mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Content Management</h1>
        <p className="text-gray-600 mt-2">
          Manage static pages, featured goals, testimonials, and KYC form
          fields.
        </p>
      </header>

      {/* Static Pages Management */}
      <div className="bg-white shadow-md rounded-lg p-6 mb-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">
          Static Pages Management
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-medium text-gray-700 mb-3">
              Existing Pages
            </h3>
            <ul className="divide-y divide-gray-200 bg-gray-50 rounded-md">
              {mockStaticPages.map((page) => (
                <li
                  key={page.id}
                  className="p-3 hover:bg-gray-100 cursor-pointer flex justify-between items-center"
                  onClick={() => handleSelectStaticPage(page)}
                >
                  <span className="font-medium text-gray-900">{page.name}</span>
                  <span className="text-sm text-gray-500">/{page.slug}</span>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-medium text-gray-700 mb-3">
              {selectedStaticPage
                ? `Edit Page: ${selectedStaticPage.name}`
                : "Create New Page"}
            </h3>
            <form onSubmit={handleSaveStaticPage} className="space-y-4">
              <div>
                <label
                  htmlFor="staticPageName"
                  className="block text-sm font-medium text-gray-700"
                >
                  Page Name
                </label>
                <input
                  type="text"
                  id="staticPageName"
                  name="name"
                  value={staticPageFormData.name || ""}
                  onChange={handleStaticPageChange}
                  required
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                />
              </div>
              <div>
                <label
                  htmlFor="staticPageSlug"
                  className="block text-sm font-medium text-gray-700"
                >
                  Slug (URL path)
                </label>
                <input
                  type="text"
                  id="staticPageSlug"
                  name="slug"
                  value={staticPageFormData.slug || ""}
                  onChange={handleStaticPageChange}
                  required
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                />
              </div>
              <div>
                <label
                  htmlFor="staticPageContent"
                  className="block text-sm font-medium text-gray-700"
                >
                  Content (Markdown/HTML)
                </label>
                <textarea
                  id="staticPageContent"
                  name="content"
                  rows={10}
                  value={staticPageFormData.content || ""}
                  onChange={handleStaticPageChange}
                  required
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 font-mono text-sm"
                ></textarea>
              </div>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                {selectedStaticPage ? "Save Changes" : "Create Page"}
              </button>
              {selectedStaticPage && (
                <button
                  type="button"
                  onClick={() => setSelectedStaticPage(null)}
                  className="ml-2 px-4 py-2 bg-gray-400 text-white rounded-md hover:bg-gray-500"
                >
                  Cancel Edit
                </button>
              )}
            </form>
          </div>
        </div>
      </div>

      {/* Featured Content & Testimonials */}
      <div className="bg-white shadow-md rounded-lg p-6 mb-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">
          Featured Content & Testimonials
        </h2>

        {/* Featured Goals */}
        <div className="mb-8">
          <h3 className="text-lg font-medium text-gray-700 mb-3">
            Featured Goals
          </h3>
          <div className="overflow-x-auto mb-4">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Goal Title
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Order
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
                {mockFeaturedGoals.length === 0 ? (
                  <tr>
                    <td
                      colSpan={4}
                      className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-500"
                    >
                      No featured goals.
                    </td>
                  </tr>
                ) : (
                  mockFeaturedGoals.map((fg) => (
                    <tr key={fg.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600 hover:underline">
                        <Link href={`/admin/goals/${fg.goalId}`}>
                          {fg.goalTitle}
                        </Link>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                        {fg.featuredOrder}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${fg.isActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}
                        >
                          {fg.isActive ? "Yes" : "No"}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() =>
                            handleToggleFeaturedGoalStatus(fg.id, fg.isActive)
                          }
                          className="text-indigo-600 hover:text-indigo-900 mr-4"
                        >
                          {fg.isActive ? "Deactivate" : "Activate"}
                        </button>
                        <button
                          onClick={() => handleDeleteFeaturedGoal(fg.id)}
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
            Add New Featured Goal
          </h3>
          <form
            onSubmit={handleAddFeaturedGoal}
            className="grid grid-cols-1 md:grid-cols-3 gap-4"
          >
            <div>
              <label
                htmlFor="newFeaturedGoalId"
                className="block text-sm font-medium text-gray-700"
              >
                Goal ID
              </label>
              <input
                type="text"
                id="newFeaturedGoalId"
                name="goalId"
                value={featuredGoalFormData.goalId}
                onChange={handleFeaturedGoalChange}
                placeholder="e.g., goal_005"
                required
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
              />
            </div>
            <div>
              <label
                htmlFor="newFeaturedGoalTitle"
                className="block text-sm font-medium text-gray-700"
              >
                Goal Title
              </label>
              <input
                type="text"
                id="newFeaturedGoalTitle"
                name="goalTitle"
                value={featuredGoalFormData.goalTitle}
                onChange={handleFeaturedGoalChange}
                placeholder="Title to display"
                required
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
              />
            </div>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 self-end"
            >
              Add Featured Goal
            </button>
          </form>
        </div>

        {/* Testimonials */}
        <div>
          <h3 className="text-lg font-medium text-gray-700 mb-3">
            Testimonials
          </h3>
          <div className="overflow-x-auto mb-4">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Author
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Quote
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
                {mockTestimonials.length === 0 ? (
                  <tr>
                    <td
                      colSpan={4}
                      className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-500"
                    >
                      No testimonials.
                    </td>
                  </tr>
                ) : (
                  mockTestimonials.map((testimonial) => (
                    <tr key={testimonial.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {testimonial.authorName}{" "}
                        <span className="text-gray-500">
                          ({testimonial.authorTitle})
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700 max-w-sm truncate">
                        {testimonial.quote}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${testimonial.isActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}
                        >
                          {testimonial.isActive ? "Yes" : "No"}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() =>
                            handleToggleTestimonialStatus(
                              testimonial.id,
                              testimonial.isActive,
                            )
                          }
                          className="text-indigo-600 hover:text-indigo-900 mr-4"
                        >
                          {testimonial.isActive ? "Deactivate" : "Activate"}
                        </button>
                        <button
                          onClick={() =>
                            handleDeleteTestimonial(testimonial.id)
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
          <h3 className="text-lg font-medium text-gray-700 mb-3">
            Add New Testimonial
          </h3>
          <form onSubmit={handleAddTestimonial} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="testimonialAuthorName"
                  className="block text-sm font-medium text-gray-700"
                >
                  Author Name
                </label>
                <input
                  type="text"
                  id="testimonialAuthorName"
                  name="authorName"
                  value={testimonialFormData.authorName}
                  onChange={handleTestimonialChange}
                  required
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                />
              </div>
              <div>
                <label
                  htmlFor="testimonialAuthorTitle"
                  className="block text-sm font-medium text-gray-700"
                >
                  Author Title
                </label>
                <input
                  type="text"
                  id="testimonialAuthorTitle"
                  name="authorTitle"
                  value={testimonialFormData.authorTitle}
                  onChange={handleTestimonialChange}
                  placeholder="e.g., Verified User, CEO"
                  required
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                />
              </div>
            </div>
            <div>
              <label
                htmlFor="testimonialQuote"
                className="block text-sm font-medium text-gray-700"
              >
                Quote
              </label>
              <textarea
                id="testimonialQuote"
                name="quote"
                rows={3}
                value={testimonialFormData.quote}
                onChange={handleTestimonialChange}
                required
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
              ></textarea>
            </div>
            <div>
              <label
                htmlFor="testimonialImageUrl"
                className="block text-sm font-medium text-gray-700"
              >
                Image URL (Optional)
              </label>
              <input
                type="url"
                id="testimonialImageUrl"
                name="imageUrl"
                value={testimonialFormData.imageUrl}
                onChange={handleTestimonialChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
              />
            </div>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Add Testimonial
            </button>
          </form>
        </div>
      </div>

      {/* KYC Form Fields */}
      <div className="bg-white shadow-md rounded-lg p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">
          KYC Form Fields
        </h2>
        <div className="overflow-x-auto mb-4">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Label
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
                  Required
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Options
                </th>
                <th scope="col" className="relative px-6 py-3">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {mockKycFormFields.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-500"
                  >
                    No KYC form fields defined.
                  </td>
                </tr>
              ) : (
                mockKycFormFields.map((field) => (
                  <tr key={field.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {field.label}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 capitalize">
                      {field.type}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${field.required ? "bg-red-100 text-red-800" : "bg-green-100 text-green-800"}`}
                      >
                        {field.required ? "Yes" : "No"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {field.options && field.options.length > 0
                        ? field.options.join(", ")
                        : "N/A"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleEditKycField(field)}
                        className="text-indigo-600 hover:text-indigo-900 mr-4"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteKycField(field.id)}
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
          {editingKycField ? "Edit KYC Field" : "Add New KYC Field"}
        </h3>
        <form
          onSubmit={editingKycField ? handleUpdateKycField : handleAddKycField}
          className="space-y-4"
        >
          <div>
            <label
              htmlFor="kycFieldLabel"
              className="block text-sm font-medium text-gray-700"
            >
              Field Label
            </label>
            <input
              type="text"
              id="kycFieldLabel"
              name="label"
              value={kycFieldFormData.label || ""}
              onChange={handleKycFieldChange}
              required
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
            />
          </div>
          <div>
            <label
              htmlFor="kycFieldType"
              className="block text-sm font-medium text-gray-700"
            >
              Field Type
            </label>
            <select
              id="kycFieldType"
              name="type"
              value={kycFieldFormData.type || "text"}
              onChange={handleKycFieldChange}
              required
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
            >
              <option value="text">Text</option>
              <option value="number">Number</option>
              <option value="date">Date</option>
              <option value="select">Select (Dropdown)</option>
              <option value="file">File Upload</option>
            </select>
          </div>
          <div>
            <label
              htmlFor="kycFieldRequired"
              className="flex items-center text-sm font-medium text-gray-700"
            >
              <input
                type="checkbox"
                id="kycFieldRequired"
                name="required"
                checked={kycFieldFormData.required || false}
                onChange={handleKycFieldChange}
                className="h-4 w-4 text-indigo-600 border-gray-300 rounded mr-2"
              />
              Required Field
            </label>
          </div>
          {kycFieldFormData.type === "select" && (
            <div>
              <label
                htmlFor="kycFieldOptions"
                className="block text-sm font-medium text-gray-700"
              >
                Options (comma-separated)
              </label>
              <input
                type="text"
                id="kycFieldOptions"
                name="options"
                value={kycFieldFormData.options?.join(", ") || ""}
                onChange={(e) =>
                  setKycFieldFormData((prev) => ({
                    ...prev,
                    options: e.target.value.split(",").map((opt) => opt.trim()),
                  }))
                }
                placeholder="Option 1, Option 2, Option 3"
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
              />
            </div>
          )}
          {kycFieldFormData.type === "text" && (
            <div>
              <label
                htmlFor="kycFieldPlaceholder"
                className="block text-sm font-medium text-gray-700"
              >
                Placeholder (Optional)
              </label>
              <input
                type="text"
                id="kycFieldPlaceholder"
                name="placeholder"
                value={kycFieldFormData.placeholder || ""}
                onChange={handleKycFieldChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
              />
            </div>
          )}
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            {editingKycField ? "Update Field" : "Add Field"}
          </button>
          {editingKycField && (
            <button
              type="button"
              onClick={() => {
                setEditingKycField(null);
                setKycFieldFormData({
                  label: "",
                  type: "text",
                  required: false,
                  options: [],
                  placeholder: "",
                });
              }}
              className="ml-2 px-4 py-2 bg-gray-400 text-white rounded-md hover:bg-gray-500"
            >
              Cancel Edit
            </button>
          )}
        </form>
      </div>
    </div>
  );
};

export default ContentManagementPage;
