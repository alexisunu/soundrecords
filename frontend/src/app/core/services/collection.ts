import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { timeout } from 'rxjs/operators';
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
  getMyCollections(): Observable<CollectionsResponse> {
    return this.http
      .get<CollectionsResponse>(`${this.baseUrl}/me`)
      .pipe(timeout(this.REQUEST_TIMEOUT_MS));
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