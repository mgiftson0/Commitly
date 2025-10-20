// Web Push Notifications utility
export class NotificationService {
  private static instance: NotificationService;
  private registration: ServiceWorkerRegistration | null = null;

  static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  async init() {
    if ("serviceWorker" in navigator && "Notification" in window) {
      try {
        // Check if sw.js exists before registering
        const response = await fetch("/sw.js", { method: "HEAD" });
        if (response.ok) {
          this.registration = await navigator.serviceWorker.register("/sw.js");
          await this.requestPermission();
        } else {
          console.log(
            "Service worker file not found, notifications will work without service worker",
          );
          await this.requestPermission();
        }
      } catch (error) {
        console.log(
          "Service worker registration skipped:",
          error instanceof Error ? error.message : String(error),
        );
        await this.requestPermission();
      }
    }
  }

  async requestPermission(): Promise<boolean> {
    if (!("Notification" in window)) return false;

    try {
      const permission = await Notification.requestPermission();
      return permission === "granted";
    } catch (error) {
      console.log(
        "Notification permission request failed:",
        error instanceof Error ? error.message : String(error),
      );
      return false;
    }
  }

  async sendNotification(title: string, options: NotificationOptions = {}) {
    if (!("Notification" in window)) return;

    const permission = await this.requestPermission();
    if (!permission) return;

    const defaultOptions: NotificationOptions = {
      icon: "/icon-192x192.png",
      badge: "/icon-192x192.png",
      tag: "commitly-notification",
      ...options,
    };

    if (this.registration) {
      await this.registration.showNotification(title, defaultOptions);
    } else {
      new Notification(title, defaultOptions);
    }
  }

  // Specific notification methods
  async goalCreated(goalTitle: string) {
    await this.sendNotification("🎯 New Goal Created!", {
      body: `"${goalTitle}" has been added to your goals`,
      tag: "goal-created",
    });
  }

  async goalCompleted(goalTitle: string) {
    await this.sendNotification("🎉 Goal Completed!", {
      body: `Congratulations! You completed "${goalTitle}"`,
      tag: "goal-completed",
    });
  }

  async goalDueSoon(goalTitle: string, daysLeft: number) {
    await this.sendNotification("⏰ Goal Due Soon", {
      body: `"${goalTitle}" is due in ${daysLeft} day${daysLeft !== 1 ? "s" : ""}`,
      tag: "goal-due",
    });
  }

  async partnerRequest(partnerName: string) {
    await this.sendNotification("👥 New Partner Request", {
      body: `${partnerName} wants to be your accountability partner`,
      tag: "partner-request",
    });
  }

  async partnerAccepted(partnerName: string) {
    await this.sendNotification("✅ Partner Request Accepted", {
      body: `${partnerName} accepted your accountability partner request`,
      tag: "partner-accepted",
    });
  }

  async partnerDeclined(partnerName: string) {
    await this.sendNotification("❌ Partner Request Declined", {
      body: `${partnerName} declined your accountability partner request`,
      tag: "partner-declined",
    });
  }

  async newFollower(followerName: string) {
    await this.sendNotification("👤 New Follower", {
      body: `${followerName} started following you`,
      tag: "new-follower",
    });
  }

  async encouragementReceived(senderName: string, goalTitle: string) {
    await this.sendNotification("💪 Encouragement Received", {
      body: `${senderName} sent you encouragement for "${goalTitle}"`,
      tag: "encouragement",
    });
  }
}

export const notifications = NotificationService.getInstance();
