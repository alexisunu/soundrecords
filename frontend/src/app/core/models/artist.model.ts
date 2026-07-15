/**
 * Coincide con las respuestas de ArtistController (/api/artists) del
 * API Contract v1.0.
 */

export interface BecomeArtistRequest {
  artistName: string;
  biography: string;
  genres: string;
  spotifyUrl: string;
}

export interface BecomeArtistResponse {
  id: string;
  artistName: string;
  role: 'ARTIST';
}

/**
 * Item de discografía tal como viene en GET /api/artists/{id}.
 * ⚠️ El contrato solo documenta spotifyAlbumId/name/coverUrl aquí — sin
 * año ni rating. En artist-public.ts se enriquece cada item llamando a
 * AlbumService.getById() (mismo endpoint que usa album-detail) para
 * traer releaseYear y platformRating, que sí forman parte de la ficha
 * de Spotify. Si eso falla para algún álbum, se muestra la card igual
 * pero sin esos dos datos extra.
 */
export interface ArtistDiscographyItem {
  spotifyAlbumId: string;
  name: string;
  coverUrl?: string;
}

/**
 * GET /api/artists/{id} — perfil público de artista.
 * ⚠️ A diferencia de UserProfilePublic (GET /api/users/{id}), este
 * endpoint NO trae followersCount ni ningún contador de seguidores. Por
 * eso el stats-row de la vista pública del artista sólo muestra
 * calificación promedio y reseñas totales (calculadas del lado del
 * frontend a partir de la discografía), no seguidores. Hay que
 * preguntarle a Alexis si eso se agrega más adelante.
 */
export interface ArtistPublicProfile {
  id: string;
  artistName: string;
  biography: string;
  genres: string;
  photoUrl?: string;
  spotifyUrl?: string;
  discography: ArtistDiscographyItem[];
  isFollowedByMe: boolean;
}

/**
 * GET /api/artists/me/dashboard — advancedStats solo viene poblado si
 * isPremium es true; si no, el contrato dice que el campo llega null.
 * ⚠️ El contrato NO expone followersCount, likesCount, ni un desglose
 * de calificación por álbum para el dashboard (a diferencia del mockup,
 * que sí los muestra). No se fabrican esos números en el componente:
 * el KPI row sólo usa profileViews / averageRating / totalReviews.
 */
export interface ArtistAdvancedStats {
  weeklyViews: number[];
  topCities: string[];
}

export interface ArtistDashboard {
  profileViews: number;
  averageRating: number | null;
  totalReviews: number;
  isPremium: boolean;
  advancedStats: ArtistAdvancedStats | null;
}

/** PUT /api/artists/me — solo se documentan estos 3 campos editables. */
export interface UpdateArtistProfileRequest {
  biography: string;
  genres: string;
  spotifyUrl: string;
}

export interface UpdateArtistProfileResponse {
  id: string;
  biography: string;
}

/**
 * PATCH /api/artists/me/boost — requiere plan Artista Premium (403 si
 * no lo tiene). ⚠️ El contrato no expone el estado actual del boost en
 * ningún GET (ni dashboard ni perfil público), así que el frontend no
 * puede saber si ya está activo al cargar la página; el estado que se
 * muestra es solo el resultado de la última acción hecha en esta
 * sesión. Habría que pedirle a Alexis un campo `boostActive` en el
 * dashboard para reflejar el estado real al entrar.
 */
export interface BoostRequest {
  active: boolean;
}

export interface BoostResponse {
  boostActive: boolean;
}
