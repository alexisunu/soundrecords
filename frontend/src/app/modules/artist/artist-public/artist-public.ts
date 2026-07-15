import { Component, OnDestroy, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { Subscription, forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { ArtistService } from '../../../core/services/artist';
import { AlbumService } from '../../../core/services/album';
import { ReviewService } from '../../../core/services/review';
import { UserService } from '../../../core/services/user';
import { ArtistPublicProfile } from '../../../core/models/artist.model';
import { Review } from '../../../core/models/review.model';
import { ReviewCard } from '../../../shared/review-card/review-card';

type ArtistTab = 'discog' | 'reviews' | 'about';

/**
 * Item de discografía ya enriquecido con lo que trae la ficha de
 * Spotify (GET /api/spotify/albums/{id}), que el endpoint de artista
 * no incluye: año y rating de la plataforma.
 */
interface DiscogCardVm {
  spotifyAlbumId: string;
  name: string;
  coverUrl?: string;
  releaseYear?: string | number | null;
  platformRating?: number | null;
}

@Component({
  selector: 'app-artist-public',
  standalone: true,
  imports: [CommonModule, RouterModule, ReviewCard],
  templateUrl: './artist-public.html',
  styleUrl: './artist-public.scss',
})
export class ArtistPublic implements OnInit, OnDestroy {
  // ⚠️ Zoneless (sin zone.js): todo lo que se lee en el template va en
  // signals, nunca mutación de propiedades planas dentro de subscribe().
  artist = signal<ArtistPublicProfile | null>(null);
  loadingArtist = signal(true);
  artistError = signal<string | null>(null);

  activeTab = signal<ArtistTab>('discog');

  discography = signal<DiscogCardVm[]>([]);
  loadingDiscography = signal(false);

  recentReviews = signal<Review[]>([]);
  loadingReviews = signal(false);

  isFollowing = signal(false);
  followInFlight = signal(false);

  copied = signal(false);

  private paramsSub?: Subscription;

  // Calificación promedio y total de reseñas: el contrato de
  // GET /api/artists/{id} no los expone, así que se calculan del lado
  // del frontend a partir de las fichas de cada álbum de la
  // discografía (mismo dato que se ve en el álbum-detail).
  averageRating = computed<number | null>(() => {
    const rated = this.discography().filter((a) => a.platformRating != null);
    if (!rated.length) return null;
    const sum = rated.reduce((acc, a) => acc + (a.platformRating ?? 0), 0);
    return sum / rated.length;
  });

  hasAnyRating = computed(() => this.averageRating() != null);

  constructor(
    private route: ActivatedRoute,
    private artistService: ArtistService,
    private albumService: AlbumService,
    private reviewService: ReviewService,
    private userService: UserService,
  ) {}

  ngOnInit(): void {
    this.paramsSub = this.route.paramMap.subscribe((params) => {
      const id = params.get('id');
      if (id) this.loadArtist(id);
    });
  }

  ngOnDestroy(): void {
    this.paramsSub?.unsubscribe();
  }

  private loadArtist(id: string): void {
    this.loadingArtist.set(true);
    this.artistError.set(null);
    this.artist.set(null);
    this.discography.set([]);
    this.recentReviews.set([]);
    this.activeTab.set('discog');

    this.artistService.getById(id).subscribe({
      next: (artist) => {
        this.artist.set(artist);
        this.isFollowing.set(artist.isFollowedByMe);
        this.loadingArtist.set(false);
        this.loadDiscographyDetails(artist);
      },
      error: (err) => {
        this.artistError.set(
          err?.name === 'TimeoutError'
            ? 'La carga está tardando demasiado. Intenta de nuevo.'
            : 'No pudimos cargar este artista. Puede que ya no exista.',
        );
        this.loadingArtist.set(false);
      },
    });
  }

  /**
   * Enriquece cada álbum de la discografía con año/rating (Spotify) y
   * junta las reseñas de todos sus álbumes para la pestaña "Reseñas".
   * Cada llamada individual tiene su propio catchError para que un
   * álbum roto no tumbe el resto (forkJoin cortaría todo si no).
   */
  private loadDiscographyDetails(artist: ArtistPublicProfile): void {
    const items = artist.discography ?? [];
    if (!items.length) {
      this.discography.set([]);
      this.recentReviews.set([]);
      return;
    }

    this.loadingDiscography.set(true);
    this.loadingReviews.set(true);

    const detailCalls = items.map((item) =>
      this.albumService.getById(item.spotifyAlbumId).pipe(catchError(() => of(null))),
    );
    const reviewCalls = items.map((item) =>
      this.reviewService.getAlbumReviews(item.spotifyAlbumId).pipe(catchError(() => of(null))),
    );

    forkJoin(detailCalls).subscribe((details) => {
      const cards: DiscogCardVm[] = items.map((item, i) => {
        const detail = details[i];
        return {
          spotifyAlbumId: item.spotifyAlbumId,
          name: item.name,
          coverUrl: item.coverUrl,
          releaseYear: detail?.releaseYear ?? null,
          platformRating: detail?.platformRating ?? null,
        };
      });
      this.discography.set(cards);
      this.loadingDiscography.set(false);
    });

    forkJoin(reviewCalls).subscribe((results) => {
      const merged: Review[] = results
        .filter((r): r is NonNullable<typeof r> => r !== null)
        .flatMap((r) => r.reviews);
      merged.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      this.recentReviews.set(merged.slice(0, 10));
      this.loadingReviews.set(false);
    });
  }

  switchTab(tab: ArtistTab): void {
    this.activeTab.set(tab);
  }

  get genreTags(): string[] {
    const genres = this.artist()?.genres ?? '';
    return genres
      .split(',')
      .map((g) => g.trim())
      .filter(Boolean);
  }

  formattedRating(rating: number | null | undefined): string {
    return rating == null ? '—' : rating.toFixed(1);
  }

  toggleFollow(): void {
    const artist = this.artist();
    if (!artist || this.followInFlight()) return;

    // ⚠️ Asunción: el "id" que devuelve GET /api/artists/{id} se usa
    // directamente contra POST/DELETE /api/users/{id}/follow (el
    // contrato dice que ese endpoint sirve "para seguir a un usuario o
    // artista"). Si el backend termina usando un id de artista distinto
    // al id de usuario para esto, hay que confirmarlo con Alexis y
    // ajustar aquí.
    this.followInFlight.set(true);
    const wasFollowing = this.isFollowing();
    const call = wasFollowing
      ? this.userService.unfollow(artist.id)
      : this.userService.follow(artist.id);

    call.subscribe({
      next: (res) => {
        this.isFollowing.set(res.following);
        this.followInFlight.set(false);
      },
      error: () => {
        // Si falla dejamos el estado como estaba, sin optimistic update.
        this.followInFlight.set(false);
      },
    });
  }

  copyProfileLink(): void {
    const url = window.location.href;
    navigator.clipboard
      .writeText(url)
      .then(() => {
        this.copied.set(true);
        setTimeout(() => this.copied.set(false), 2000);
      })
      .catch(() => {
        // Silencioso: si el navegador bloquea el acceso al portapapeles
        // no hay mucho más que hacer desde acá.
      });
  }
}
