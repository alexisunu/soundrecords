import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { of, Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';
import { AlbumService } from '../../../core/services/album';
import { AlbumSearchResult } from '../../../core/models/album.model';

type FilterChip = 'all' | '2020s';

@Component({
  selector: 'app-album-search',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './album-search.html',
  styleUrl: './album-search.scss',
  providers: [AlbumService]
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
          return this.albumService.search(trimmed, undefined, year);
        }),
      )
      .subscribe({
        next: (res) => {
          if (!res) return; // caso q="" ya manejado arriba
          this.searched = true;
          this.results = res.results ?? [];
          this.loading = false;
        },
        error: () => {
          this.errorMessage = 'No pudimos completar la búsqueda. Intenta de nuevo.';
          this.loading = false;
        },
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