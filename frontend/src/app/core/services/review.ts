import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  AlbumReviewsResponse,
  CreateReviewPayload,
  CreateReviewResponse,
  FeedResponse,
  LikeResponse,
  ReportReason,
  Review,
  UserReviewsResponse,
} from '../models/review.model';

/**
 * Todas las rutas de este servicio requieren JWT (según el contrato).
 * El token se agrega automáticamente por jwtInterceptor a cualquier
 * request cuya URL contenga "/api/", así que aquí no hay que tocar
 * headers manualmente.
 */
@Injectable({
  providedIn: 'root',
})
export class ReviewService {
  private baseUrl = 'http://localhost:8080/api/reviews';

  constructor(private http: HttpClient) {}

  // GET /api/reviews/feed - feed paginado (usuarios seguidos)
  getFeed(page = 0): Observable<FeedResponse> {
    return this.http.get<FeedResponse>(`${this.baseUrl}/feed`, {
      params: { page },
    });
  }

  // GET /api/reviews/album/{spotifyAlbumId}
  getAlbumReviews(spotifyAlbumId: string): Observable<AlbumReviewsResponse> {
    return this.http.get<AlbumReviewsResponse>(`${this.baseUrl}/album/${spotifyAlbumId}`);
  }

  // GET /api/reviews/user/{userId} - reseñas hechas por un usuario puntual
  // (usado en Mi Perfil / perfil público, pestaña "Reseñas").
  getByUser(userId: string): Observable<UserReviewsResponse> {
    return this.http.get<UserReviewsResponse>(`${this.baseUrl}/user/${userId}`);
  }

  // GET /api/reviews/{id}
  getById(id: string): Observable<Review> {
    return this.http.get<Review>(`${this.baseUrl}/${id}`);
  }

  // POST /api/reviews
  create(payload: CreateReviewPayload): Observable<CreateReviewResponse> {
    return this.http.post<CreateReviewResponse>(this.baseUrl, payload);
  }

  // PUT /api/reviews/{id} - solo el dueño
  update(id: string, payload: { rating: number; content: string }): Observable<Review> {
    return this.http.put<Review>(`${this.baseUrl}/${id}`, payload);
  }

  // DELETE /api/reviews/{id} - solo el dueño
  delete(id: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.baseUrl}/${id}`);
  }

  // POST /api/reviews/{id}/like - toggle (like/unlike)
  toggleLike(id: string): Observable<LikeResponse> {
    return this.http.post<LikeResponse>(`${this.baseUrl}/${id}/like`, {});
  }

  // POST /api/reviews/{id}/report
  report(id: string, reason: ReportReason): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.baseUrl}/${id}/report`, { reason });
  }
}