import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map, timeout } from 'rxjs/operators';
import {
  ArtistDashboard,
  ArtistPublicProfile,
  BecomeArtistRequest,
  BecomeArtistResponse,
  BoostRequest,
  BoostResponse,
  DiscoverArtist,
  DiscoverArtistsResponse,
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

  // GET /api/artists/discover — Premium (boost) primero, luego el resto
  // ordenado por profileViews. Usado por la vista Descubre.
  // ⚠️ FIX: la petición llegaba 200 con datos, pero la vista se quedaba
  // vacía. Causa: el contrato documenta la respuesta como
  // { "artists": [...] }, pero si el controller de Alexis devuelve la
  // lista sin envolver (un array plano, algo muy común al hacer
  // return ResponseEntity.ok(lista) directo desde un repositorio),
  // "res.artists" queda undefined y el frontend termina pintando el
  // estado vacío aunque el array sí venga en el body. Se normaliza acá
  // para que ambos formatos funcionen sin tocar los componentes.
  discover(): Observable<DiscoverArtistsResponse> {
    return this.http
      .get<DiscoverArtistsResponse | DiscoverArtist[]>(`${this.baseUrl}/discover`)
      .pipe(
        timeout(this.REQUEST_TIMEOUT_MS),
        map((res) => (Array.isArray(res) ? { artists: res } : res)),
      );
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