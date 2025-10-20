export interface ProfileVisibilitySettings {
  profileVisibility: "public" | "private";
  showStreaks: boolean;
  showAchievements: boolean;
  showProgress: boolean;
  showFollowers: boolean;
  showFollowing: boolean;
  showGoals: boolean;
}

export type GoalVisibility =
  | "public"
  | "followers"
  | "mutuals"
  | "private"
  | "partners-only";

export type UserRelationship =
  | "owner"
  | "mutual"
  | "follower"
  | "goal-partner"
  | "none";

export interface UserProfile {
  id: string;
  username: string;
  firstName: string;
  lastName: string;
  bio?: string;
  avatar?: string;
  location?: string;
  website?: string;
  joinDate: string;
  visibility: ProfileVisibilitySettings;
  isFollowing?: boolean;
  followersCount: number;
  followingCount: number;
}

export interface FollowRelationship {
  followerId: string;
  followingId: string;
  createdAt: string;
}

export class ProfileVisibilityManager {
  private currentUserId: string;

  constructor(userId: string = "mock-user-id") {
    this.currentUserId = userId;
  }

  // Get user relationship to target user
  getUserRelationship(targetUserId: string): UserRelationship {
    if (targetUserId === this.currentUserId) return "owner";
    if (this.isGoalPartner(targetUserId)) return "goal-partner";
    if (this.isMutualFollower(targetUserId)) return "mutual";
    if (this.isFollowing(targetUserId)) return "follower";
    return "none";
  }

  // Check if current user can view a profile
  canViewProfile(targetUserId: string, targetProfile: UserProfile): boolean {
    const relationship = this.getUserRelationship(targetUserId);

    switch (relationship) {
      case "owner":
        return true;
      case "goal-partner":
      case "mutual":
      case "follower":
        return true; // Can see basic profile info
      case "none":
        return targetProfile.visibility.profileVisibility === "public";
      default:
        return false;
    }
  }

  // Check if users are mutual followers (both follow each other)
  isMutualFollower(targetUserId: string): boolean {
    return this.isFollowing(targetUserId) && this.isFollower(targetUserId);
  }

  // Check if users are goal partners (share goals together)
  isGoalPartner(targetUserId: string): boolean {
    try {
      const goals = JSON.parse(localStorage.getItem("goals") || "[]");
      return goals.some(
        (goal: any) =>
          goal.partners &&
          goal.partners.includes(this.currentUserId) &&
          (goal.user_id === targetUserId ||
            goal.partners.includes(targetUserId)),
      );
    } catch {
      return false;
    }
  }

  // Check if current user can view specific profile sections
  canViewSection(
    targetUserId: string,
    targetProfile: UserProfile,
    section: keyof ProfileVisibilitySettings,
  ): boolean {
    const relationship = this.getUserRelationship(targetUserId);

    switch (relationship) {
      case "owner":
        return true;
      case "goal-partner":
        // Goal partners see minimal profile - only basic info
        return section === "showGoals"
          ? false
          : section === "profileVisibility"
            ? true
            : (targetProfile.visibility[section] as boolean);
      case "mutual":
      case "follower":
        // Followers and mutuals see sections based on profile settings
        if (targetProfile.visibility.profileVisibility === "private")
          return false;
        return section === "profileVisibility"
          ? true
          : (targetProfile.visibility[section] as boolean);
      case "none":
        // Non-followers only see public profile sections
        if (targetProfile.visibility.profileVisibility === "private")
          return false;
        return section === "profileVisibility"
          ? true
          : (targetProfile.visibility[section] as boolean);
      default:
        return false;
    }
  }

  // Check if current user can view a specific goal
  canViewGoal(
    targetUserId: string,
    targetProfile: UserProfile,
    goal: any,
  ): boolean {
    const relationship = this.getUserRelationship(targetUserId);
    const goalVisibility: GoalVisibility = goal.visibility || "public";

    // Owner sees all their goals
    if (relationship === "owner") return true;

    // Goal partners always see goals they're partnered on
    if (goal.partners && goal.partners.includes(this.currentUserId))
      return true;

    // Must be able to view profile first
    if (!this.canViewProfile(targetUserId, targetProfile)) return false;

    // Check goal visibility based on relationship
    switch (goalVisibility) {
      case "public":
        return targetProfile.visibility.profileVisibility === "public";
      case "followers":
        return relationship === "follower" || relationship === "mutual";
      case "mutuals":
        return relationship === "mutual";
      case "private":
        return false; // Only owner and partners see private goals
      case "partners-only":
        return false; // Only partners see these
      default:
        return false;
    }
  }

