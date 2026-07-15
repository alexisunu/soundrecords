import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { timeout } from 'rxjs/operators';
import {
  ArtistDashboard,
  ArtistPublicProfile,
  BecomeArtistRequest,
  BecomeArtistResponse,
  BoostRequest,
  BoostResponse,
  UpdateArtistProfileRequest,
  UpdateArtistProfileResponse,
} from '../models/artist.model';

@Injectable({
  providedIn: 'root',
})
export class ArtistService {
  private baseUrl = 'http://localhost:8080/api/artists';
  private readonly REQUEST_TIMEOUT_MS = 8000;

  constructor(private http: HttpClient) {}

  // POST /api/artists — crea el perfil de artista y cambia el role a ARTIST
  becomeArtist(body: BecomeArtistRequest): Observable<BecomeArtistResponse> {
    return this.http
      .post<BecomeArtistResponse>(`${this.baseUrl}`, body)
      .pipe(timeout(this.REQUEST_TIMEOUT_MS));
  }

  // GET /api/artists/{id} — perfil público. El backend incrementa
  // profileViews en 1 cada vez que se consulta este endpoint.
  getById(id: string): Observable<ArtistPublicProfile> {
    return this.http
      .get<ArtistPublicProfile>(`${this.baseUrl}/${id}`)
      .pipe(timeout(this.REQUEST_TIMEOUT_MS));
  }

  // GET /api/artists/me/dashboard — requiere JWT + role ARTIST
  getDashboard(): Observable<ArtistDashboard> {
    return this.http
      .get<ArtistDashboard>(`${this.baseUrl}/me/dashboard`)
      .pipe(timeout(this.REQUEST_TIMEOUT_MS));
  }

  // PUT /api/artists/me — requiere JWT + role ARTIST
  updateProfile(body: UpdateArtistProfileRequest): Observable<UpdateArtistProfileResponse> {
    return this.http
      .put<UpdateArtistProfileResponse>(`${this.baseUrl}/me`, body)
      .pipe(timeout(this.REQUEST_TIMEOUT_MS));
  }

  // PATCH /api/artists/me/boost — requiere JWT + Plan Artista Premium
  setBoost(active: boolean): Observable<BoostResponse> {
    const body: BoostRequest = { active };
    return this.http
      .patch<BoostResponse>(`${this.baseUrl}/me/boost`, body)
      .pipe(timeout(this.REQUEST_TIMEOUT_MS));
  }
}
