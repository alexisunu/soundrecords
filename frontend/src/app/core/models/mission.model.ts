/**
 * Coincide con las respuestas de MissionController (/api/missions) del
 * API Contract v1.0.
 */

export interface Mission {
  id: string;
  name: string;
  rewardPoints: number;
  completed: boolean;
  /**
   * Solo viene en algunas misiones (el ejemplo del contrato lo muestra
   * en achievementMissions, formato "41/50"). Cuando no viene, la
   * mostramos como pendiente/completada sin barra de progreso.
   */
  progress?: string;
  /**
   * ⚠️ La tabla MISSIONS sí tiene columna `description`, pero la
   * respuesta de GET /api/missions/me del contrato v1.0 NO la incluye
   * en el JSON de ejemplo (solo id/name/rewardPoints/completed/
   * progress). La dejamos opcional por si el backend termina
   * agregándola.
   */
  description?: string;
}

export interface MissionsMeResponse {
  level: string;
  points: number;
  pointsToNextLevel: number;
  dailyMissions: Mission[];
  achievementMissions: Mission[];
}

export interface Badge {
  id: string;
  name: string;
  imageUrl?: string;
  costPoints: number;
  owned: boolean;
}

export interface BadgesStoreResponse {
  myPoints: number;
  badges: Badge[];
}

export interface PurchaseBadgeResponse {
  message: string;
  remainingPoints: number;
}