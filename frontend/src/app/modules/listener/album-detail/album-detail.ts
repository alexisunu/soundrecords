import { Component, OnDestroy, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { Subscription } from 'rxjs';
import { AlbumService } from '../../../core/services/album';
import { ReviewService } from '../../../core/services/review';
import { AlbumDetail as AlbumDetailModel } from '../../../core/models/album.model';
import { Review } from '../../../core/models/review.model';
import { ReviewCard } from '../../../shared/review-card/review-card';
import { StarRating } from '../../../shared/star-rating/star-rating';

@Component({
  selector: 'app-album-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, ReviewCard, StarRating],
  templateUrl: './album-detail.html',
  styleUrl: './album-detail.scss',
})
export class AlbumDetail implements OnInit, OnDestroy {
  // ⚠️ Angular zoneless (no hay zone.js en package.json): mutar
  // propiedades planas dentro de un .subscribe() no dispara render.
  // Todo el estado que se lee en el template va en signals.
  album = signal<AlbumDetailModel | null>(null);
  reviews = signal<Review[]>([]);
  averageRating = signal<number | null>(null);
  totalReviews = signal(0);
  myReview = signal<Review | null>(null);

  loadingAlbum = signal(true);
  loadingReviews = signal(true);
  albumError = signal<string | null>(null);

  private paramsSub?: Subscription;

  constructor(
    private route: ActivatedRoute,
    private albumService: AlbumService,
    private reviewService: ReviewService,
  ) {}

  ngOnInit(): void {
    // paramMap por si algún día se navega de un álbum a otro sin
    // recrear el componente (p. ej. desde tracklist de otra vista).
    this.paramsSub = this.route.paramMap.subscribe((params) => {
      const id = params.get('id');
      if (id) this.loadAlbum(id);
    });
  }

  ngOnDestroy(): void {
    this.paramsSub?.unsubscribe();
  }

  private loadAlbum(spotifyAlbumId: string): void {
    this.loadingAlbum.set(true);
    this.loadingReviews.set(true);
    this.albumError.set(null);
    this.album.set(null);
    this.reviews.set([]);

    this.albumService.getById(spotifyAlbumId).subscribe({
      next: (album) => {
        this.album.set(album);
        this.loadingAlbum.set(false);
      },
      error: (err) => {
        this.albumError.set(
          err?.name === 'TimeoutError'
            ? 'La carga está tardando demasiado. Intenta de nuevo.'
            : 'No pudimos cargar este álbum. Puede que ya no exista en Spotify.',
        );
        this.loadingAlbum.set(false);
      },
    });

    this.reviewService.getAlbumReviews(spotifyAlbumId).subscribe({
      next: (res) => {
        this.reviews.set(res.reviews);
        // averageRating puede ser null si no hay reseñas
        this.averageRating.set(res.averageRating ?? null);
        this.totalReviews.set(res.totalReviews ?? 0);
        this.myReview.set(res.myReview ?? null);
        this.loadingReviews.set(false);
      },
      error: () => {
        // Si esto falla igual mostramos el álbum; simplemente la
        // sección de reseñas queda vacía. (Nota: este endpoint hoy
        // está devolviendo 403 en el backend, hay que revisar el
        // SecurityConfig de /api/reviews/album/** con Alexis.)
        this.loadingReviews.set(false);
      },
    });
  }

  get tracklist(): string[] {
    return this.album()?.tracklist ?? [];
  }

  get formattedRating(): string {
    const rating = this.album()?.platformRating ?? this.averageRating();
    // rating puede ser null o 0; queremos '—' sólo si null
    return rating == null ? '—' : rating.toFixed(1);
  }
}