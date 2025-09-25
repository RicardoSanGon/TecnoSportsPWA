import { LocalNotifications, ScheduleOptions } from '@capacitor/local-notifications';
import { Capacitor } from '@capacitor/core';

// Helper to check if running on native platform
const isNativePlatform = () => Capacitor.isNativePlatform();

// --- Permission Functions ---

export const requestNotificationPermissions = async (): Promise<boolean> => {
  if (isNativePlatform()) {
    const permissions = await LocalNotifications.requestPermissions();
    return permissions.display === 'granted';
  } else {
    // Web Notification API
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    }
    return false; // Notifications not supported
  }
};

export const checkNotificationPermissions = async (): Promise<string> => {
  if (isNativePlatform()) {
    const permissions = await LocalNotifications.checkPermissions();
    return permissions.display;
  } else {
    if ('Notification' in window) {
      return Notification.permission;
    }
    return 'denied'; // Notifications not supported
  }
};

// --- Scheduling Functions ---

interface MatchInfo {
  id: number;
  matchDate: string;
  homeTeamName: string;
  awayTeamName: string;
}

export const scheduleMatchNotifications = async (match: MatchInfo): Promise<boolean> => {
  const matchDate = new Date(match.matchDate);
  const now = new Date();

  if (isNativePlatform()) {
    const notificationsToSchedule = [];

    // 1 hour before
    const oneHourBefore = new Date(matchDate.getTime() - 60 * 60 * 1000);
    if (oneHourBefore > now) {
      notificationsToSchedule.push({
        id: match.id * 1000 + 1,
        title: "¡Partido a punto de empezar!",
        body: `${match.homeTeamName} vs ${match.awayTeamName} en una hora.`,
        schedule: { at: oneHourBefore },
      });
    }

    // At match time
    if (matchDate > now) {
      notificationsToSchedule.push({
        id: match.id * 1000 + 2,
        title: "¡El partido ha comenzado!",
        body: `El partido ${match.homeTeamName} vs ${match.awayTeamName} acaba de empezar.`,
        schedule: { at: matchDate },
      });
    }

    if (notificationsToSchedule.length > 0) {
      await LocalNotifications.schedule({ notifications: notificationsToSchedule });
      return true;
    }
    return false;

  } else {
    // Web Notification API with setTimeout
    let scheduled = false;

    const showNotification = (title: string, body: string) => {
      new Notification(title, { body });
    };

    // 1 hour before
    const oneHourBefore = matchDate.getTime() - now.getTime() - 60 * 60 * 1000;
    if (oneHourBefore > 0) {
      setTimeout(() => {
        showNotification(
          "¡Partido a punto de empezar!",
          `${match.homeTeamName} vs ${match.awayTeamName} en una hora.`
        );
      }, oneHourBefore);
      scheduled = true;
    }

    // At match time
    const timeToMatch = matchDate.getTime() - now.getTime();
    if (timeToMatch > 0) {
      setTimeout(() => {
        showNotification(
          "¡El partido ha comenzado!",
          `El partido ${match.homeTeamName} vs ${match.awayTeamName} acaba de empezar.`
        );
      }, timeToMatch);
      scheduled = true;
    }

    return scheduled;
  }
};

export const cancelMatchNotifications = async (matchId: number) => {
  if (isNativePlatform()) {
    await LocalNotifications.cancel({ notifications: [
      { id: matchId * 1000 + 1 },
      { id: matchId * 1000 + 2 }
    ]});
  } else {
    // On the web, there is no standard way to cancel scheduled `setTimeout` calls
    // from a different context without storing their IDs. 
    // For this PWA use case, if the user deselects a favorite, the timeouts will
    // still exist but won't fire if the page is reloaded. This is a limitation
    // of client-side-only scheduling on the web.
    console.warn('Canceling notifications on the web is not fully supported in this implementation.');
  }
};
