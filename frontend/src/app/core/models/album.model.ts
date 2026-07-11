/**
 * Coincide con las respuestas de SpotifyController (/api/spotify) del
 * API Contract v1.0. El backend combina la ficha de Spotify con el
 * rating/reviews propios de la BD.
 */

export interface AlbumSearchResult {
  spotifyAlbumId: string;
  name: string;
  artist: string;
  coverUrl?: string;
  /**
   * ⚠️ El contrato lo documenta como number, pero el backend real de
   * Alexis lo está devolviendo como string (ver payload de ejemplo:
   * "releaseYear": "1982"). Se deja como string | number para no
   * romper si lo corrigen más adelante.
   */
  releaseYear?: string | number;
  platformRating?: number | null;
  platformReviewsCount?: number | null;
  /**
   * Estos dos campos no están en la sección de "Response 200" de
   * /api/spotify/search del contrato v1.0, pero el backend real ya los
   * está mandando en cada resultado (ver payload de ejemplo compartido
   * por Alexis). Se dejan opcionales por si algún día dejan de venir.
   */
  tracklist?: string[] | null;
  myReview?: unknown | null;
}

/**
 * ⚠️ DESVIACIÓN DEL CONTRATO v1.0: el contrato documenta la respuesta de
 * GET /api/spotify/search como { "results": [...] }, pero el backend
 * real de Alexis devuelve un ResponseEntity<List<AlbumResponse>>, es
 * decir un array plano. Por eso el service ya NO usa un wrapper tipo
 * AlbumSearchResponse; search() retorna AlbumSearchResult[] directo.
 * Si el backend llega a "corregirse" para envolver en results, hay que
 * revertir este cambio en album.ts.
 */

export interface AlbumDetail {
  spotifyAlbumId: string;
  name: string;
  artist: string;
  coverUrl?: string;
  releaseYear?: string | number;
  tracklist?: string[] | null;
  platformRating?: number | null;
  platformReviewsCount?: number | null;
  /**
   * Reseña del usuario actual para este álbum, o null si no ha
   * reseñado. El contrato no especifica el shape exacto, así que se
   * deja como unknown hasta que el backend lo confirme.
   */
  myReview?: unknown | null;
}