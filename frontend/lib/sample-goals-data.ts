// Sample dummy data for testing purposes
export type GoalType = 'personal' | 'group' | 'partner';

export interface SampleGoal {
  id: string;
  title: string;
  description: string;
  type: GoalType;
  progress: number;
  status: 'active' | 'completed' | 'pending';
  category: string;
  priority: 'low' | 'medium' | 'high';
  streak: number;
  createdAt: string;
  dueDate?: string;
  ownerName?: string;
  groupMembers?: number;
  isPartnerGoal?: boolean;
  color?: string; // Different colors for partner goals
}

// Group goals - collaborative goals
export const groupGoals: SampleGoal[] = [
  {
    id: "grp-001",
    title: "Team Fitness Challenge",
    description: "Weekly workout sessions and fitness tracking as a group",
    type: "group",
    progress: 65,
    status: "active",
    category: "Health & Fitness",
    priority: "high",
    streak: 12,
    createdAt: "2024-01-15",
    dueDate: "2024-03-15",
    ownerName: "Alex Team",
    groupMembers: 5,
    isPartnerGoal: false,
    color: "#3b82f6" // Blue for group goals
  },
  {
    id: "grp-002",
    title: "Book Club Reading Challenge",
    description: "Read and discuss one chapter per week together",
    type: "group",
    progress: 40,
    status: "active",
    category: "Learning",
    priority: "medium",
    streak: 8,
    createdAt: "2024-02-01",
    dueDate: "2024-04-01",
    ownerName: "Sarah Reader",
    groupMembers: 3,
    isPartnerGoal: false,
    color: "#8b5cf6" // Purple for group goals
  },
  {
    id: "grp-003",
    title: "Startup Launch Team",
    description: "Collaborate on building and launching our app",
    type: "group",
    progress: 85,
    status: "active",
    category: "Career",
    priority: "high",
    streak: 15,
    createdAt: "2024-01-01",
    dueDate: "2024-06-01",
    ownerName: "Mike Founder",
    groupMembers: 4,
    isPartnerGoal: false,
    color: "#10b981" // Green for group goals
  },
  {
    id: "grp-004",
    title: "Meditation Group",
    description: "Daily mindfulness practice and sharing insights",
    type: "group",
    progress: 100,
    status: "completed",
    category: "Personal",
    priority: "medium",
    streak: 30,
    createdAt: "2024-01-10",
    dueDate: "2024-02-10",
    ownerName: "Emma Peace",
    groupMembers: 6,
    isPartnerGoal: false,
    color: "#f59e0b" // Amber for group goals
  }
];

// Partner goals - goals with accountability partners (different colors)
export const partnerGoals: SampleGoal[] = [
  {
    id: "part-001",
    title: "Running Partner Challenge",
    description: "Run 5k together 3 times per week",
    type: "partner",
    progress: 72,
    status: "active",
    category: "Health & Fitness",
    priority: "high",
    streak: 9,
    createdAt: "2024-02-01",
    dueDate: "2024-04-01",
    ownerName: "You",
    groupMembers: 2,
    isPartnerGoal: true,
    color: "#dc2626" // Red for partner goals
  },
  {
    id: "part-002",
    title: "Language Learning Tandem",
    description: "Practice Spanish conversation for 30 minutes daily",
    type: "partner",
    progress: 45,
    status: "active",
    category: "Learning",
    priority: "medium",
    streak: 6,
    createdAt: "2024-02-15",
    dueDate: "2024-05-15",
    ownerName: "Your Partner",
    groupMembers: 2,
    isPartnerGoal: true,
    color: "#ea580c" // Orange for partner goals
  },
  {
    id: "part-003",
    title: "Career Networking Goals",
    description: "Attend 2 networking events together per month",
    type: "partner",
    progress: 25,
    status: "active",
    category: "Career",
    priority: "medium",
    streak: 2,
    createdAt: "2024-03-01",
    dueDate: "2024-06-01",
    ownerName: "You",
    groupMembers: 2,
    isPartnerGoal: true,
    color: "#7c3aed" // Violet for partner goals
  },
  {
    id: "part-004",
    title: "Financial Planning Partnership",
    description: "Save $500 each and review progress weekly",
    type: "partner",
    progress: 90,
    status: "active",
    category: "Personal",
    priority: "high",
    streak: 11,
    createdAt: "2024-01-20",
    dueDate: "2024-04-20",
    ownerName: "Your Partner",
    groupMembers: 2,
    isPartnerGoal: true,
    color: "#0891b2" // Cyan for partner goals
  },
  {
    id: "part-005",
    title: "Photography Skills Development",
    description: "Complete photography course and practice weekly",
    type: "partner",
    progress: 100,
    status: "completed",
    category: "Learning",
    priority: "medium",
    streak: 14,
    createdAt: "2024-01-05",
    dueDate: "2024-03-05",
    ownerName: "You",
    groupMembers: 2,
    isPartnerGoal: true,
    color: "#be185d" // Pink for partner goals
  }
];

// Combined goals for easy access
export const allSampleGoals = [...groupGoals, ...partnerGoals];

// Helper functions for filtering
export const getActiveGoals = (goals: SampleGoal[]) =>
  goals.filter(goal => goal.status === 'active');

export const getCompletedGoals = (goals: SampleGoal[]) =>
  goals.filter(goal => goal.status === 'completed');

export const getGroupGoals = (goals: SampleGoal[]) =>
  goals.filter(goal => goal.type === 'group');

export const getPartnerGoals = (goals: SampleGoal[]) =>
  goals.filter(goal => goal.type === 'partner');

// Color utilities for partner goals
export const getPartnerGoalColor = (index: number): string => {
  const partnerColors = [
    "#dc2626", // Red
    "#ea580c", // Orange
    "#7c3aed", // Violet
    "#0891b2", // Cyan
    "#be185d", // Pink
    "#059669", // Emerald
    "#d97706", // Amber
    "#7c2d12"  // Brown
  ];
  return partnerColors[index % partnerColors.length];
};

export const getGroupGoalColor = (index: number): string => {
  const groupColors = [
    "#3b82f6", // Blue
    "#8b5cf6", // Purple
    "#10b981", // Green
    "#f59e0b", // Amber
    "#06b6d4", // Sky
    "#84cc16", // Lime
    "#6366f1", // Indigo
    "#ec4899"  // Rose
  ];
  return groupColors[index % groupColors.length];
};
