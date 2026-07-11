import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { of, Subject } from 'rxjs';
import { catchError, debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';
import { AlbumService } from '../../../core/services/album';
import { AlbumSearchResult } from '../../../core/models/album.model';

type FilterChip = 'all' | '2020s';

@Component({
  selector: 'app-album-search',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './album-search.html',
  styleUrl: './album-search.scss',
})
export class AlbumSearch implements OnInit, OnDestroy {
  query = '';
  results: AlbumSearchResult[] = [];
  loading = false;
  searched = false;
  errorMessage: string | null = null;

  activeFilter: FilterChip = 'all';

  private queryChanged = new Subject<string>();

  constructor(
    private albumService: AlbumService,
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
            this.loading = false;
            this.searched = false;
            this.results = [];
            // No golpeamos el backend con q="": cortamos con null y lo
            // filtramos en el subscribe de abajo.
            return of(null);
          }
          this.loading = true;
          this.errorMessage = null;
          const year = this.activeFilter === '2020s' ? '2020' : undefined;

          return this.albumService.search(trimmed, undefined, year).pipe(
            // IMPORTANTE: el catchError va DENTRO del switchMap. Si un
            // error de un request individual llegara a explotar hasta
            // el subscribe de abajo, mataría toda la suscripción al
            // Subject y ninguna búsqueda posterior volvería a disparar.
            catchError((err) => {
              this.errorMessage =
                err?.name === 'TimeoutError'
                  ? 'La búsqueda está tardando demasiado. Intenta de nuevo.'
                  : 'No pudimos completar la búsqueda. Intenta de nuevo.';
              this.loading = false;
              return of(null);
            }),
          );
        }),
      )
      .subscribe((res) => {
        if (!res) return; // caso q="" o error, ya manejados arriba
        this.searched = true;
        // El backend real devuelve un array plano (List<AlbumResponse>),
        // no { results: [...] } como documenta el contrato v1.0.
        this.results = res ?? [];
        this.loading = false;
      });
  }

  ngOnDestroy(): void {
    this.queryChanged.complete();
  }

  onQueryInput(value: string): void {
    this.query = value;
    this.queryChanged.next(value);
  }

  selectFilter(filter: FilterChip): void {
    this.activeFilter = filter;
    // Reaplicamos la búsqueda actual con el filtro nuevo (si hay texto).
    if (this.query.trim()) {
      this.queryChanged.next(this.query);
    }
  }

  goToAlbum(album: AlbumSearchResult): void {
    this.router.navigate(['/listener/album', album.spotifyAlbumId]);
  }

  formatRating(album: AlbumSearchResult): string {
    return album.platformRating != null ? `★ ${album.platformRating.toFixed(1)}` : 'Sin reseñas';
  }
}