  // Check if current user can view followers/following lists
  canViewFollowers(targetUserId: string, targetProfile: UserProfile): boolean {
    if (targetUserId === this.currentUserId) return true;
    if (!this.canViewProfile(targetUserId, targetProfile)) return false;
    return targetProfile.visibility.showFollowers;
  }

  canViewFollowing(targetUserId: string, targetProfile: UserProfile): boolean {
    if (targetUserId === this.currentUserId) return true;
    if (!this.canViewProfile(targetUserId, targetProfile)) return false;
    return targetProfile.visibility.showFollowing;
  }

  // Follow/unfollow functionality
  followUser(targetUserId: string): boolean {
    try {
      const relationships = this.getFollowRelationships();
      const existingRelation = relationships.find(
        (r) =>
          r.followerId === this.currentUserId && r.followingId === targetUserId,
      );

      if (existingRelation) return false; // Already following

      relationships.push({
        followerId: this.currentUserId,
        followingId: targetUserId,
        createdAt: new Date().toISOString(),
      });

      localStorage.setItem(
        "followRelationships",
        JSON.stringify(relationships),
      );
      this.updateFollowCounts(targetUserId);
      return true;
    } catch {
      return false;
    }
  }

  unfollowUser(targetUserId: string): boolean {
    try {
      const relationships = this.getFollowRelationships();
      const filtered = relationships.filter(
        (r) =>
          !(
            r.followerId === this.currentUserId &&
            r.followingId === targetUserId
          ),
      );

      localStorage.setItem("followRelationships", JSON.stringify(filtered));
      this.updateFollowCounts(targetUserId);
      return true;
    } catch {
      return false;
    }
  }

  // Check relationships
  isFollowing(targetUserId: string): boolean {
    const relationships = this.getFollowRelationships();
    return relationships.some(
      (r) =>
        r.followerId === this.currentUserId && r.followingId === targetUserId,
    );
  }

  isFollower(targetUserId: string): boolean {
    const relationships = this.getFollowRelationships();
    return relationships.some(
      (r) =>
        r.followerId === targetUserId && r.followingId === this.currentUserId,
    );
  }

  // Get follow counts
  getFollowCounts(userId: string): { followers: number; following: number } {
    const relationships = this.getFollowRelationships();
    const followers = relationships.filter(
      (r) => r.followingId === userId,
    ).length;
    const following = relationships.filter(
      (r) => r.followerId === userId,
    ).length;
    return { followers, following };
  }

  // Get followers/following lists
  getFollowers(userId: string): string[] {
    const relationships = this.getFollowRelationships();
    return relationships
      .filter((r) => r.followingId === userId)
      .map((r) => r.followerId);
  }

  getFollowing(userId: string): string[] {
    const relationships = this.getFollowRelationships();
    return relationships
      .filter((r) => r.followerId === userId)
      .map((r) => r.followingId);
  }

  // Filter goals based on visibility
  filterGoalsByVisibility(
    goals: any[],
    targetUserId: string,
    targetProfile: UserProfile,
  ): any[] {
    return goals.filter((goal) =>
      this.canViewGoal(targetUserId, targetProfile, goal),
    );
  }

  // Get visible profile sections for UI
  getVisibleSections(targetUserId: string, targetProfile: UserProfile) {
    const relationship = this.getUserRelationship(targetUserId);

    return {
      basicInfo: true, // Always visible if profile is accessible
      streaks: this.canViewSection(targetUserId, targetProfile, "showStreaks"),
      achievements: this.canViewSection(
        targetUserId,
        targetProfile,
        "showAchievements",
      ),
      progress: this.canViewSection(
        targetUserId,
        targetProfile,
        "showProgress",
      ),
      followers: this.canViewSection(
        targetUserId,
        targetProfile,
        "showFollowers",
      ),
      following: this.canViewSection(
        targetUserId,
        targetProfile,
        "showFollowing",
      ),
      goals: this.canViewSection(targetUserId, targetProfile, "showGoals"),
      relationship,
      isPrivateProfile:
        targetProfile.visibility.profileVisibility === "private",
    };
  }

