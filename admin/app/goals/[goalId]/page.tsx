"use client";

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';

interface Goal {
  id: string;
  title: string;
  description: string;
  type: 'individual' | 'patterned';
  status: 'active' | 'completed' | 'suspended' | 'archived' | 'uncompleted';
  ownerId: string;
  ownerUsername: string;
  startDate: string; // ISO date string
  endDate: string; // ISO date string
  completionDate?: string; // ISO date string
  progress: number; // 0-100
  milestones: { id: string; description: string; completed: boolean }[];
  accountabilityPartners: { id: string; username: string }[];
  flags: { reason: string; timestamp: string }[];
}

const mockGoals: Goal[] = [
  {
    id: 'goal_001',
    title: 'Learn Next.js Deeply',
    description: 'Master Next.js features including App Router, Server Components, and data fetching strategies.',
    type: 'individual',
    status: 'active',
    ownerId: 'usr_001',
    ownerUsername: 'john.doe',
    startDate: '2023-10-01T00:00:00Z',
    endDate: '2023-12-31T23:59:59Z',
    progress: 75,
    milestones: [
      { id: 'm001', description: 'Complete App Router tutorial', completed: true },
      { id: 'm002', description: 'Implement server components', completed: true },
      { id: 'm003', description: 'Build a full CRUD app', completed: false },
    ],
    accountabilityPartners: [{ id: 'usr_002', username: 'jane.smith' }],
    flags: [],
  },
  {
    id: 'goal_002',
    title: 'Run a Marathon',
    description: 'Train consistently for 12 weeks and complete a full marathon.',
    type: 'individual',
    status: 'suspended',
    ownerId: 'usr_002',
    ownerUsername: 'jane.smith',
    startDate: '2023-09-01T00:00:00Z',
    endDate: '2023-11-30T23:59:59Z',
    progress: 30,
    milestones: [
      { id: 'm004', description: 'Complete week 4 training plan', completed: true },
      { id: 'm005', description: 'Complete week 8 training plan', completed: false },
      { id: 'm006', description: 'Register for marathon', completed: true },
    ],
    accountabilityPartners: [],
    flags: [{ reason: 'User account suspended', timestamp: '2023-10-23T09:00:00Z' }],
  },
  {
    id: 'goal_003',
    title: 'Daily Meditation',
    description: 'Meditate for 15 minutes every day for 30 days.',
    type: 'patterned',
    status: 'active',
    ownerId: 'usr_005',
    ownerUsername: 'bob_goalie',
    startDate: '2023-10-20T00:00:00Z',
    endDate: '2023-11-19T23:59:59Z',
    progress: 20,
    milestones: [],
    accountabilityPartners: [],
    flags: [],
  },
];

