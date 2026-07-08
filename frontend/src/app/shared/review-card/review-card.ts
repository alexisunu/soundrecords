import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StarRating } from '../star-rating/star-rating';
import { Review, ReportReason } from '../../core/models/review.model';
import { ReviewService } from '../../core/services/review';
import { UserService } from '../../core/services/user';

interface ReportReasonOption {
  value: ReportReason;
  label: string;
}

const REPORT_REASONS: ReportReasonOption[] = [
  { value: 'SPAM', label: 'Spam' },
  { value: 'OFFENSIVE_LANGUAGE', label: 'Lenguaje ofensivo' },
  { value: 'FALSE_CONTENT', label: 'Contenido falso' },
  { value: 'HARASSMENT', label: 'Acoso' },
  { value: 'OTHER', label: 'Otro' },
];

@Component({
  selector: 'app-review-card',
  standalone: true,
  imports: [CommonModule, StarRating],
  templateUrl: './review-card.html',
  styleUrl: './review-card.scss',
})
export class ReviewCard {
  @Input({ required: true }) review!: Review;

  reportReasons = REPORT_REASONS;
  showReportMenu = false;
  reportSent = false;
  likeInFlight = false;
  followInFlight = false;

  constructor(
    private reviewService: ReviewService,
    private userService: UserService,
  ) {}

  get isFollowing(): boolean {
    // Ver nota en review.model.ts: si el backend no manda isFollowedByMe,
    // se asume que sí lo sigues (el feed "Siguiendo" debería ser justo eso).
    return this.review.user?.isFollowedByMe !== false;
  }

  get timeAgo(): string {
    const diffMs = Date.now() - new Date(this.review.createdAt).getTime();
    const minutes = Math.floor(diffMs / 60000);
    if (minutes < 1) return 'justo ahora';
    if (minutes < 60) return `hace ${minutes} min`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `hace ${hours} h`;
    const days = Math.floor(hours / 24);
    return `hace ${days} d`;
  }

  toggleLike(): void {
    if (this.likeInFlight) return;
    this.likeInFlight = true;
    this.reviewService.toggleLike(this.review.id).subscribe({
      next: (res) => {
        this.review.likedByMe = res.liked;
        this.review.likesCount = res.likesCount;
        this.likeInFlight = false;
      },
      error: () => (this.likeInFlight = false),
    });
  }

  toggleFollow(): void {
    if (this.followInFlight || !this.review.user?.id) return;
    this.followInFlight = true;
    const action$ = this.isFollowing
      ? this.userService.unfollow(this.review.user.id)
      : this.userService.follow(this.review.user.id);

    action$.subscribe({
      next: (res) => {
        this.review.user.isFollowedByMe = res.following;
        this.followInFlight = false;
      },
      error: () => (this.followInFlight = false),
    });
  }

  toggleReportMenu(): void {
    if (this.reportSent) return;
    this.showReportMenu = !this.showReportMenu;
  }

  sendReport(reason: ReportReason): void {
    this.showReportMenu = false;
    this.reviewService.report(this.review.id, reason).subscribe({
      next: () => (this.reportSent = true),
      // Si ya la había reportado antes (409) igual la marcamos como enviada
      // en la UI para no dejar el botón dando vueltas.
      error: () => (this.reportSent = true),
    });
  }

  goToAlbum(): void {
    if (!this.review.spotifyAlbumId) {
      // El contrato v1.0 no incluye spotifyAlbumId en /api/reviews/feed,
      // así que todavía no hay forma de armar el link al detalle del álbum.
      console.warn(
        '[ReviewCard] Falta spotifyAlbumId en esta reseña; pedir a backend que lo agregue al feed.',
      );
      return;
    }
    // TODO: navegar cuando exista la ruta de detalle de álbum registrada
    // en app.routes.ts (el componente AlbumDetail todavía es un stub).
  }
}
