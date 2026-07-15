/**
 * Coincide con las respuestas de NotificationController (/api/notifications)
 * del API Contract v1.0.
 */

export type NotificationType =
  | 'LIKE'
  | 'NEW_FOLLOWER'
  | 'MISSION_COMPLETED'
  | 'NEW_BADGE'
  | 'LEVEL_UP'
  | 'ARTIST_RELEASE'
  | 'COMMENT';

export interface AppNotification {
  id: string;
  type: NotificationType;
  message: string;
  isRead: boolean;
  createdAt: string;
}

export interface NotificationsResponse {
  notifications: AppNotification[];
  unreadCount: number;
}

export interface MarkReadResponse {
  isRead: boolean;
}

export interface MarkAllReadResponse {
  message: string;
  unreadCount: number;
}

/**
 * ⚠️ El contrato solo expone un PATCH /api/notifications/preferences
 * (no hay GET), así que no hay forma de conocer los valores guardados
 * al cargar la vista. Igual que con el boost de artist-dashboard.ts,
 * partimos de los valores por defecto que muestra el mockup (VISTA 17)
 * y reflejamos ahí la última acción hecha en esta sesión.
 */
export interface NotificationPreferences {
  likes: boolean;
  newFollowers: boolean;
  comments: boolean;
  mentions: boolean;
  missionCompleted: boolean;
  newBadges: boolean;
  levelUp: boolean;
  artistReleases: boolean;
  weeklyEmailSummary: boolean;
}

export interface UpdatePreferencesResponse {
  message: string;
}