const GoalDetailPage = () => {
  const router = useRouter();
  const params = useParams();
  const goalId = params.goalId as string;

  const [goal, setGoal] = useState<Goal | null>(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState<Partial<Goal>>({});

  useEffect(() => {
    // In a real app, fetch goal data from an API based on goalId
    const fetchedGoal = mockGoals.find((g) => g.id === goalId);
    if (fetchedGoal) {
      setGoal(fetchedGoal);
      setFormData(fetchedGoal); // Initialize form data with current goal data
    } else {
      console.error('Goal not found');
      // router.push('/admin/goals'); // Redirect example
    }
    setLoading(false);
  }, [goalId]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleDateChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    // In a real app, send formData to an API to update the goal
    console.log('Saving goal data:', formData);
    if (goal) {
      setGoal((prevGoal) => ({ ...prevGoal!, ...formData }));
    }
    setEditMode(false);
    alert('Goal data updated (mock)');
  };

  const handleDeleteGoal = () => {
    if (confirm(`Are you sure you want to delete goal "${goal?.title}"? This action cannot be undone.`)) {
      // In a real app, send delete request to API
      console.log(`Deleting goal ${goal?.id}`);
      alert(`Goal "${goal?.title}" deleted (mock)`);
      router.push('/admin/goals'); // Redirect after deletion
    }
  };

  const handleStatusChange = (newStatus: 'active' | 'completed' | 'suspended' | 'archived' | 'uncompleted') => {
    if (!goal) return;
    setFormData((prev) => ({ ...prev, status: newStatus }));
    setGoal((prev) => ({ ...prev!, status: newStatus }));
    alert(`Goal status changed to ${newStatus} for "${goal.title}" (mock)`);
  };

  const handleMilestoneToggle = (milestoneId: string) => {
    if (!goal) return;
    const updatedMilestones = (formData.milestones || goal.milestones).map(m =>
      m.id === milestoneId ? { ...m, completed: !m.completed } : m
    );
    setFormData((prev) => ({ ...prev!, milestones: updatedMilestones }));
    setGoal((prev) => ({ ...prev!, milestones: updatedMilestones }));
    alert('Milestone status toggled (mock)');
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p className="text-lg text-gray-700">Loading goal data...</p>
      </div>
    );
  }

  if (!goal) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p className="text-lg text-red-600">Goal not found.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <header className="bg-white shadow p-4 rounded-lg mb-6 flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Goal Details: {goal.title}</h1>
        <div>
          {editMode ? (
            <>
              <button
                onClick={handleSave}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 mr-2"
              >
                Save Changes
              </button>
              <button
                onClick={() => {
                  setEditMode(false);
                  setFormData(goal); // Revert changes if cancelled
                }}
                className="px-4 py-2 bg-gray-400 text-white rounded-md hover:bg-gray-500"
              >
                Cancel
              </button>
            </>
          ) : (
            <button
              onClick={() => setEditMode(true)}
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
            >
              Edit Goal
            </button>
          )}
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Goal Information */}
        <div className="lg:col-span-2 bg-white shadow-md rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Goal Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700">Title</label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title || ''}
                onChange={handleInputChange}
                readOnly={!editMode}
                className={`mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 ${!editMode ? 'bg-gray-50' : ''}`}
              />
            </div>
            <div>
              <label htmlFor="ownerUsername" className="block text-sm font-medium text-gray-700">Owner</label>
              <input
                type="text"
                id="ownerUsername"
                name="ownerUsername"
                value={goal.ownerUsername}
                readOnly
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 bg-gray-50"
              />
            </div>
            <div className="md:col-span-2">
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
              <textarea
                id="description"
                name="description"
                rows={3}
                value={formData.description || ''}
                onChange={handleInputChange}
                readOnly={!editMode}
                className={`mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 ${!editMode ? 'bg-gray-50' : ''}`}
              ></textarea>
            </div>
            <div>
              <label htmlFor="type" className="block text-sm font-medium text-gray-700">Goal Type</label>
              <select
                id="type"
                name="type"
                value={formData.type || 'individual'}
                onChange={handleInputChange}
                disabled={!editMode}
                className={`mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 ${!editMode ? 'bg-gray-50' : ''}`}
              >
                <option value="individual">Individual</option>
                <option value="patterned">Patterned</option>
              </select>
            </div>
            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-700">Status</label>
              <select
                id="status"
                name="status"
                value={formData.status || 'active'}
                onChange={handleInputChange}
                disabled={!editMode}
                className={`mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 ${!editMode ? 'bg-gray-50' : ''}`}
              >
                <option value="active">Active</option>
                <option value="completed">Completed</option>
                <option value="suspended">Suspended</option>
                <option value="archived">Archived</option>
                <option value="uncompleted">Uncompleted</option>
              </select>
            </div>
            <div>
              <label htmlFor="startDate" className="block text-sm font-medium text-gray-700">Start Date</label>
              <input
                type="date"
                id="startDate"
                name="startDate"
                value={formData.startDate ? formData.startDate.split('T')[0] : ''}
                onChange={(e) => handleDateChange('startDate', e.target.value + 'T00:00:00Z')}
                readOnly={!editMode}
                className={`mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 ${!editMode ? 'bg-gray-50' : ''}`}
              />
            </div>
            <div>
              <label htmlFor="endDate" className="block text-sm font-medium text-gray-700">End Date</label>
              <input
                type="date"
                id="endDate"
                name="endDate"
                value={formData.endDate ? formData.endDate.split('T')[0] : ''}
                onChange={(e) => handleDateChange('endDate', e.target.value + 'T23:59:59Z')}
                readOnly={!editMode}
                className={`mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 ${!editMode ? 'bg-gray-50' : ''}`}
              />
            </div>
            <div>
              <label htmlFor="progress" className="block text-sm font-medium text-gray-700">Progress (%)</label>
              <input
                type="number"
                id="progress"
                name="progress"
                value={formData.progress || 0}
                onChange={handleInputChange}
                readOnly={!editMode}
                min="0"
                max="100"
                className={`mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 ${!editMode ? 'bg-gray-50' : ''}`}
              />
            </div>
            {goal.completionDate && (
              <div>
                <label htmlFor="completionDate" className="block text-sm font-medium text-gray-700">Completion Date</label>
                <input
                  type="text"
                  id="completionDate"
                  name="completionDate"
                  value={new Date(goal.completionDate).toLocaleString()}
                  readOnly
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 bg-gray-50"
                />
              </div>
            )}
          </div>
        </div>

        {/* Goal Actions */}
        <div className="bg-white shadow-md rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Goal Actions</h2>
          <div className="space-y-4">
            {goal.status !== 'completed' && (
              <button
                onClick={() => handleStatusChange('completed')}
                className="w-full px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
              >
                Mark as Completed
              </button>
            )}
            {goal.status === 'completed' && (
              <button
                onClick={() => handleStatusChange('uncompleted')}
                className="w-full px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700"
              >
                Mark as Uncompleted
              </button>
            )}
            {goal.status !== 'suspended' ? (
              <button
                onClick={() => handleStatusChange('suspended')}
                className="w-full px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700"
              >
                Suspend Goal
              </button>
            ) : (
              <button
                onClick={() => handleStatusChange('active')}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Reactivate Goal
              </button>
            )}
            <button
              onClick={() => handleStatusChange('archived')}
              className="w-full px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
            >
              Archive Goal
            </button>
            <button
              onClick={handleDeleteGoal}
              className="w-full px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
            >
              Delete Goal
            </button>
          </div>
        </div>

        {/* Milestones */}
        <div className="lg:col-span-1 bg-white shadow-md rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Milestones</h2>
          {(formData.milestones || goal.milestones).length > 0 ? (
            <ul className="space-y-2">
              {(formData.milestones || goal.milestones).map((milestone) => (
                <li key={milestone.id} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={milestone.completed}
                    onChange={() => editMode && handleMilestoneToggle(milestone.id)}
                    disabled={!editMode}
                    className="mr-2"
                  />
                  <span className={`${milestone.completed ? 'line-through text-gray-500' : 'text-gray-700'}`}>
                    {milestone.description}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-600">No milestones for this goal.</p>
          )}
          {editMode && (
            <button className="mt-4 px-3 py-1 bg-blue-500 text-white rounded-md text-sm hover:bg-blue-600">
              Add Milestone
            </button>
          )}
        </div>

        {/* Accountability Partners */}
        <div className="lg:col-span-1 bg-white shadow-md rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Accountability Partners</h2>
          {goal.accountabilityPartners.length > 0 ? (
            <ul className="space-y-2">
              {goal.accountabilityPartners.map((partner) => (
                <li key={partner.id} className="text-gray-700">
                  <Link href={`/admin/users/${partner.id}`} className="text-blue-600 hover:underline">
                    {partner.username}
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-600">No accountability partners assigned.</p>
          )}
          {editMode && (
            <button className="mt-4 px-3 py-1 bg-blue-500 text-white rounded-md text-sm hover:bg-blue-600">
              Manage Partners
            </button>
          )}
        </div>

        {/* Flags/Reports */}
        <div className="lg:col-span-full bg-white shadow-md rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Flags & Reports</h2>
          {goal.flags && goal.flags.length > 0 ? (
            <ul className="divide-y divide-gray-200">
              {goal.flags.map((flag, index) => (
                <li key={index} className="py-2 text-sm text-red-700">
                  <span className="font-medium text-gray-900">{new Date(flag.timestamp).toLocaleString()}:</span> {flag.reason}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-600">No flags or reports for this goal.</p>
          )}
          {editMode && (
            <button className="mt-4 px-3 py-1 bg-red-500 text-white rounded-md text-sm hover:bg-red-600">
              Add Flag / Resolve
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default GoalDetailPage;
