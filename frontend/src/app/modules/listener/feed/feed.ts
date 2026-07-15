import { Component, OnDestroy, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Subscription } from 'rxjs';
import { ReviewCard } from '../../../shared/review-card/review-card';
import { ReviewService } from '../../../core/services/review';
import { Review } from '../../../core/models/review.model';
import { AuthService } from '../../../core/services/auth';

@Component({
  selector: 'app-feed',
  standalone: true,
  imports: [CommonModule, RouterModule, ReviewCard],
  templateUrl: './feed.html',
  styleUrl: './feed.scss',
})
export class Feed implements OnInit, OnDestroy {
  // Usamos signals (en vez de propiedades planas) porque la app corre en
  // modo zoneless: las respuestas HTTP llegan fuera de cualquier evento de
  // plantilla, así que solo un write a un signal (o un ChangeDetectorRef
  // manual) garantiza que Angular repinte la vista. Antes, al asignar
  // "this.reviews = res.reviews" en el subscribe, la vista quedaba
  // desactualizada hasta el próximo clic en la página.
  reviews = signal<Review[]>([]);
  loading = signal(true);
  errorMessage = signal<string | null>(null);
  page = signal(0);
  hasMore = signal(false);

  private userSub?: Subscription;

  constructor(
    private reviewService: ReviewService,
    private authService: AuthService,
  ) {}

  ngOnInit(): void {
    // Aseguramos que haya un usuario cargado (por si se entra directo a
    // /listener/feed con un token en localStorage pero sin pasar por login).
    this.userSub = this.authService.currentUser$.subscribe();
    this.loadFeed(0);
  }

  ngOnDestroy(): void {
    this.userSub?.unsubscribe();
  }

  loadFeed(page: number): void {
    this.loading.set(true);
    this.errorMessage.set(null);
    this.reviewService.getFeed(page).subscribe({
      next: (res) => {
        this.reviews.set(res.reviews);
        this.page.set(res.page);
        this.hasMore.set(res.hasMore);
        this.loading.set(false);
      },
      error: () => {
        this.errorMessage.set('No pudimos cargar tu feed. Intenta de nuevo.');
        this.loading.set(false);
      },
    });
  }

  goToPage(page: number): void {
    if (page < 0) return;
    if (page > this.page() && !this.hasMore()) return;
    this.loadFeed(page);
  }

  get pageNumbers(): number[] {
    // La API solo retorna hasMore (no un total de páginas), así que
    // mostramos la página actual y, si hay más, la siguiente conocida.
    const nums = [this.page()];
    if (this.hasMore()) nums.push(this.page() + 1);
    return nums;
  }
}