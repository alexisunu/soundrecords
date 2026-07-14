import { Component, OnDestroy, OnInit, signal } from '@angular/core';
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
  // ⚠️ Este proyecto corre Angular en modo zoneless (no hay zone.js en
  // package.json). Mutar propiedades planas dentro de un .subscribe()
  // no dispara change detection ahí — solo signals (o el async pipe)
  // le avisan al framework que hay que repintar. Por eso todo el
  // estado reactivo de este componente va en signals.
  query = signal('');
  results = signal<AlbumSearchResult[]>([]);
  loading = signal(false);
  searched = signal(false);
  errorMessage = signal<string | null>(null);
  activeFilter = signal<FilterChip>('all');

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
            this.loading.set(false);
            this.searched.set(false);
            this.results.set([]);
            // No golpeamos el backend con q="": cortamos con null y lo
            // filtramos en el subscribe de abajo.
            return of(null);
          }
          this.loading.set(true);
          this.errorMessage.set(null);
          const year = this.activeFilter() === '2020s' ? '2020' : undefined;

          return this.albumService.search(trimmed, undefined, year).pipe(
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
        console.log('Respuesta de búsqueda de álbumes:', res);
        if (!res) return; // caso q="" o error, ya manejados arriba
        this.searched.set(true);
        // El backend real devuelve un array plano (List<AlbumResponse>),
        // no { results: [...] } como documenta el contrato v1.0.
        this.results.set(res ?? []);
        this.loading.set(false);
      });
  }

  ngOnDestroy(): void {
    this.queryChanged.complete();
  }

  onQueryInput(value: string): void {
    this.query.set(value);
    this.queryChanged.next(value);
  }

  selectFilter(filter: FilterChip): void {
    this.activeFilter.set(filter);
    // Reaplicamos la búsqueda actual con el filtro nuevo (si hay texto).
    if (this.query().trim()) {
      this.queryChanged.next(this.query());
    }
  }

  goToAlbum(album: AlbumSearchResult): void {
    console.log('Album seleccionado para navegación:', album);
    this.router.navigate(['/listener/album', album.spotifyAlbumId]);
  }

  formatRating(album: AlbumSearchResult): string {
    return album.platformRating != null ? `★ ${album.platformRating.toFixed(1)}` : 'Sin reseñas';
  }
}