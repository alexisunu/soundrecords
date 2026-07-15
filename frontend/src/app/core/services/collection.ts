import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map, timeout } from 'rxjs/operators';
import {
  AddAlbumResponse,
  Collection,
  CollectionsResponse,
  CreateCollectionPayload,
  RemoveAlbumResponse,
} from '../models/collection.model';

@Injectable({
  providedIn: 'root',
})
export class CollectionService {
  private baseUrl = 'http://localhost:8080/api/collections';
  private readonly REQUEST_TIMEOUT_MS = 8000;

  constructor(private http: HttpClient) {}

  // GET /api/collections/me
  //
  // ⚠️ FIX: el error "ctx_r0.lists() is undefined" en Mis Listas pasaba
  // porque, si el backend responde con un shape distinto al esperado
  // (por ejemplo el array de colecciones directo, sin el wrapper
  // { collections: [...] }, o con la key en null), hacíamos
  // `this.lists.set(res.collections)` con `undefined` y el signal se
  // quedaba en undefined para siempre (ya no volvía a [] con nada).
  // Normalizamos acá para que SIEMPRE llegue un array, sin importar
  // cómo responda el backend.
  getMyCollections(): Observable<CollectionsResponse> {
    return this.http
      .get<CollectionsResponse | Collection[]>(`${this.baseUrl}/me`)
      .pipe(
        timeout(this.REQUEST_TIMEOUT_MS),
        map((res) => ({
          collections: Array.isArray(res) ? res : (res?.collections ?? []),
        })),
      );
  }

  // POST /api/collections
  create(payload: CreateCollectionPayload): Observable<Collection> {
    return this.http
      .post<Collection>(this.baseUrl, payload)
      .pipe(timeout(this.REQUEST_TIMEOUT_MS));
  }

  // POST /api/collections/{id}/albums
  addAlbum(collectionId: string, spotifyAlbumId: string): Observable<AddAlbumResponse> {
    return this.http
      .post<AddAlbumResponse>(`${this.baseUrl}/${collectionId}/albums`, { spotifyAlbumId })
      .pipe(timeout(this.REQUEST_TIMEOUT_MS));
  }

  // DELETE /api/collections/{id}/albums/{spotifyAlbumId}
  removeAlbum(collectionId: string, spotifyAlbumId: string): Observable<RemoveAlbumResponse> {
    return this.http
      .delete<RemoveAlbumResponse>(`${this.baseUrl}/${collectionId}/albums/${spotifyAlbumId}`)
      .pipe(timeout(this.REQUEST_TIMEOUT_MS));
  }

  // DELETE /api/collections/{id}
  deleteCollection(collectionId: string): Observable<{ message: string }> {
    return this.http
      .delete<{ message: string }>(`${this.baseUrl}/${collectionId}`)
      .pipe(timeout(this.REQUEST_TIMEOUT_MS));
  }
}