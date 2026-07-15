import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { timeout } from 'rxjs/operators';
import { MarkAllReadResponse, MarkReadResponse, NotificationsResponse } from '../models/notification.model';

@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  private baseUrl = 'http://localhost:8080/api/notifications';
  private readonly REQUEST_TIMEOUT_MS = 8000;

  constructor(private http: HttpClient) {}

  // GET /api/notifications/me
  getMe(): Observable<NotificationsResponse> {
    return this.http
      .get<NotificationsResponse>(`${this.baseUrl}/me`)
      .pipe(timeout(this.REQUEST_TIMEOUT_MS));
  }

  // PATCH /api/notifications/{id}/read
  markRead(id: string): Observable<MarkReadResponse> {
    return this.http
      .patch<MarkReadResponse>(`${this.baseUrl}/${id}/read`, {})
      .pipe(timeout(this.REQUEST_TIMEOUT_MS));
  }

  // PATCH /api/notifications/read-all
  markAllRead(): Observable<MarkAllReadResponse> {
    return this.http
      .patch<MarkAllReadResponse>(`${this.baseUrl}/read-all`, {})
      .pipe(timeout(this.REQUEST_TIMEOUT_MS));
  }
}