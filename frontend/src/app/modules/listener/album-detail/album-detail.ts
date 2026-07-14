import { Component, OnDestroy, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { Subscription } from 'rxjs';
import { AlbumService } from '../../../core/services/album';
import { ReviewService } from '../../../core/services/review';
import { CollectionService } from '../../../core/services/collection';
import { AlbumDetail as AlbumDetailModel } from '../../../core/models/album.model';
import { Review } from '../../../core/models/review.model';
import { Collection } from '../../../core/models/collection.model';
import { ReviewCard } from '../../../shared/review-card/review-card';
import { StarRating } from '../../../shared/star-rating/star-rating';

@Component({
  selector: 'app-album-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, ReviewCard, StarRating],
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

  // --- "Guardar en lista" ---------------------------------------
  // ⚠️ El contrato no expone qué álbumes tiene cada lista (ver nota en
  // collection.model.ts), así que no podemos marcar de entrada "esta
  // lista ya tiene este álbum". Solo reflejamos lo que el usuario
  // agrega DURANTE esta sesión (addedListIds), no un estado persistido
  // real recuperado del backend.
  showListPicker = signal(false);
  myCollections = signal<Collection[]>([]);
  loadingCollections = signal(false);
  pickerError = signal<string | null>(null);
  addingToListId = signal<string | null>(null);
  addedListIds = signal<Set<string>>(new Set());

  newListName = signal('');
  creatingList = signal(false);

  constructor(
    private route: ActivatedRoute,
    private albumService: AlbumService,
    private reviewService: ReviewService,
    private collectionService: CollectionService,
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
    this.showListPicker.set(false);
    this.addedListIds.set(new Set());

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

  toggleListPicker(): void {
    const next = !this.showListPicker();
    this.showListPicker.set(next);
    if (next && this.myCollections().length === 0) {
      this.loadCollections();
    }
  }

  private loadCollections(): void {
    this.loadingCollections.set(true);
    this.pickerError.set(null);
    this.collectionService.getMyCollections().subscribe({
      next: (res) => {
        this.myCollections.set(res.collections);
        this.loadingCollections.set(false);
      },
      error: () => {
        this.pickerError.set('No pudimos cargar tus listas.');
        this.loadingCollections.set(false);
      },
    });
  }

  addToList(collection: Collection): void {
    const album = this.album();
    if (!album || this.addingToListId()) return;

    this.addingToListId.set(collection.id);
    this.collectionService.addAlbum(collection.id, album.spotifyAlbumId).subscribe({
      next: () => {
        this.addingToListId.set(null);
        this.markAsAdded(collection.id);
      },
      error: (err) => {
        this.addingToListId.set(null);
        if (err?.status === 409) {
          // Ya estaba en la lista: para el usuario es el mismo
          // resultado que "agregar", así que lo marcamos igual.
          this.markAsAdded(collection.id);
          return;
        }
        this.pickerError.set('No pudimos agregar el álbum a esta lista.');
      },
    });
  }

  private markAsAdded(collectionId: string): void {
    const updated = new Set(this.addedListIds());
    updated.add(collectionId);
    this.addedListIds.set(updated);
  }

  createListAndAdd(): void {
    const name = this.newListName().trim();
    const album = this.album();
    if (!name || !album || this.creatingList()) return;

    this.creatingList.set(true);
    this.pickerError.set(null);

    this.collectionService.create({ name }).subscribe({
      next: (created) => {
        this.myCollections.update((current) => [created, ...current]);
        this.newListName.set('');
        this.creatingList.set(false);
        this.addToList(created);
      },
      error: () => {
        this.creatingList.set(false);
        this.pickerError.set('No pudimos crear la lista.');
      },
    });
  }
}