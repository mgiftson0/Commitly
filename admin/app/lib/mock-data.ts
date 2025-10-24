import { toast } from "sonner";

export const mockStats = [
  {
    title: 'Total Users',
    value: '12,543',
    change: '+12% from last month',
    changeType: 'positive' as const,
    icon: '👥',
    color: 'blue' as const
  },
  {
    title: 'Active Goals',
    value: '8,234',
    change: '+5% from last week',
    changeType: 'positive' as const,
    icon: '🎯',
    color: 'green' as const
  },
  {
    title: 'Pending KYC',
    value: '23',
    change: '-3 from yesterday',
    changeType: 'positive' as const,
    icon: '📋',
    color: 'yellow' as const
  },
  {
    title: 'System Alerts',
    value: '2',
    change: 'Requires attention',
    changeType: 'negative' as const,
    icon: '⚠️',
    color: 'red' as const
  }
];

export const mockActivities = [
  {
    id: '1',
    type: 'user' as const,
    action: 'New User Registration',
    description: 'john.doe@example.com joined the platform',
    timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 minutes ago
    user: 'System'
  },
  {
    id: '2',
    type: 'goal' as const,
    action: 'Goal Completed',
    description: 'User completed "Learn React" goal',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
    user: 'jane.smith'
  },
  {
    id: '3',
    type: 'moderation' as const,
    action: 'Content Reported',
    description: 'Inappropriate content reported in goal comments',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(), // 4 hours ago
    user: 'moderator_alice'
  },
  {
    id: '4',
    type: 'system' as const,
    action: 'Backup Completed',
    description: 'Daily database backup completed successfully',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(), // 6 hours ago
    user: 'System'
  },
  {
    id: '5',
    type: 'user' as const,
    action: 'KYC Approved',
    description: 'KYC verification approved for new user',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString(), // 8 hours ago
    user: 'admin_user'
  }
];

export const mockQuickActions = [
  {
    id: '1',
    title: 'Add New Admin',
    description: 'Create a new administrator account',
    action: () => {
      toast.info('Add Admin feature coming soon');
    },
    icon: '👥',
    color: 'blue'
  },
  {
    id: '2',
    title: 'Review KYC',
    description: 'Review pending KYC verifications',
    action: () => {
      toast.info('KYC Review feature coming soon');
    },
    icon: '📋',
    color: 'green'
  },
  {
    id: '3',
    title: 'System Health',
    description: 'View system status and alerts',
    action: () => {
      toast.info('System Health feature coming soon');
    },
    icon: '⚡',
    color: 'yellow'
  }
];