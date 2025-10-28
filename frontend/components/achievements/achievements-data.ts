export const ACHIEVEMENTS_DATA = [
  // Goal Creation Achievements (10 achievements)
  {
    id: "first-goal",
    title: "Getting Started",
    description: "Create your first goal",
    rarity: "common",
    category: "goals",
    total: 1,
    progress: 1,
    unlocked: true
  },
  {
    id: "five-goals",
    title: "Goal Setter",
    description: "Create 5 goals",
    rarity: "common",
    category: "goals",
    total: 5,
    progress: 3,
    unlocked: false
  },
  {
    id: "ten-goals",
    title: "Aspiring Achiever",
    description: "Create 10 goals",
    rarity: "rare",
    category: "goals",
    total: 10,
    progress: 7,
    unlocked: false
  },
  {
    id: "twenty-five-goals",
    title: "Goal Master",
    description: "Create 25 goals",
    rarity: "epic",
    category: "goals",
    total: 25,
    progress: 12,
    unlocked: false
  },
  {
    id: "fifty-goals",
    title: "Goal Legend",
    description: "Create 50 goals",
    rarity: "legendary",
    category: "goals",
    total: 50,
    progress: 18,
    unlocked: false
  },
  {
    id: "health-goal",
    title: "Health Focus",
    description: "Create a health & fitness goal",
    rarity: "common",
    category: "goals",
    total: 1,
    progress: 1,
    unlocked: true
  },
  {
    id: "learning-goal",
    title: "Knowledge Seeker",
    description: "Create a learning goal",
    rarity: "common",
    category: "goals",
    total: 1,
    progress: 0,
    unlocked: false
  },
  {
    id: "career-goal",
    title: "Career Climber",
    description: "Create a career goal",
    rarity: "rare",
    category: "goals",
    total: 1,
    progress: 0,
    unlocked: false
  },
  {
    id: "personal-goal",
    title: "Self Improver",
    description: "Create a personal development goal",
    rarity: "rare",
    category: "goals",
    total: 1,
    progress: 1,
    unlocked: true
  },
  {
    id: "seasonal-goal",
    title: "Seasonal Spirit",
    description: "Create a seasonal goal",
    rarity: "epic",
    category: "goals",
    total: 1,
    progress: 0,
    unlocked: false
  },

  // Goal Completion Achievements (15 achievements)
  {
    id: "first-complete",
    title: "First Victory",
    description: "Complete your first goal",
    rarity: "common",
    category: "completion",
    total: 1,
    progress: 1,
    unlocked: true
  },
  {
    id: "three-complete",
    title: "Triple Winner",
    description: "Complete 3 goals",
    rarity: "common",
    category: "completion",
    total: 3,
    progress: 2,
    unlocked: false
  },
  {
    id: "ten-complete",
    title: "Completionist",
    description: "Complete 10 goals",
    rarity: "rare",
    category: "completion",
    total: 10,
    progress: 6,
    unlocked: false
  },
  {
    id: "twenty-five-complete",
    title: "Goal Crusher",
    description: "Complete 25 goals",
    rarity: "epic",
    category: "completion",
    total: 25,
    progress: 11,
    unlocked: false
  },
  {
    id: "fifty-complete",
    title: "Master Achiever",
    description: "Complete 50 goals",
    rarity: "legendary",
    category: "completion",
    total: 50,
    progress: 15,
    unlocked: false
  },
  {
    id: "health-complete",
    title: "Fit & Healthy",
    description: "Complete a health goal",
    rarity: "rare",
    category: "completion",
    total: 1,
    progress: 0,
    unlocked: false
  },
  {
    id: "learning-complete",
    title: "Wise One",
    description: "Complete a learning goal",
    rarity: "rare",
    category: "completion",
    total: 1,
    progress: 0,
    unlocked: false
  },
  {
    id: "career-complete",
    title: "Career Success",
    description: "Complete a career goal",
    rarity: "epic",
    category: "completion",
    total: 1,
    progress: 0,
    unlocked: false
  },
  {
    id: "personal-complete",
    title: "Personal Growth",
    description: "Complete a personal goal",
    rarity: "epic",
    category: "completion",
    total: 1,
    progress: 1,
    unlocked: true
  },
  {
    id: "seasonal-complete",
    title: "Season Champion",
    description: "Complete a seasonal goal",
    rarity: "legendary",
    category: "completion",
    total: 1,
    progress: 0,
    unlocked: false
  },
  {
    id: "perfect-week",
    title: "Perfect Week",
    description: "Complete all goals in a week",
    rarity: "epic",
    category: "completion",
    total: 1,
    progress: 0,
    unlocked: false
  },
  {
    id: "monthly-master",
    title: "Monthly Master",
    description: "Complete 10 goals in one month",
    rarity: "legendary",
    category: "completion",
    total: 10,
    progress: 3,
    unlocked: false
  },
  {
    id: "speed-demon",
    title: "Speed Demon",
    description: "Complete a goal in under 24 hours",
    rarity: "rare",
    category: "completion",
    total: 1,
    progress: 0,
    unlocked: false
  },
  {
    id: "overachiever",
    title: "Overachiever",
    description: "Complete 5 goals in one day",
    rarity: "epic",
    category: "completion",
    total: 5,
    progress: 1,
    unlocked: false
  },
  {
    id: "persistent",
    title: "Persistent",
    description: "Complete a goal that took over 30 days",
    rarity: "epic",
    category: "completion",
    total: 1,
    progress: 0,
    unlocked: false
  },

  // Streak Achievements (15 achievements)
  {
    id: "first-streak",
    title: "Streak Starter",
    description: "Maintain a 3-day streak",
    rarity: "common",
    category: "streaks",
    total: 3,
    progress: 3,
    unlocked: true
  },
  {
    id: "week-streak",
    title: "Week Warrior",
    description: "Maintain a 7-day streak",
    rarity: "rare",
    category: "streaks",
    total: 7,
    progress: 5,
    unlocked: false
  },
  {
    id: "two-week-streak",
    title: "Two Week Champion",
    description: "Maintain a 14-day streak",
    rarity: "epic",
    category: "streaks",
    total: 14,
    progress: 8,
    unlocked: false
  },
  {
    id: "month-streak",
    title: "Monthly Monarch",
    description: "Maintain a 30-day streak",
    rarity: "legendary",
    category: "streaks",
    total: 30,
    progress: 12,
    unlocked: false
  },
  {
    id: "sixty-day-streak",
    title: "Streak Legend",
    description: "Maintain a 60-day streak",
    rarity: "legendary",
    category: "streaks",
    total: 60,
    progress: 25,
    unlocked: false
  },
  {
    id: "hundred-day-streak",
    title: "Century Champion",
    description: "Maintain a 100-day streak",
    rarity: "legendary",
    category: "streaks",
    total: 100,
    progress: 45,
    unlocked: false
  },
  {
    id: "streak-breaker",
    title: "Streak Breaker",
    description: "Break your longest streak and start over",
    rarity: "rare",
    category: "streaks",
    total: 1,
    progress: 0,
    unlocked: false
  },
  {
    id: "comeback-kid",
    title: "Comeback Kid",
    description: "Start a new streak after breaking one",
    rarity: "epic",
    category: "streaks",
    total: 1,
    progress: 0,
    unlocked: false
  },
  {
    id: "multi-streak",
    title: "Multi-Tasker",
    description: "Maintain streaks on 3 different goals",
    rarity: "epic",
    category: "streaks",
    total: 3,
    progress: 1,
    unlocked: false
  },
  {
    id: "streak-master",
    title: "Streak Master",
    description: "Maintain streaks on 5 different goals",
    rarity: "legendary",
    category: "streaks",
    total: 5,
    progress: 2,
    unlocked: false
  },
  {
    id: "perfect-month",
    title: "Perfect Month",
    description: "Maintain streak for entire month",
    rarity: "epic",
    category: "streaks",
    total: 30,
    progress: 15,
    unlocked: false
  },
  {
    id: "year-long",
    title: "Year Long",
    description: "Maintain a 365-day streak",
    rarity: "legendary",
    category: "streaks",
    total: 365,
    progress: 89,
    unlocked: false
  },
  {
    id: "early-bird",
    title: "Early Bird",
    description: "Complete goals before 8 AM for 7 days",
    rarity: "rare",
    category: "streaks",
    total: 7,
    progress: 3,
    unlocked: false
  },
  {
    id: "night-owl",
    title: "Night Owl",
    description: "Complete goals after 10 PM for 7 days",
    rarity: "rare",
    category: "streaks",
    total: 7,
    progress: 2,
    unlocked: false
  },
  {
    id: "consistent",
    title: "Consistent",
    description: "Complete goals every day for 3 months",
    rarity: "legendary",
    category: "streaks",
    total: 90,
    progress: 28,
    unlocked: false
  },

  // Social Achievements (15 achievements)
  {
    id: "first-partner",
    title: "Team Player",
    description: "Add your first accountability partner",
    rarity: "common",
    category: "social",
    total: 1,
    progress: 1,
    unlocked: true
  },
  {
    id: "three-partners",
    title: "Social Butterfly",
    description: "Add 3 accountability partners",
    rarity: "rare",
    category: "social",
    total: 3,
    progress: 2,
    unlocked: false
  },
  {
    id: "five-partners",
    title: "Network Builder",
    description: "Add 5 accountability partners",
    rarity: "epic",
    category: "social",
    total: 5,
    progress: 2,
    unlocked: false
  },
  {
    id: "ten-partners",
    title: "Community Leader",
    description: "Add 10 accountability partners",
    rarity: "legendary",
    category: "social",
    total: 10,
    progress: 3,
    unlocked: false
  },
  {
    id: "first-encouragement",
    title: "Encourager",
    description: "Send your first encouragement message",
    rarity: "common",
    category: "social",
    total: 1,
    progress: 1,
    unlocked: true
  },
  {
    id: "encouragement-giver",
    title: "Motivator",
    description: "Send 10 encouragement messages",
    rarity: "rare",
    category: "social",
    total: 10,
    progress: 7,
    unlocked: false
  },
  {
    id: "encouragement-hero",
    title: "Inspiration Hero",
    description: "Send 50 encouragement messages",
    rarity: "epic",
    category: "social",
    total: 50,
    progress: 23,
    unlocked: false
  },
  {
    id: "received-encouragement",
    title: "Well Supported",
    description: "Receive 5 encouragement messages",
    rarity: "common",
    category: "social",
    total: 5,
    progress: 4,
    unlocked: false
  },
  {
    id: "encouragement-receiver",
    title: "Motivated",
    description: "Receive 25 encouragement messages",
    rarity: "rare",
    category: "social",
    total: 25,
    progress: 12,
    unlocked: false
  },
  {
    id: "community-champion",
    title: "Community Champion",
    description: "Receive 100 encouragement messages",
    rarity: "legendary",
    category: "social",
    total: 100,
    progress: 45,
    unlocked: false
  },
  {
    id: "mutual-support",
    title: "Mutual Support",
    description: "Exchange encouragement with same partner 10 times",
    rarity: "epic",
    category: "social",
    total: 10,
    progress: 4,
    unlocked: false
  },
  {
    id: "group-motivator",
    title: "Group Motivator",
    description: "Send encouragement to 5 different partners",
    rarity: "epic",
    category: "social",
    total: 5,
    progress: 3,
    unlocked: false
  },
  {
    id: "thankful",
    title: "Thankful",
    description: "React to 10 encouragement messages",
    rarity: "rare",
    category: "social",
    total: 10,
    progress: 6,
    unlocked: false
  },
  {
    id: "popular",
    title: "Popular",
    description: "Receive reactions on 20 messages",
    rarity: "epic",
    category: "social",
    total: 20,
    progress: 8,
    unlocked: false
  },
  {
    id: "social-star",
    title: "Social Star",
    description: "Be active in the community for 30 days",
    rarity: "legendary",
    category: "social",
    total: 30,
    progress: 12,
    unlocked: false
  },

  // Progress Achievements (10 achievements)
  {
    id: "progress-maker",
    title: "Progress Maker",
    description: "Update progress on 10 different goals",
    rarity: "common",
    category: "progress",
    total: 10,
    progress: 8,
    unlocked: false
  },
  {
    id: "halfway-hero",
    title: "Halfway Hero",
    description: "Reach 50% progress on 5 goals",
    rarity: "rare",
    category: "progress",
    total: 5,
    progress: 3,
    unlocked: false
  },
  {
    id: "three-quarters",
    title: "Three Quarters",
    description: "Reach 75% progress on 3 goals",
    rarity: "epic",
    category: "progress",
    total: 3,
    progress: 1,
    unlocked: false
  },
  {
    id: "near-perfect",
    title: "Near Perfect",
    description: "Reach 90% progress on a goal",
    rarity: "epic",
    category: "progress",
    total: 1,
    progress: 0,
    unlocked: false
  },
  {
    id: "progress-tracker",
    title: "Progress Tracker",
    description: "Update progress daily for 7 days",
    rarity: "rare",
    category: "progress",
    total: 7,
    progress: 4,
    unlocked: false
  },
  {
    id: "steady-climber",
    title: "Steady Climber",
    description: "Make progress on goals for 30 consecutive days",
    rarity: "epic",
    category: "progress",
    total: 30,
    progress: 18,
    unlocked: false
  },
  {
    id: "quantitative",
    title: "Quantitative",
    description: "Set measurable goals with specific numbers",
    rarity: "common",
    category: "progress",
    total: 5,
    progress: 3,
    unlocked: false
  },
  {
    id: "qualitative",
    title: "Qualitative",
    description: "Set goals with quality-based measurements",
    rarity: "common",
    category: "progress",
    total: 3,
    progress: 2,
    unlocked: false
  },
  {
    id: "milestone-master",
    title: "Milestone Master",
    description: "Reach 10 different milestone achievements",
    rarity: "legendary",
    category: "progress",
    total: 10,
    progress: 4,
    unlocked: false
  },
  {
    id: "progress-champion",
    title: "Progress Champion",
    description: "Make measurable progress for 100 days",
    rarity: "legendary",
    category: "progress",
    total: 100,
    progress: 67,
    unlocked: false
  },

  // Special Achievements (15 achievements)
  {
    id: "early-adopter",
    title: "Early Adopter",
    description: "Use the app within the first week of joining",
    rarity: "rare",
    category: "special",
    total: 1,
    progress: 1,
    unlocked: true
  },
  {
    id: "dedicated",
    title: "Dedicated",
    description: "Log in every day for a week",
    rarity: "common",
    category: "special",
    total: 7,
    progress: 5,
    unlocked: false
  },
  {
    id: "loyal",
    title: "Loyal User",
    description: "Use the app for 30 days",
    rarity: "rare",
    category: "special",
    total: 30,
    progress: 18,
    unlocked: false
  },
  {
    id: "veteran",
    title: "Veteran",
    description: "Use the app for 100 days",
    rarity: "epic",
    category: "special",
    total: 100,
    progress: 45,
    unlocked: false
  },
  {
    id: "centurion",
    title: "Centurion",
    description: "Use the app for 100 days consecutively",
    rarity: "legendary",
    category: "special",
    total: 100,
    progress: 67,
    unlocked: false
  },
  {
    id: "explorer",
    title: "Explorer",
    description: "Try all features of the app",
    rarity: "epic",
    category: "special",
    total: 1,
    progress: 0,
    unlocked: false
  },
  {
    id: "customizer",
    title: "Customizer",
    description: "Customize your profile and settings",
    rarity: "common",
    category: "special",
    total: 1,
    progress: 1,
    unlocked: true
  },
  {
    id: "data-driven",
    title: "Data Driven",
    description: "View analytics and insights 10 times",
    rarity: "rare",
    category: "special",
    total: 10,
    progress: 6,
    unlocked: false
  },
  {
    id: "goal-planner",
    title: "Goal Planner",
    description: "Set goals for the next 3 months",
    rarity: "epic",
    category: "special",
    total: 3,
    progress: 1,
    unlocked: false
  },
  {
    id: "reflection",
    title: "Reflective",
    description: "Review and reflect on completed goals weekly",
    rarity: "rare",
    category: "special",
    total: 4,
    progress: 2,
    unlocked: false
  },
  {
    id: "inspirational",
    title: "Inspirational",
    description: "Share your success story",
    rarity: "epic",
    category: "special",
    total: 1,
    progress: 0,
    unlocked: false
  },
  {
    id: "mentor",
    title: "Mentor",
    description: "Help 3 new users get started",
    rarity: "legendary",
    category: "special",
    total: 3,
    progress: 1,
    unlocked: false
  },
  {
    id: "feedback-giver",
    title: "Feedback Guru",
    description: "Provide feedback and suggestions",
    rarity: "rare",
    category: "special",
    total: 5,
    progress: 2,
    unlocked: false
  },
  {
    id: "beta-tester",
    title: "Beta Tester",
    description: "Participate in beta testing",
    rarity: "epic",
    category: "special",
    total: 1,
    progress: 0,
    unlocked: false
  },
  {
    id: "ultimate-achiever",
    title: "Ultimate Achiever",
    description: "Unlock all other achievements",
    rarity: "legendary",
    category: "special",
    total: 99,
    progress: 15,
    unlocked: false
  },

  // Seasonal Achievements (10 achievements)
  {
    id: "winter-warrior",
    title: "Winter Warrior",
    description: "Complete goals during winter season",
    rarity: "rare",
    category: "seasonal",
    total: 5,
    progress: 2,
    unlocked: false
  },
  {
    id: "spring-bloomer",
    title: "Spring Bloomer",
    description: "Complete goals during spring season",
    rarity: "rare",
    category: "seasonal",
    total: 5,
    progress: 1,
    unlocked: false
  },
  {
    id: "summer-champion",
    title: "Summer Champion",
    description: "Complete goals during summer season",
    rarity: "rare",
    category: "seasonal",
    total: 5,
    progress: 0,
    unlocked: false
  },
  {
    id: "fall-harvester",
    title: "Fall Harvester",
    description: "Complete goals during fall season",
    rarity: "rare",
    category: "seasonal",
    total: 5,
    progress: 3,
    unlocked: false
  },
  {
    id: "new-year-resolver",
    title: "New Year Resolver",
    description: "Set and complete New Year's resolutions",
    rarity: "epic",
    category: "seasonal",
    total: 3,
    progress: 1,
    unlocked: false
  },
  {
    id: "summer-body",
    title: "Summer Body",
    description: "Complete fitness goals in summer",
    rarity: "epic",
    category: "seasonal",
    total: 10,
    progress: 4,
    unlocked: false
  },
  {
    id: "back-to-school",
    title: "Back to School",
    description: "Complete learning goals at start of school year",
    rarity: "epic",
    category: "seasonal",
    total: 5,
    progress: 2,
    unlocked: false
  },
  {
    id: "holiday-spirit",
    title: "Holiday Spirit",
    description: "Complete goals during holiday season",
    rarity: "legendary",
    category: "seasonal",
    total: 10,
    progress: 3,
    unlocked: false
  },
  {
    id: "season-changer",
    title: "Season Changer",
    description: "Complete goals across all four seasons",
    rarity: "legendary",
    category: "seasonal",
    total: 4,
    progress: 2,
    unlocked: false
  },
  {
    id: "timely",
    title: "Timely",
    description: "Complete seasonal goals before season ends",
    rarity: "epic",
    category: "seasonal",
    total: 3,
    progress: 1,
    unlocked: false
  },

  // Time-based Achievements (10 achievements)
  {
    id: "morning-person",
    title: "Morning Person",
    description: "Complete goals before 9 AM",
    rarity: "common",
    category: "time",
    total: 10,
    progress: 6,
    unlocked: false
  },
  {
    id: "night-shifter",
    title: "Night Shifter",
    description: "Complete goals after 9 PM",
    rarity: "common",
    category: "time",
    total: 10,
    progress: 4,
    unlocked: false
  },
  {
    id: "weekend-warrior",
    title: "Weekend Warrior",
    description: "Complete 5 goals on weekends",
    rarity: "rare",
    category: "time",
    total: 5,
    progress: 2,
    unlocked: false
  },
  {
    id: "weekday-hero",
    title: "Weekday Hero",
    description: "Complete 20 goals on weekdays",
    rarity: "epic",
    category: "time",
    total: 20,
    progress: 12,
    unlocked: false
  },
  {
    id: "quick-wins",
    title: "Quick Wins",
    description: "Complete 10 short-term goals",
    rarity: "rare",
    category: "time",
    total: 10,
    progress: 7,
    unlocked: false
  },
  {
    id: "long-hauler",
    title: "Long Hauler",
    description: "Complete 5 long-term goals",
    rarity: "epic",
    category: "time",
    total: 5,
    progress: 2,
    unlocked: false
  },
  {
    id: "deadline-beater",
    title: "Deadline Beater",
    description: "Complete goals 1 day before deadline",
    rarity: "rare",
    category: "time",
    total: 5,
    progress: 3,
    unlocked: false
  },
  {
    id: "last-minute",
    title: "Last Minute",
    description: "Complete goals on their deadline day",
    rarity: "common",
    category: "time",
    total: 3,
    progress: 1,
    unlocked: false
  },
  {
    id: "time-master",
    title: "Time Master",
    description: "Complete goals at optimal times consistently",
    rarity: "legendary",
    category: "time",
    total: 50,
    progress: 28,
    unlocked: false
  },
  {
    id: "flexible",
    title: "Flexible",
    description: "Adapt and complete goals at various times",
    rarity: "epic",
    category: "time",
    total: 25,
    progress: 15,
    unlocked: false
  }
] as const
