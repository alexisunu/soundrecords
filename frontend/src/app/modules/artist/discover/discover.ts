import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { catchError, of } from 'rxjs';
import { ArtistService } from '../../../core/services/artist';
import { DiscoverArtist } from '../../../core/models/artist.model';

@Component({
  selector: 'app-discover',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './discover.html',
  styleUrl: './discover.scss',
})
export class Discover implements OnInit {
  // Signals: la app corre Angular zoneless (sin zone.js), así que todo
  // lo que se lee en el template va en signals.
  artists = signal<DiscoverArtist[]>([]);
  loading = signal(true);
  errorMessage = signal<string | null>(null);

  constructor(
    private artistService: ArtistService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.loadArtists();
  }

  loadArtists(): void {
    this.loading.set(true);
    this.errorMessage.set(null);

    this.artistService
      .discover()
      .pipe(
        catchError((err) => {
          this.errorMessage.set(
            err?.name === 'TimeoutError'
              ? 'La carga está tardando demasiado. Intenta de nuevo.'
              : 'No pudimos cargar los artistas emergentes.',
          );
          return of(null);
        }),
      )
      .subscribe((res) => {
        this.loading.set(false);
        // El backend ordena Premium (boost) primero y luego por
        // profileViews (ver contrato); no reordenamos nada acá.
        this.artists.set(res?.artists ?? []);
      });
  }

  goToArtist(artist: DiscoverArtist): void {
    this.router.navigate(['/artist', artist.id]);
  }

  // El contrato manda "genres" como un solo string separado por comas
  // (ej. "Cumbia, Electrónica"); lo partimos para pintar chips.
  genreList(genres: string): string[] {
    return genres
      .split(',')
      .map((g) => g.trim())
      .filter((g) => g.length > 0);
  }
}