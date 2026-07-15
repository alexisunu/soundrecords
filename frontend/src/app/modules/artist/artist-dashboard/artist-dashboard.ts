import { Component, OnDestroy, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Subscription } from 'rxjs';

import { ArtistService } from '../../../core/services/artist';
import { AuthService } from '../../../core/services/auth';
import { ArtistDashboard as ArtistDashboardData } from '../../../core/models/artist.model';
import { User } from '../../../core/models/user.model';

@Component({
  selector: 'app-artist-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './artist-dashboard.html',
  styleUrl: './artist-dashboard.scss',
})
export class ArtistDashboard implements OnInit, OnDestroy {
  // ⚠️ Zoneless: todo lo que se lee en el template va en signals.
  currentUser = signal<User | null>(null);

  dashboard = signal<ArtistDashboardData | null>(null);
  loadingDashboard = signal(true);
  dashboardError = signal<string | null>(null);
  notAnArtist = signal(false);

  // Boost: el contrato no expone el estado actual en ningún GET (ver
  // nota en artist.model.ts), así que esto solo refleja la última
  // acción hecha en esta sesión, no un estado persistido conocido.
  boostActive = signal<boolean | null>(null);
  boostInFlight = signal(false);
  boostError = signal<string | null>(null);

  private userSub?: Subscription;

  maxWeeklyViews = computed(() => {
    const weeks = this.dashboard()?.advancedStats?.weeklyViews ?? [];
    return weeks.length ? Math.max(...weeks) : 0;
  });

  constructor(
    private artistService: ArtistService,
    private authService: AuthService,
  ) {}

  ngOnInit(): void {
    this.userSub = this.authService.currentUser$.subscribe((user) => {
      this.currentUser.set(user);
    });
    this.loadDashboard();
  }

  ngOnDestroy(): void {
    this.userSub?.unsubscribe();
  }

  private loadDashboard(): void {
    this.loadingDashboard.set(true);
    this.dashboardError.set(null);
    this.notAnArtist.set(false);

    this.artistService.getDashboard().subscribe({
      next: (dashboard) => {
        this.dashboard.set(dashboard);
        this.loadingDashboard.set(false);
      },
      error: (err) => {
        this.loadingDashboard.set(false);
        if (err?.status === 403) {
          // El contrato documenta 403 cuando el usuario no tiene role
          // ARTIST — no es un error real, es que este panel no es para
          // esta cuenta.
          this.notAnArtist.set(true);
          return;
        }
        this.dashboardError.set(
          err?.name === 'TimeoutError'
            ? 'La carga está tardando demasiado. Intenta de nuevo.'
            : 'No pudimos cargar tu dashboard. Intenta de nuevo en un momento.',
        );
      },
    });
  }

  barHeightPct(value: number): number {
    const max = this.maxWeeklyViews();
    if (!max) return 0;
    return Math.round((value / max) * 100);
  }

  formattedRating(rating: number | null | undefined): string {
    return rating == null ? '—' : rating.toFixed(1);
  }

  toggleBoost(): void {
    const dashboard = this.dashboard();
    if (!dashboard?.isPremium || this.boostInFlight()) return;

    // Si no sabemos el estado actual (primera acción de la sesión),
    // asumimos que el usuario quiere activarlo.
    const nextActive = !(this.boostActive() ?? false);

    this.boostInFlight.set(true);
    this.boostError.set(null);

    this.artistService.setBoost(nextActive).subscribe({
      next: (res) => {
        this.boostActive.set(res.boostActive);
        this.boostInFlight.set(false);
      },
      error: (err) => {
        this.boostInFlight.set(false);
        this.boostError.set(
          err?.status === 403
            ? 'Tu plan actual no incluye Boost de visibilidad.'
            : 'No pudimos actualizar el Boost. Intenta de nuevo.',
        );
      },
    });
  }
}
