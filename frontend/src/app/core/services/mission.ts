import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { timeout } from 'rxjs/operators';
import { BadgesStoreResponse, MissionsMeResponse, PurchaseBadgeResponse } from '../models/mission.model';

@Injectable({
  providedIn: 'root',
})
export class MissionService {
  private baseUrl = 'http://localhost:8080/api/missions';
  private readonly REQUEST_TIMEOUT_MS = 8000;

  constructor(private http: HttpClient) {}

  // GET /api/missions/me
  getMe(): Observable<MissionsMeResponse> {
    return this.http
      .get<MissionsMeResponse>(`${this.baseUrl}/me`)
      .pipe(timeout(this.REQUEST_TIMEOUT_MS));
  }

  // GET /api/missions/badges/store
  getBadgesStore(): Observable<BadgesStoreResponse> {
    return this.http
      .get<BadgesStoreResponse>(`${this.baseUrl}/badges/store`)
      .pipe(timeout(this.REQUEST_TIMEOUT_MS));
  }

  // POST /api/missions/badges/{badgeId}/purchase
  purchaseBadge(badgeId: string): Observable<PurchaseBadgeResponse> {
    return this.http
      .post<PurchaseBadgeResponse>(`${this.baseUrl}/badges/${badgeId}/purchase`, {})
      .pipe(timeout(this.REQUEST_TIMEOUT_MS));
  }
}