  // Get user profile with visibility applied
  getVisibleProfile(targetUserId: string): UserProfile | null {
    try {
      const profiles = this.getAllProfiles();
      const profile = profiles.find((p) => p.id === targetUserId);
      if (!profile) return null;

      const canView = this.canViewProfile(targetUserId, profile);
      if (!canView && targetUserId !== this.currentUserId) return null;

      // Apply visibility filters
      const visibleProfile = { ...profile };

      if (targetUserId !== this.currentUserId) {
        if (!this.canViewSection(targetUserId, profile, "showFollowers")) {
          visibleProfile.followersCount = 0;
        }
        if (!this.canViewSection(targetUserId, profile, "showFollowing")) {
          visibleProfile.followingCount = 0;
        }
      }

      visibleProfile.isFollowing = this.isFollowing(targetUserId);
      return visibleProfile;
    } catch {
      return null;
    }
  }

  // Private helper methods
  private getFollowRelationships(): FollowRelationship[] {
    try {
      return JSON.parse(localStorage.getItem("followRelationships") || "[]");
    } catch {
      return [];
    }
  }

  private updateFollowCounts(userId: string) {
    try {
      const profiles = this.getAllProfiles();
      const counts = this.getFollowCounts(userId);
      const profileIndex = profiles.findIndex((p) => p.id === userId);

      if (profileIndex !== -1) {
        profiles[profileIndex].followersCount = counts.followers;
        profiles[profileIndex].followingCount = counts.following;
        localStorage.setItem("userProfiles", JSON.stringify(profiles));
      }
    } catch {}
  }

  private getAllProfiles(): UserProfile[] {
    try {
      // Always initialize with sample profiles to ensure they exist
      const sampleProfiles: UserProfile[] = [
        {
          id: "mock-user-id",
          username: "johndoe",
          firstName: "John",
          lastName: "Doe",
          bio: "Goal-oriented individual passionate about personal growth.",
          joinDate: "2024-01-15",
          followersCount: 125,
          followingCount: 89,
          visibility: {
            profileVisibility: "public",
            showStreaks: true,
            showAchievements: true,
            showProgress: true,
            showFollowers: true,
            showFollowing: true,
            showGoals: true,
          },
        },
        {
          id: "sarah-martinez",
          username: "sarahm",
          firstName: "Sarah",
          lastName: "Martinez",
          bio: "Fitness enthusiast and accountability partner.",
          joinDate: "2024-01-10",
          followersCount: 89,
          followingCount: 156,
          visibility: {
            profileVisibility: "public",
            showStreaks: true,
            showAchievements: true,
            showProgress: true,
            showFollowers: true,
            showFollowing: false,
            showGoals: true,
          },
        },
        {
          id: "mike-chen",
          username: "mikechen",
          firstName: "Mike",
          lastName: "Chen",
          bio: "Learning enthusiast, always growing.",
          joinDate: "2024-02-01",
          followersCount: 67,
          followingCount: 43,
          visibility: {
            profileVisibility: "private",
            showStreaks: false,
            showAchievements: true,
            showProgress: false,
            showFollowers: true,
            showFollowing: true,
            showGoals: true,
          },
        },
        {
          id: "alex-partner",
          username: "alexpartner",
          firstName: "Alex",
          lastName: "Partner",
          bio: "Goal collaboration specialist.",
          joinDate: "2024-01-20",
          followersCount: 45,
          followingCount: 32,
          visibility: {
            profileVisibility: "private",
            showStreaks: true,
            showAchievements: false,
            showProgress: true,
            showFollowers: false,
            showFollowing: false,
            showGoals: false,
          },
        },
      ];

      const stored = localStorage.getItem("userProfiles");
      if (!stored) {
        localStorage.setItem("userProfiles", JSON.stringify(sampleProfiles));
        return sampleProfiles;
      }

      const existingProfiles = JSON.parse(stored);
      // Merge with sample profiles to ensure test users always exist
      const mergedProfiles = [...sampleProfiles];
      existingProfiles.forEach((profile: UserProfile) => {
        const existingIndex = mergedProfiles.findIndex(
          (p) => p.id === profile.id,
        );
        if (existingIndex >= 0) {
          mergedProfiles[existingIndex] = profile;
        } else {
          mergedProfiles.push(profile);
        }
      });

      localStorage.setItem("userProfiles", JSON.stringify(mergedProfiles));
      return mergedProfiles;
    } catch {
      return [];
    }
  }
}

// Initialize profiles on module load
const initializeProfiles = () => {
  try {
    const manager = new ProfileVisibilityManager();
    manager["getAllProfiles"](); // Force initialization
  } catch {}
};

// Initialize when module loads
if (typeof window !== "undefined") {
  initializeProfiles();
}

// Export singleton instance
export const profileVisibility = new ProfileVisibilityManager();
