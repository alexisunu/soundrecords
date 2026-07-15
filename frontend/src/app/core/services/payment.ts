import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { timeout } from 'rxjs/operators';
import { PaymentPlansResponse, SubscribeRequest, SubscribeResponse } from '../models/payment.model';

@Injectable({
  providedIn: 'root',
})
export class PaymentService {
  private baseUrl = 'http://localhost:8080/api/payments';
  private readonly REQUEST_TIMEOUT_MS = 8000;

  constructor(private http: HttpClient) {}

  // GET /api/payments/plans — pública
  getPlans(): Observable<PaymentPlansResponse> {
    return this.http
      .get<PaymentPlansResponse>(`${this.baseUrl}/plans`)
      .pipe(timeout(this.REQUEST_TIMEOUT_MS));
  }

  // POST /api/payments/subscribe — simulado, sin pasarela real
  subscribe(body: SubscribeRequest): Observable<SubscribeResponse> {
    return this.http
      .post<SubscribeResponse>(`${this.baseUrl}/subscribe`, body)
      .pipe(timeout(this.REQUEST_TIMEOUT_MS));
  }
}