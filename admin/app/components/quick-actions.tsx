"use client";

import React from 'react';

interface QuickAction {
  id: string;
  title: string;
  description: string;
  action: () => void;
  icon: React.ReactNode;
  color?: string;
}

interface QuickActionsProps {
  actions: QuickAction[];
}

const QuickActions: React.FC<QuickActionsProps> = ({ actions }) => {
  const colorClasses = {
    blue: 'bg-blue-50 border-blue-200 hover:bg-blue-100',
    green: 'bg-green-50 border-green-200 hover:bg-green-100',
    purple: 'bg-purple-50 border-purple-200 hover:bg-purple-100',
    red: 'bg-red-50 border-red-200 hover:bg-red-100',
    yellow: 'bg-yellow-50 border-yellow-200 hover:bg-yellow-100',
    indigo: 'bg-indigo-50 border-indigo-200 hover:bg-indigo-100',
    pink: 'bg-pink-50 border-pink-200 hover:bg-pink-100',
    gray: 'bg-gray-50 border-gray-200 hover:bg-gray-100'
  };

  const buttonClasses = {
    blue: 'bg-blue-600 hover:bg-blue-700',
    green: 'bg-green-600 hover:bg-green-700',
    purple: 'bg-purple-600 hover:bg-purple-700',
    red: 'bg-red-600 hover:bg-red-700',
    yellow: 'bg-yellow-600 hover:bg-yellow-700',
    indigo: 'bg-indigo-600 hover:bg-indigo-700',
    pink: 'bg-pink-600 hover:bg-pink-700',
    gray: 'bg-gray-600 hover:bg-gray-700'
  };

  return (
    <div className="bg-white shadow-md rounded-lg p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {actions.map((action) => (
          <button
            key={action.id}
            onClick={action.action}
            className={`border rounded-lg p-4 text-left transition-colors duration-200 ${colorClasses[action.color as keyof typeof colorClasses] || colorClasses.blue}`}
          >
            <div className="flex items-start space-x-3">
              <div className="text-2xl">
                {action.icon}
              </div>
              <div className="flex-1">
                <h4 className="font-medium text-gray-900">{action.title}</h4>
                <p className="text-sm text-gray-600 mt-1">{action.description}</p>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default QuickActions;
