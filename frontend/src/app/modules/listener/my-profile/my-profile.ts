import { Component, OnInit, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { catchError, of } from 'rxjs';
import { AuthService } from '../../../core/services/auth';
import { UserService } from '../../../core/services/user';
import { ReviewService } from '../../../core/services/review';
import { User } from '../../../core/models/user.model';
import { Review } from '../../../core/models/review.model';

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

  badges = [
    { icon: '🎵', name: 'Primera Reseña' },
    { icon: '🔥', name: '50 Reseñas' },
    { icon: '❤️', name: '100 Likes' },
    { icon: '🎯', name: 'Crítica Precisa' },
  ];

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
  }

  private loadStats(userId: string): void {
    // El endpoint /api/auth/me no trae followersCount/followingCount/
    // reviewsCount, así que pedimos el perfil público del propio
    // usuario (GET /api/users/{id}) para completar las estadísticas
    // mostradas en la cabecera.
    this.userService
      .getPublicProfile(userId)
      .pipe(
        catchError(() => {
          // Si falla, se mantienen las estadísticas en 0 sin romper la vista.
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
      });
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