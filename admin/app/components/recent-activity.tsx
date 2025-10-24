import React from 'react';

interface ActivityItem {
  id: string;
  type: 'user' | 'goal' | 'system' | 'moderation';
  action: string;
  description: string;
  timestamp: string;
  user?: string;
}

interface RecentActivityProps {
  activities: ActivityItem[];
  maxItems?: number;
}

const RecentActivity: React.FC<RecentActivityProps> = ({
  activities,
  maxItems = 10
}) => {
  const displayActivities = activities.slice(0, maxItems);

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'user':
        return '👤';
      case 'goal':
        return '🎯';
      case 'system':
        return '⚙️';
      case 'moderation':
        return '🛡️';
      default:
        return '📝';
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'user':
        return 'text-blue-600';
      case 'goal':
        return 'text-green-600';
      case 'system':
        return 'text-purple-600';
      case 'moderation':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <div className="bg-white shadow-md rounded-lg p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
      <div className="space-y-4">
        {displayActivities.length === 0 ? (
          <p className="text-gray-500 text-center py-4">No recent activity</p>
        ) : (
          displayActivities.map((activity) => (
            <div key={activity.id} className="flex items-start space-x-3 pb-3 border-b border-gray-100 last:border-b-0">
              <div className="text-xl">
                {getActivityIcon(activity.type)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <p className={`text-sm font-medium ${getActivityColor(activity.type)}`}>
                    {activity.action}
                  </p>
                  <p className="text-xs text-gray-500">
                    {new Date(activity.timestamp).toLocaleString()}
                  </p>
                </div>
                <p className="text-sm text-gray-600 mt-1">{activity.description}</p>
                {activity.user && (
                  <p className="text-xs text-gray-500 mt-1">by {activity.user}</p>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default RecentActivity;
