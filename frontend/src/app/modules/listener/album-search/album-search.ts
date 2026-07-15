import { Component, OnDestroy, OnInit, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { of, Subject } from 'rxjs';
import { catchError, debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';
import { AlbumService } from '../../../core/services/album';
import { ArtistService } from '../../../core/services/artist';
import { AlbumSearchResult } from '../../../core/models/album.model';
import { DiscoverArtist } from '../../../core/models/artist.model';

type FilterChip = 'albums' | 'artists' | 'users';

@Component({
  selector: 'app-album-search',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './album-search.html',
  styleUrl: './album-search.scss',
})
export class AlbumSearch implements OnInit, OnDestroy {
  // ⚠️ Este proyecto corre Angular en modo zoneless (no hay zone.js en
  // package.json). Mutar propiedades planas dentro de un .subscribe()
  // no dispara change detection ahí — solo signals (o el async pipe)
  // le avisan al framework que hay que repintar. Por eso todo el
  // estado reactivo de este componente va en signals.
  query = signal('');
  activeFilter = signal<FilterChip>('albums');
  loading = signal(false);
  searched = signal(false);
  errorMessage = signal<string | null>(null);

  // ===== Álbumes: GET /api/spotify/search?q=... (real, paginado por texto) =====
  albumResults = signal<AlbumSearchResult[]>([]);

  // ===== Artistas emergentes: GET /api/artists/discover =====
  // El contrato NO documenta ningún parámetro de búsqueda para este
  // endpoint (solo ordena boost/profileViews), así que la lista
  // completa se trae una sola vez y se filtra en el frontend por
  // nombre o género cuando hay texto escrito.
  private allEmergingArtists = signal<DiscoverArtist[] | null>(null);
  artistResults = computed(() => {
    const all = this.allEmergingArtists();
    if (all === null) return [];
    const q = this.query().trim().toLowerCase();
    if (!q) return all;
    return all.filter(
      (a) => a.artistName.toLowerCase().includes(q) || a.genres.toLowerCase().includes(q),
    );
  });

  // ===== Usuarios: sin endpoint en el contrato v1.0 (no existe un
  // GET /api/users/search ni similar entre los 43 endpoints). Se deja
  // el filtro visible para respetar el mockup, con mensaje honesto de
  // "próximamente", igual que se hizo antes con Tendencias/Nuevos
  // lanzamientos en el feed. =====

  private queryChanged = new Subject<string>();

  constructor(
    private albumService: AlbumService,
    private artistService: ArtistService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.queryChanged
      .pipe(
        debounceTime(400),
        distinctUntilChanged(),
        switchMap((q) => {
          const trimmed = q.trim();
          if (!trimmed) {
            this.loading.set(false);
            this.searched.set(false);
            this.albumResults.set([]);
            // No golpeamos el backend con q="": cortamos con null y lo
            // filtramos en el subscribe de abajo.
            return of(null);
          }
          this.loading.set(true);
          this.errorMessage.set(null);

          return this.albumService.search(trimmed).pipe(
            // catchError DENTRO del switchMap: si se propaga hasta el
            // subscribe de abajo, mata toda la suscripción al Subject
            // y ninguna búsqueda posterior vuelve a disparar.
            catchError((err) => {
              this.errorMessage.set(
                err?.name === 'TimeoutError'
                  ? 'La búsqueda está tardando demasiado. Intenta de nuevo.'
                  : 'No pudimos completar la búsqueda. Intenta de nuevo.',
              );
              this.loading.set(false);
              return of(null);
            }),
          );
        }),
      )
      .subscribe((res) => {
        if (!res) return; // caso q="" o error, ya manejados arriba
        this.searched.set(true);
        // El backend real devuelve un array plano (List<AlbumResponse>),
        // no { results: [...] } como documenta el contrato v1.0.
        this.albumResults.set(res ?? []);
        this.loading.set(false);
      });
  }

  ngOnDestroy(): void {
    this.queryChanged.complete();
  }

  onQueryInput(value: string): void {
    this.query.set(value);
    if (this.activeFilter() === 'albums') {
      this.queryChanged.next(value);
    }
    // Para "Artistas emergentes" no hace falta re-pedir nada al backend:
    // artistResults() es un computed() que refiltra allEmergingArtists()
    // en cada tecla. "Usuarios" no tiene datos que filtrar todavía.
  }

  selectFilter(filter: FilterChip): void {
    if (this.activeFilter() === filter) return;
    this.activeFilter.set(filter);
    this.errorMessage.set(null);

    if (filter === 'albums') {
      this.searched.set(false);
      this.albumResults.set([]);
      if (this.query().trim()) this.queryChanged.next(this.query());
      return;
    }

    if (filter === 'artists' && this.allEmergingArtists() === null) {
      this.loadEmergingArtists();
    }
  }

  private loadEmergingArtists(): void {
    this.loading.set(true);
    this.artistService
      .discover()
      .pipe(
        catchError((err) => {
          this.errorMessage.set(
            err?.name === 'TimeoutError'
              ? 'La carga está tardando demasiado. Intenta de nuevo.'
              : 'No pudimos cargar artistas emergentes.',
          );
          this.loading.set(false);
          return of(null);
        }),
      )
      .subscribe((res) => {
        this.loading.set(false);
        if (res) this.allEmergingArtists.set(res.artists);
      });
  }

  goToAlbum(album: AlbumSearchResult): void {
    this.router.navigate(['/listener/album', album.spotifyAlbumId]);
  }

  goToArtist(artist: DiscoverArtist): void {
    this.router.navigate(['/artist', artist.id]);
  }

  formatRating(album: AlbumSearchResult): string {
    return album.platformRating != null ? `★ ${album.platformRating.toFixed(1)}` : 'Sin reseñas';
  }
}