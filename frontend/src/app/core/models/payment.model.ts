/**
 * Coincide con las respuestas de PaymentController (/api/payments) del
 * API Contract v1.0. Simulado para el MVP: no hay pasarela real, el
 * backend solo marca is_premium=true en BD.
 */

export type PlanCode = 'FREE' | 'LISTENER_PREMIUM' | 'ARTIST_PREMIUM';

export interface PaymentPlan {
  code: PlanCode;
  name: string;
  price: number;
}

export interface PaymentPlansResponse {
  plans: PaymentPlan[];
}

export type PaymentMethod = 'CARD' | 'PAYPAL';

export interface SubscribeRequest {
  planCode: PlanCode;
  paymentMethod: PaymentMethod;
  cardToken: string;
}

export interface SubscribeResponse {
  message: string;
  isPremium: boolean;
  planCode: PlanCode;
}