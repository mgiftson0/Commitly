"use client";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";

interface GroupMember {
  id: string;
  name: string;
  status: 'accepted';
}

interface ActivityAssignmentProps {
  activityIndex: number;
  groupMembers: GroupMember[];
  assignment: string | null;
  assignedToAll: boolean;
  onAssignmentChange: (index: number, assignment: string | null, assignedToAll: boolean) => void;
}

export function ActivityAssignment({
  activityIndex,
  groupMembers,
  assignment,
  assignedToAll,
  onAssignmentChange
}: ActivityAssignmentProps) {
  return (
    <div className="space-y-1">
      <Label className="text-xs font-medium text-muted-foreground">
        Assign to
      </Label>
      <Select
        value={assignedToAll ? "all" : assignment || ""}
        onValueChange={(value) => {
          if (value === "all") {
            onAssignmentChange(activityIndex, null, true);
          } else {
            onAssignmentChange(activityIndex, value, false);
          }
        }}
      >
        <SelectTrigger className="h-7 text-xs">
          <SelectValue placeholder="Select member..." />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all" className="text-xs">
            All members
          </SelectItem>
          {groupMembers.map((member) => (
            <SelectItem key={member.id} value={member.id} className="text-xs">
              {member.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}