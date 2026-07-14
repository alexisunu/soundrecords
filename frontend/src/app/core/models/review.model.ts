/**
 * Coincide con las respuestas de ReviewController (/api/reviews) del
 * API Contract v1.0.
 */

export interface ReviewFeedUser {
  id: string;
  username: string;
  photoUrl?: string;
  /**
   * ⚠️ El contrato NO retorna este campo dentro de "user" en
   * GET /api/reviews/feed. Se deja opcional y se asume `true` mientras
   * no venga explícito, porque el feed "Siguiendo" en teoría solo trae
   * reseñas de gente que ya sigues. Si el backend llega a exponerlo,
   * esto ya queda listo para leerlo.
   */
  isFollowedByMe?: boolean;
}

export interface Review {
  id: string;
  user: ReviewFeedUser;
  /**
   * ⚠️ No viene en la respuesta de GET /api/reviews/feed según el
   * contrato v1.0 (solo trae albumName/artistName/coverUrl). Sin este
   * id no se puede armar el link real a "Ver álbum" (GET
   * /api/spotify/albums/{spotifyAlbumId}). Hay que pedirle a Alexis que
   * lo agregue a la respuesta del feed.
   */
  spotifyAlbumId?: string;
  albumName: string;
  artistName: string;
  coverUrl?: string;
  rating: number;
  content: string;
  likesCount: number;
  likedByMe?: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface FeedResponse {
  reviews: Review[];
  page: number;
  hasMore: boolean;
}

export interface AlbumReviewsResponse {
  reviews: Review[];
  averageRating: number | null;
  totalReviews: number;
  myReview?: Review | null;
}

export interface LikeResponse {
  liked: boolean;
  likesCount: number;
}

export type ReportReason =
  | 'SPAM'
  | 'OFFENSIVE_LANGUAGE'
  | 'FALSE_CONTENT'
  | 'HARASSMENT'
  | 'OTHER';

export interface MissionCompletedInfo {
  name: string;
  pointsEarned: number;
}

export interface CreateReviewPayload {
  spotifyAlbumId: string;
  albumName: string;
  artistName: string;
  coverUrl: string;
  rating: number;
  content: string;
}

export interface CreateReviewResponse extends Review {
  missionCompleted?: MissionCompletedInfo;
}
