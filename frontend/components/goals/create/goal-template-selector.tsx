"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Lightbulb, BookOpen, Dumbbell, Briefcase, Heart } from "lucide-react";

interface GoalTemplate {
  title: string;
  description: string;
  category: string;
  icon: any;
  color: string;
}

interface GoalTemplateSelectorProps {
  onApplyTemplate: (template: any, goalType: "single-activity" | "multi-activity", selectedActivities: string[], selectedSingleActivity: string) => void;
}

export function GoalTemplateSelector({ onApplyTemplate }: GoalTemplateSelectorProps) {
  const [selectedTemplate, setSelectedTemplate] = useState<GoalTemplate | null>(null);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [templateGoalType, setTemplateGoalType] = useState<"single-activity" | "multi-activity">("single-activity");
  const [selectedActivities, setSelectedActivities] = useState<string[]>([]);
  const [selectedSingleActivity, setSelectedSingleActivity] = useState<string>("");

  const goalTemplates = [
    {
      title: "Morning Workout",
      description: "Build strength and energy for the day",
      category: "health-fitness",
      icon: Dumbbell,
      color: "text-green-600",
    },
    {
      title: "Daily Reading",
      description: "Expand knowledge and reduce stress",
      category: "learning",
      icon: BookOpen,
      color: "text-blue-600",
    },
    {
      title: "Career Development",
      description: "Advance your professional growth",
      category: "career",
      icon: Briefcase,
      color: "text-purple-600",
    },
    {
      title: "Mindfulness Practice",
      description: "Find inner peace and mindfulness",
      category: "wellness",
      icon: Heart,
      color: "text-pink-600",
    },
  ];

  const activitySuggestions = {
    "health-fitness": [
      "30 minutes cardio",
      "Strength training",
      "Stretch routine",
      "Drink 8 glasses water",
      "Walk 10k steps",
    ],
    learning: [
      "Read 20 pages",
      "Take notes",
      "Practice coding",
      "Watch tutorial",
      "Complete course module",
    ],
    career: [
      "Update resume",
      "Network with colleagues",
      "Learn new skill",
      "Apply for jobs",
      "Complete project",
    ],
    wellness: [
      "Meditate 10 minutes",
      "Practice breathing",
      "Take vitamins",
      "Get 8 hours sleep",
      "Limit screen time",
    ],
  };

  const applyTemplate = () => {
    if (!selectedTemplate) return;
    onApplyTemplate(selectedTemplate, templateGoalType, selectedActivities, selectedSingleActivity);
    setShowTemplateModal(false);
    setSelectedTemplate(null);
    setSelectedActivities([]);
    setSelectedSingleActivity("");
  };

  const toggleActivitySelection = (activity: string) => {
    if (templateGoalType === "single-activity") {
      setSelectedSingleActivity(
        activity === selectedSingleActivity ? "" : activity,
      );
    } else {
      setSelectedActivities((prev) =>
        prev.includes(activity)
          ? prev.filter((a) => a !== activity)
          : [...prev, activity],
      );
    }
  };

  return (
    <>
      <Card className="rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-xs">
            <Lightbulb className="h-3 w-3 text-amber-500" />
            Quick Templates
          </CardTitle>
          <CardDescription className="text-xs">
            Pre-built structures
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="grid gap-2">
            {goalTemplates.slice(0, 3).map((template) => {
              const Icon = template.icon;
              return (
                <button
                  key={template.title}
                  type="button"
                  className="flex w-full items-start gap-2 rounded-lg border border-slate-200 bg-white p-2 text-left hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900"
                  onClick={() => {
                    setSelectedTemplate(template);
                    setShowTemplateModal(true);
                  }}
                >
                  <div className={`flex h-6 w-6 items-center justify-center rounded bg-blue-50 text-blue-600 ${template.color}`}>
                    <Icon className="h-3 w-3" />
                  </div>
                  <div className="flex-1 space-y-1">
                    <p className="text-xs font-medium text-slate-800 dark:text-slate-100">{template.title}</p>
                    <Badge variant="secondary" className="text-xs">
                      {template.category.replace('-', ' ')}
                    </Badge>
                  </div>
                </button>
              );
            })}
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="w-full h-6 text-xs"
            onClick={() => setShowTemplateModal(true)}
          >
            Browse All
          </Button>
        </CardContent>
      </Card>

      <Dialog open={showTemplateModal} onOpenChange={setShowTemplateModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Customize Template</DialogTitle>
          </DialogHeader>
          {selectedTemplate && (
            <div className="space-y-4">
              <div className="flex items-center gap-3 rounded-2xl border border-white/40 bg-white/80 p-3 shadow-sm backdrop-blur dark:border-white/10 dark:bg-slate-900/60">
                <selectedTemplate.icon className={`h-5 w-5 ${selectedTemplate.color}`} />
                <div>
                  <div className="text-sm font-semibold text-slate-900 dark:text-slate-100">{selectedTemplate.title}</div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">{selectedTemplate.description}</div>
                </div>
              </div>

              <div className="space-y-3">
                <Label className="text-xs font-semibold uppercase tracking-wide">Goal Type</Label>
                <RadioGroup
                  value={templateGoalType}
                  onValueChange={(v: "single-activity" | "multi-activity") => setTemplateGoalType(v)}
                  className="grid gap-2"
                >
                  {[
                    { value: "single-activity", label: "Single Activity" },
                    { value: "multi-activity", label: "Multi-Activity Checklist" },
                  ].map((option) => (
                    <label
                      key={option.value}
                      htmlFor={`template-${option.value}`}
                      className={`flex cursor-pointer items-center gap-2 rounded-xl border px-3 py-2 text-sm transition ${
                        templateGoalType === option.value ? "border-primary/60 bg-primary/10" : "border-border/50 hover:border-primary/40"
                      }`}
                    >
                      <RadioGroupItem value={option.value} id={`template-${option.value}`} />
                      {option.label}
                    </label>
                  ))}
                </RadioGroup>
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-semibold uppercase tracking-wide">
                  {templateGoalType === "single-activity" ? "Choose one activity" : "Select activities"}
                </Label>
                <div className="space-y-1">
                  {(activitySuggestions[selectedTemplate.category as keyof typeof activitySuggestions] || []).map((activity, idx) => {
                    const isSelected =
                      templateGoalType === "single-activity"
                        ? selectedSingleActivity === activity
                        : selectedActivities.includes(activity);

                    return (
                      <Button
                        key={`${activity}-${idx}`}
                        variant={isSelected ? "default" : "ghost"}
                        size="sm"
                        className="w-full justify-start rounded-xl px-3 py-2 text-sm"
                        onClick={() => toggleActivitySelection(activity)}
                      >
                        <div className="flex items-center gap-2">
                          {templateGoalType === "single-activity" ? (
                            <div className={`h-3 w-3 rounded-full border ${isSelected ? "border-primary bg-primary" : "border-muted-foreground"}`} />
                          ) : (
                            <Checkbox checked={isSelected} disabled />
                          )}
                          {activity}
                        </div>
                      </Button>
                    );
                  })}
                </div>
                {templateGoalType === "multi-activity" && (
                  <p className="text-[11px] text-muted-foreground">Selected: {selectedActivities.length}/5</p>
                )}
              </div>

              <div className="flex gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowTemplateModal(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  onClick={applyTemplate}
                  className="flex-1"
                  disabled={
                    templateGoalType === "single-activity"
                      ? !selectedSingleActivity
                      : selectedActivities.length === 0
                  }
                >
                  Apply Template
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}