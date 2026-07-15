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