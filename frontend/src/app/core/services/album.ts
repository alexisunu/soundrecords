import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { timeout } from 'rxjs/operators';
import { AlbumDetail, AlbumSearchResult } from '../models/album.model';

/**
 * Todas las rutas requieren JWT (según el contrato), el token se agrega
 * automáticamente por jwtInterceptor a cualquier request cuya URL
 * contenga "/api/".
 */
@Injectable({
  providedIn: 'root',
})
export class AlbumService {
  private baseUrl = 'http://localhost:8080/api/spotify';

  // Spotify puede tardar o el 503 del contrato puede colgarse; sin esto
  // el loading se queda pegado para siempre si el backend no responde.
  private readonly REQUEST_TIMEOUT_MS = 8000;

  constructor(private http: HttpClient) {}

  // GET /api/spotify/search?q={query}&genre={genre}&year={year}
  // ⚠️ El backend real devuelve un array plano (List<AlbumResponse>),
  // no { results: [...] } como dice el contrato v1.0. Ver nota en
  // album.model.ts.
  search(query: string, genre?: string, year?: string): Observable<AlbumSearchResult[]> {
    let params = new HttpParams().set('q', query);
    if (genre) params = params.set('genre', genre);
    if (year) params = params.set('year', year);

    return this.http
      .get<AlbumSearchResult[]>(`${this.baseUrl}/search`, { params })
      .pipe(timeout(this.REQUEST_TIMEOUT_MS));
  }

  // GET /api/spotify/albums/{spotifyAlbumId}
  getById(spotifyAlbumId: string): Observable<AlbumDetail> {
    return this.http
      .get<AlbumDetail>(`${this.baseUrl}/albums/${spotifyAlbumId}`)
      .pipe(timeout(this.REQUEST_TIMEOUT_MS));
  }
}