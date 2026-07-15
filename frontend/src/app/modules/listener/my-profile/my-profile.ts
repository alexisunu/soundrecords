import { Component, OnInit, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { catchError, of } from 'rxjs';
import { timeout } from 'rxjs/operators';
import { AuthService } from '../../../core/services/auth';
import { UserService } from '../../../core/services/user';
import { ReviewService } from '../../../core/services/review';
import { MissionService } from '../../../core/services/mission';
import { User } from '../../../core/models/user.model';
import { Review } from '../../../core/models/review.model';
import { Badge } from '../../../core/models/mission.model';

interface ProfileStats {
  reviews: number;
  followers: number;
  following: number;
  rating: number;
}

@Component({
  selector: 'app-my-profile',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './my-profile.html',
  styleUrls: ['./my-profile.scss'],
})
export class MyProfileComponent implements OnInit {
  // ⚠️ FIX: este componente mutaba propiedades planas (`this.stats = ...`)
  // dentro de un .subscribe(). La app corre Angular zoneless (sin
  // zone.js), así que esa mutación nunca disparaba un re-render: los
  // datos llegaban bien del backend, pero la vista se quedaba pintada
  // con los valores iniciales. Todo lo que se lee en el template ahora
  // va en signals, igual que el resto de los componentes de la app.
  user = signal<User | null>(null);
  loading = signal(true);

  selectedTab = signal<'reviews' | 'lists' | 'likes'>('reviews');

  stats = signal<ProfileStats>({
    reviews: 0,
    followers: 0,
    following: 0,
    rating: 0,
  });
  statsError = signal<string | null>(null);

  // ⚠️ FIX: la bio se leía de user()?.bio, pero GET /api/auth/me (fuente
  // de AuthService.currentUser$) NO devuelve el campo `bio` según el
  // contrato v1.0 (solo id/username/email/role/isPremium/points/level/
  // photoUrl/spotifyLinked) — por eso nunca se veía, ni recién editada.
  // El único endpoint que sí trae bio es GET /api/users/{id} (perfil
  // público), el mismo que ya usábamos para followers/following/reviews.
  bio = signal<string | null>(null);

  // Insignias que el usuario ya compró/desbloqueó. El contrato no tiene
  // un endpoint dedicado tipo "GET /api/missions/badges/me": la única
  // fuente es GET /api/missions/badges/store (la misma que usa la
  // tienda), que trae TODAS las insignias con un flag `owned` por cada
  // una. Aquí solo nos quedamos con las que owned === true.
  badges = signal<Badge[]>([]);
  loadingBadges = signal(true);
  badgesError = signal<string | null>(null);

  reviews = signal<Review[]>([]);
  loadingReviews = signal(false);
  reviewsError = signal<string | null>(null);

  levelProgressPercent = computed(() => {
    const u = this.user();
    if (!u?.points || !u?.level) return 0;
    // El modelo de User no expone "nextLevel" como tal (ver
    // user.model.ts); si no viene, no se puede calcular el progreso.
    const nextLevel = (u as any).nextLevel;
    if (!nextLevel) return 0;
    return Math.min(100, Math.round((u.points / nextLevel) * 100));
  });

  constructor(
    private authService: AuthService,
    private userService: UserService,
    private reviewService: ReviewService,
    private missionService: MissionService,
  ) {}

  ngOnInit(): void {
    this.authService.currentUser$.subscribe({
      next: (currentUser) => {
        this.user.set(currentUser);
        this.loading.set(false);

        if (currentUser?.id) {
          this.loadStats(currentUser.id);
          this.loadReviews(currentUser.id);
        }
      },
      error: () => {
        this.loading.set(false);
      },
    });

    this.loadBadges();
  }

  private loadBadges(): void {
    this.loadingBadges.set(true);
    this.badgesError.set(null);

    this.missionService
      .getBadgesStore()
      .pipe(
        catchError(() => {
          this.badgesError.set('No pudimos cargar tus insignias.');
          return of(null);
        }),
      )
      .subscribe((res) => {
        this.loadingBadges.set(false);
        this.badges.set(res ? res.badges.filter((b) => b.owned) : []);
      });
  }

  private loadStats(userId: string): void {
    // El endpoint /api/auth/me no trae followersCount/followingCount/
    // reviewsCount/bio, así que pedimos el perfil público del propio
    // usuario (GET /api/users/{id}) para completar la cabecera. Antes
    // esta llamada fallaba en silencio (sin timeout ni mensaje visible),
    // así que si el backend tardaba o daba error las stats se quedaban
    // en 0 sin que se notara por qué ("a veces no muestra estadísticas").
    this.statsError.set(null);

    this.userService
      .getPublicProfile(userId)
      .pipe(
        timeout(8000),
        catchError((err) => {
          this.statsError.set(
            err?.name === 'TimeoutError'
              ? 'La carga está tardando demasiado.'
              : 'No pudimos cargar tus estadísticas.',
          );
          return of(null);
        }),
      )
      .subscribe((profile) => {
        if (!profile) return;
        this.stats.set({
          reviews: profile.reviewsCount,
          followers: profile.followersCount,
          following: profile.followingCount,
          rating: this.stats().rating, // no viene en este endpoint; se deja como estaba
        });
        this.bio.set(profile.bio ?? null);
      });
  }

  retryStats(): void {
    const userId = this.user()?.id;
    if (userId) this.loadStats(userId);
  }

  private loadReviews(userId: string): void {
    this.loadingReviews.set(true);
    this.reviewsError.set(null);

    this.reviewService
      .getByUser(userId)
      .pipe(
        catchError(() => {
          this.reviewsError.set('No pudimos cargar tus reseñas.');
          return of(null);
        }),
      )
      .subscribe((res) => {
        this.loadingReviews.set(false);
        this.reviews.set(res?.reviews ?? []);
      });
  }

  selectTab(tab: 'reviews' | 'lists' | 'likes'): void {
    this.selectedTab.set(tab);
  }
}