-- Seed data for seasonal goal templates
INSERT INTO public.seasonal_goal_templates (title, description, category, duration_type, suggested_activities, difficulty_level, popularity_score) VALUES

-- Annual Templates
('Read 52 Books', 'Read one book per week throughout the year', 'Learning', 'annual', '["Set weekly reading schedule", "Join book club", "Track progress monthly", "Mix fiction and non-fiction"]', 'medium', 95),
('Learn a New Language', 'Achieve conversational fluency in a new language', 'Learning', 'annual', '["Use language learning app daily", "Practice with native speakers", "Watch movies in target language", "Take formal classes"]', 'hard', 88),
('Run 1000 Miles', 'Complete 1000 miles of running throughout the year', 'Fitness', 'annual', '["Start with 3 runs per week", "Gradually increase distance", "Join running group", "Track with fitness app"]', 'hard', 82),
('Save $10,000', 'Build emergency fund or savings goal', 'Finance', 'annual', '["Create monthly budget", "Automate savings transfers", "Reduce unnecessary expenses", "Track progress weekly"]', 'medium', 91),
('Master a New Skill', 'Become proficient in a professional or creative skill', 'Career', 'annual', '["Take online courses", "Practice daily", "Build portfolio projects", "Find mentor"]', 'medium', 79),

-- Quarterly Templates  
('Lose 20 Pounds', 'Achieve healthy weight loss over 3 months', 'Health', 'quarterly', '["Create meal plan", "Exercise 4x per week", "Track calories", "Weekly weigh-ins"]', 'medium', 87),
('Launch Side Project', 'Complete and launch a personal project', 'Career', 'quarterly', '["Define project scope", "Set weekly milestones", "Build MVP", "Get user feedback"]', 'hard', 74),
('Declutter Home', 'Organize and minimize possessions', 'Lifestyle', 'quarterly', '["One room per month", "Donate unused items", "Implement organization systems", "Maintain weekly"]', 'easy', 83),
('Learn New Technology', 'Master a new programming language or framework', 'Learning', 'quarterly', '["Complete online course", "Build practice projects", "Join community", "Document learning"]', 'medium', 76),
('Improve Sleep Quality', 'Establish consistent healthy sleep habits', 'Health', 'quarterly', '["Set consistent bedtime", "Create bedtime routine", "Limit screen time", "Track sleep patterns"]', 'easy', 89),

-- Biannual Templates
('Complete Marathon Training', 'Train for and complete a marathon', 'Fitness', 'biannual', '["Follow training plan", "Build base mileage", "Practice race nutrition", "Taper before race"]', 'hard', 71),
('Career Transition', 'Successfully change careers or get promotion', 'Career', 'biannual', '["Update resume and LinkedIn", "Network in target industry", "Gain relevant skills", "Apply strategically"]', 'hard', 68),
('Home Renovation Project', 'Complete major home improvement', 'Lifestyle', 'biannual', '["Plan and budget project", "Research contractors", "Obtain permits", "Manage timeline"]', 'hard', 65),
('Write a Book', 'Complete first draft of book or long-form content', 'Creative', 'biannual', '["Outline chapters", "Write daily", "Set word count goals", "Find beta readers"]', 'hard', 72),
('Build Investment Portfolio', 'Establish diversified investment strategy', 'Finance', 'biannual', '["Research investment options", "Open investment accounts", "Dollar-cost average", "Review quarterly"]', 'medium', 78);