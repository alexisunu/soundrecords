import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Subscription } from 'rxjs';
import { ReviewCard } from '../../../shared/review-card/review-card';
import { ReviewService } from '../../../core/services/review';
import { Review } from '../../../core/models/review.model';
import { AuthService } from '../../../core/services/auth';

type FeedTab = 'following' | 'trending' | 'new-releases';

@Component({
  selector: 'app-feed',
  standalone: true,
  imports: [CommonModule, RouterModule, ReviewCard],
  templateUrl: './feed.html',
  styleUrl: './feed.scss',
})
export class Feed implements OnInit, OnDestroy {
  reviews: Review[] = [];
  loading = true;
  errorMessage: string | null = null;
  page = 0;
  hasMore = false;

  activeTab: FeedTab = 'following';

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

  selectTab(tab: FeedTab): void {
    this.activeTab = tab;
    if (tab === 'following') {
      this.loadFeed(0);
    }
    // "Tendencias" y "Nuevos lanzamientos" no tienen endpoint todavía en el
    // API Contract v1.0 (solo existe GET /api/reviews/feed). Se dejan las
    // pestañas visibles para respetar el mockup, pero sin datos reales
    // hasta que el backend defina esas rutas.
  }

  loadFeed(page: number): void {
    this.loading = true;
    this.errorMessage = null;
    this.reviewService.getFeed(page).subscribe({
      next: (res) => {
        this.reviews = res.reviews;
        this.page = res.page;
        this.hasMore = res.hasMore;
        this.loading = false;
      },
      error: () => {
        this.errorMessage = 'No pudimos cargar tu feed. Intenta de nuevo.';
        this.loading = false;
      },
    });
  }

  goToPage(page: number): void {
    if (page < 0) return;
    if (page > this.page && !this.hasMore) return;
    this.loadFeed(page);
  }

  get pageNumbers(): number[] {
    // La API solo retorna hasMore (no un total de páginas), así que
    // mostramos la página actual y, si hay más, la siguiente conocida.
    const nums = [this.page];
    if (this.hasMore) nums.push(this.page + 1);
    return nums;
  }
}
