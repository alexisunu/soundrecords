import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { catchError, of } from 'rxjs';
import { AlbumService } from '../../../core/services/album';
import { AlbumSearchResult } from '../../../core/models/album.model';

interface Genre {
  id: string;
  name: string;
  emoji: string;
  cssClass: string;
}

@Component({
  selector: 'app-explore',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './explore.html',
  styleUrl: './explore.scss',
})
export class Explore {
  // El contrato (v1.0) no expone ningún endpoint de catálogo de géneros
  // con conteo de reseñas (algo tipo GET /api/spotify/genres), así que
  // esta lista es estática en el frontend. Lo que SÍ es real es el
  // filtro: cada click dispara una búsqueda de verdad contra
  // GET /api/spotify/search?q=...&genre=....
  genres: Genre[] = [
    { id: 'reggaeton', name: 'Reggaetón', emoji: '🔥', cssClass: 'reggaeton' },
    { id: 'cumbia', name: 'Cumbia', emoji: '🥁', cssClass: 'cumbia' },
    { id: 'synth-pop', name: 'Synth-pop', emoji: '🎹', cssClass: 'synth' },
    { id: 'indie folk', name: 'Indie folk', emoji: '🌿', cssClass: 'indie' },
    { id: 'trap', name: 'Trap', emoji: '🎤', cssClass: 'trap' },
    { id: 'salsa', name: 'Salsa', emoji: '🎺', cssClass: 'salsa' },
  ];

  // Signals: la app corre Angular zoneless (sin zone.js), así que todo
  // lo que se lee en el template va en signals, no en propiedades planas.
  selectedGenre = signal<Genre | null>(null);
  results = signal<AlbumSearchResult[]>([]);
  loading = signal(false);
  errorMessage = signal<string | null>(null);

  constructor(
    private albumService: AlbumService,
    private router: Router,
  ) {}

  selectGenre(genre: Genre): void {
    if (this.selectedGenre()?.id === genre.id) {
      // Click sobre el género ya activo -> lo desmarca y limpia resultados.
      this.selectedGenre.set(null);
      this.results.set([]);
      this.errorMessage.set(null);
      return;
    }

    this.selectedGenre.set(genre);
    this.loading.set(true);
    this.errorMessage.set(null);
    this.results.set([]);

    // Usamos el nombre del género como texto de búsqueda (q) además del
    // parámetro genre, porque el contrato no garantiza que el backend
    // acepte una búsqueda solo con "genre" y sin "q".
    this.albumService
      .search(genre.name, genre.id)
      .pipe(
        catchError((err) => {
          this.errorMessage.set(
            err?.name === 'TimeoutError'
              ? 'La búsqueda está tardando demasiado. Intenta de nuevo.'
              : 'No pudimos cargar álbumes de este género.',
          );
          return of(null);
        }),
      )
      .subscribe((res) => {
        this.loading.set(false);
        if (res) this.results.set(res);
      });
  }

  goToAlbum(album: AlbumSearchResult): void {
    this.router.navigate(['/listener/album', album.spotifyAlbumId]);
  }

  formatRating(album: AlbumSearchResult): string {
    return album.platformRating != null ? `★ ${album.platformRating.toFixed(1)}` : 'Sin reseñas';
  }
}