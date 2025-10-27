export type GoalSample = {
  id: string
  title: string
  summary: string
  timeframe: string
  tone: string
  callToAction: string
  goalType: 'single-activity' | 'multi-activity' | 'check-in'
}

export const groupGoalSamples: GoalSample[] = [
  {
    id: "grp-1",
    title: "Creators Circle: 12-Week Content Sprint",
    summary: "Let’s drop one polished video every week and ship the analytics recap on Fridays.",
    timeframe: "Mar 1 – May 24 | Weekly sync on Fridays",
    tone: "Motivating, high-energy",
    callToAction: "Who’s ready to lock the first storyboard?",
    goalType: 'multi-activity',
  },
  {
    id: "grp-2",
    title: "Wellness Wave Squad",
    summary: "We’re turning hydration into a team sport—log each check-in before 8pm.",
    timeframe: "Daily nudges | 30-day streak goal",
    tone: "Supportive, upbeat",
    callToAction: "Drop a ✅ once your bottle hits halfway!",
    goalType: 'check-in',
  },
  {
    id: "grp-3",
    title: "Design Studio Jam",
    summary: "Tabs open, Figma ready—let’s stagger deliverables so we keep shipping.",
    timeframe: "Wednesdays | 6-week sprint",
    tone: "Collaborative, creative",
    callToAction: "Ping the chat when your Figma link is live!",
    goalType: 'multi-activity',
  },
]
