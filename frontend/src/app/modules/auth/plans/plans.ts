import { Component, OnInit, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { catchError, of, switchMap } from 'rxjs';
import { PaymentService } from '../../../core/services/payment';
import { ArtistService } from '../../../core/services/artist';
import { AuthService } from '../../../core/services/auth';
import { PaymentPlan, PlanCode } from '../../../core/models/payment.model';
import { User } from '../../../core/models/user.model';

type PayMethod = 'CARD' | 'PAYPAL';

// ⚠️ El contrato dice explícitamente que este endpoint está "simulado
// para el MVP universitario --- no se integra pasarela real de pago".
// Por eso no hay validación real de tarjeta (Luhn, expiración, etc.):
// los campos vienen prellenados con datos de prueba, igual que en el
// mockup (VISTA 11), y el "cardToken" que se manda al backend es un
// valor inventado en el cliente (tok_sim_...), tal como lo hace
// Stripe/PayPal en un entorno de test.
@Component({
  selector: 'app-plans',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './plans.html',
  styleUrl: './plans.scss',
})
export class Plans implements OnInit {
  // ----- Planes -----
  plans = signal<PaymentPlan[]>([]);
  loadingPlans = signal(true);
  errorPlans = signal<string | null>(null);

  selectedPlanCode = signal<PlanCode>('ARTIST_PREMIUM');
  billingAnnual = signal(true);
  paymentMethod = signal<PayMethod>('CARD');

  // Campos de tarjeta: solo de vista, prellenados con datos de prueba
  // (nunca se validan ni se envían tal cual al backend).
  cardNumber = signal('4242 4242 4242 4242');
  cardExpiry = signal('08/29');
  cardCvv = signal('123');
  cardName = signal('');

  currentUser = signal<User | null>(null);

  step = signal<'form' | 'success'>('form');
  submitting = signal(false);
  submitError = signal<string | null>(null);

  selectablePlans = computed(() => this.plans().filter((p) => p.code !== 'FREE'));

  selectedPlan = computed<PaymentPlan | undefined>(() =>
    this.plans().find((p) => p.code === this.selectedPlanCode()),
  );

  // El contrato solo da un precio mensual por plan (sin tarifa anual
  // explícita). El toggle "facturación anual" es presentación pura en
  // el cliente: 10 meses en vez de 12 (2 meses gratis), como dice el
  // mockup. No se manda ningún campo de periodo al backend porque
  // POST /api/payments/subscribe no lo contempla.
  totalToday = computed(() => {
    const monthly = this.selectedPlan()?.price ?? 0;
    return this.billingAnnual() ? Math.round(monthly * 10 * 100) / 100 : monthly;
  });

  monthlyEquivalent = computed(() => {
    const monthly = this.selectedPlan()?.price ?? 0;
    return this.billingAnnual() ? Math.round((monthly * 10 * 100) / 12) / 100 : monthly;
  });

  annualSavings = computed(() => {
    const monthly = this.selectedPlan()?.price ?? 0;
    return Math.round(monthly * 2 * 100) / 100;
  });

  isArtistPlan = computed(() => this.selectedPlanCode() === 'ARTIST_PREMIUM');
  alreadyArtist = computed(() => this.currentUser()?.role === 'ARTIST');

  constructor(
    private paymentService: PaymentService,
    private artistService: ArtistService,
    private authService: AuthService,
    private route: ActivatedRoute,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.authService.currentUser$.subscribe((user) => {
      this.currentUser.set(user);
      if (user && !this.cardName()) {
        this.cardName.set(user.username.toUpperCase());
      }
    });

    // Si llega desde Configuración > Planes con ?plan=ARTIST_PREMIUM
    // (o LISTENER_PREMIUM), preseleccionamos ese plan.
    const requested = this.route.snapshot.queryParamMap.get('plan');
    if (requested === 'ARTIST_PREMIUM' || requested === 'LISTENER_PREMIUM') {
      this.selectedPlanCode.set(requested);
    }

    this.loadPlans();
  }

  private loadPlans(): void {
    this.loadingPlans.set(true);
    this.errorPlans.set(null);

    this.paymentService
      .getPlans()
      .pipe(
        catchError((err) => {
          this.errorPlans.set(
            err?.name === 'TimeoutError'
              ? 'La carga está tardando demasiado. Intenta de nuevo.'
              : 'No pudimos cargar los planes disponibles.',
          );
          return of(null);
        }),
      )
      .subscribe((res) => {
        this.loadingPlans.set(false);
        if (res) this.plans.set(res.plans);
      });
  }

  selectPlan(code: PlanCode): void {
    this.selectedPlanCode.set(code);
  }

  selectMethod(method: PayMethod): void {
    this.paymentMethod.set(method);
  }

  toggleBilling(): void {
    this.billingAnnual.update((v) => !v);
  }

  pay(): void {
    const plan = this.selectedPlanCode();
    if (!plan || this.submitting()) return;

    this.submitting.set(true);
    this.submitError.set(null);

    // Simulación de token de pasarela: el backend no valida la tarjeta,
    // solo espera un string en cardToken.
    const cardToken = `tok_sim_${Date.now()}`;

    this.paymentService
      .subscribe({ planCode: plan, paymentMethod: this.paymentMethod(), cardToken })
      .pipe(
        catchError((err) => {
          const msg =
            err?.status === 400
              ? 'El pago fue rechazado (simulado). Intenta con otro método.'
              : err?.name === 'TimeoutError'
                ? 'El pago está tardando demasiado. Intenta de nuevo.'
                : 'No pudimos procesar el pago. Intenta de nuevo.';
          this.submitError.set(msg);
          return of(null);
        }),
        switchMap((paymentRes) => {
          if (!paymentRes) return of(null); // el pago ya falló arriba, no seguimos

          // Convertirse en artista es una operación aparte del pago
          // (POST /api/artists), pero el usuario pidió que "pagar" ya
          // lo deje como artista, así que la encadenamos aquí cuando
          // el plan elegido es Artista Premium y todavía no lo es.
          if (plan === 'ARTIST_PREMIUM' && !this.alreadyArtist()) {
            const username = this.currentUser()?.username ?? 'Nuevo artista';
            return this.artistService
              .becomeArtist({
                artistName: username,
                biography: `Perfil de artista de ${username} en SoundRecords.`,
                genres: 'Sin especificar',
                spotifyUrl: '',
              })
              .pipe(
                catchError((err) => {
                  // 409 = ya tenía perfil de artista (carrera con otra
                  // pestaña, doble clic, etc.): no es un error real
                  // para el usuario, el pago sí se cobró bien.
                  if (err?.status !== 409) {
                    this.submitError.set('El pago se procesó, pero no pudimos activar tu perfil de artista.');
                  }
                  return of(null);
                }),
              );
          }
          return of(paymentRes);
        }),
      )
      .subscribe(() => {
        this.submitting.set(false);
        if (this.submitError()) return;

        // Refrescamos el usuario global (rol, isPremium, nivel) para
        // que el sidebar y el resto de la app reflejen el cambio.
        this.authService.loadCurrentUser().subscribe();
        this.step.set('success');
      });
  }

  goToProfile(): void {
    this.router.navigate(['/listener/my-profile']);
  }
}