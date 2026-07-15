
import { Component, OnDestroy, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Subscription } from 'rxjs';
import { ReviewCard } from '../../../shared/review-card/review-card';
import { ReviewService } from '../../../core/services/review';
import { Review } from '../../../core/models/review.model';
import { AuthService } from '../../../core/services/auth';

@Component({
  selector: 'app-feed',
  standalone: true,
  imports: [CommonModule, RouterModule, ReviewCard],
  templateUrl: './feed.html',
  styleUrl: './feed.scss',
})
export class Feed implements OnInit, OnDestroy {
  // Usamos signals (en vez de propiedades planas) porque la app corre en
  // modo zoneless: las respuestas HTTP llegan fuera de cualquier evento de
  // plantilla, así que solo un write a un signal (o un ChangeDetectorRef
  // manual) garantiza que Angular repinte la vista. Antes, al asignar
  // "this.reviews = res.reviews" en el subscribe, la vista quedaba
  // desactualizada hasta el próximo clic en la página.
  reviews = signal<Review[]>([]);
  loading = signal(true);
  errorMessage = signal<string | null>(null);
  page = signal(0);
  hasMore = signal(false);

  // Imagen promocional del feed. No existe un endpoint de "promociones"
  // ni "anuncios" en el contrato, así que es contenido estático del
  // frontend. Es literalmente un <img>: el SVG de abajo se sirve como
  // data URI para no depender de subir un archivo a /public. Si más
  // adelante hay un asset real, basta con reemplazar promoImageSrc por
  // la ruta ('/promo-event.jpg') sin tocar el template.
  // Anuncio externo -> página oficial de Rock al Parque (no es una ruta
  // interna, por eso en el template usa [href] + target="_blank" y no
  // [routerLink]).
  readonly promoLink = 'https://rockalparque.gov.co/';

  private readonly promoBannerSvg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 280 360">
      <defs>
        <linearGradient id="rockBg" x1="0" y1="0" x2="0.8" y2="1">
          <stop offset="0%" stop-color="#160408"/>
          <stop offset="45%" stop-color="#5c1220"/>
          <stop offset="100%" stop-color="#ff5a2e"/>
        </linearGradient>
      </defs>
      <rect width="280" height="360" fill="url(#rockBg)"/>

      <!-- rayos de fondo -->
      <polygon points="230,10 200,90 225,90 195,170 260,70 232,70" fill="#ffd23f" opacity="0.85"/>
      <polygon points="20,120 55,90 45,130 80,100 55,150 65,120" fill="#ffffff" opacity="0.12"/>

      <!-- silueta de guitarra -->
      <g opacity="0.9" fill="#0d0203">
        <ellipse cx="95" cy="278" rx="52" ry="40"/>
        <ellipse cx="95" cy="278" rx="52" ry="40" fill="none" stroke="#ff5a2e" stroke-width="2" opacity="0.5"/>
        <rect x="88" y="150" width="14" height="130" rx="6"/>
        <rect x="82" y="120" width="26" height="34" rx="5"/>
        <circle cx="95" cy="278" r="14" fill="#160408"/>
      </g>

      <!-- etiqueta "promocionado" -->
      <rect x="16" y="18" width="108" height="24" rx="12" fill="rgba(255,255,255,0.16)"/>
      <text x="30" y="34" font-family="Inter, sans-serif" font-size="10.5" font-weight="700" letter-spacing="0.5" fill="#ffffff">PROMOCIONADO</text>

      <!-- titulo -->
      <text x="18" y="90" font-family="Space Grotesk, sans-serif" font-size="34" font-weight="800" fill="#ffffff" transform="rotate(-3 18 90)">ROCK AL</text>
      <text x="18" y="128" font-family="Space Grotesk, sans-serif" font-size="34" font-weight="800" fill="#ffd23f" transform="rotate(-3 18 128)">PARQUE</text>
      <text x="18" y="152" font-family="Inter, sans-serif" font-size="13" fill="#f2d9d0">Edición virtual · SoundRecords</text>

      <!-- pill CTA -->
      <rect x="18" y="316" width="150" height="30" rx="15" fill="#ffd23f"/>
      <text x="34" y="336" font-family="Inter, sans-serif" font-size="12.5" font-weight="700" fill="#160408">Streaming Premium →</text>
    </svg>
  `;

  readonly promoImageSrc = 'data:image/svg+xml;utf8,' + encodeURIComponent(this.promoBannerSvg);

  // Segundo anuncio del rail, mismo mecanismo (data URI) que el de
  // arriba. Página oficial del Festival Estéreo Picnic.
  readonly promoLink2 = 'https://www.festivalestereopicnic.com/';

  private readonly promoBannerSvg2 = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 280 360">
      <defs>
        <linearGradient id="picnicBg" x1="0" y1="0" x2="0.9" y2="1">
          <stop offset="0%" stop-color="#0c1f1a"/>
          <stop offset="50%" stop-color="#1c4a3f"/>
          <stop offset="100%" stop-color="#7ee08a"/>
        </linearGradient>
      </defs>
      <rect width="280" height="360" fill="url(#picnicBg)"/>

      <!-- luces / confeti de fondo -->
      <circle cx="235" cy="45" r="6" fill="#c9ff5e" opacity="0.8"/>
      <circle cx="255" cy="80" r="4" fill="#9b5de5" opacity="0.7"/>
      <circle cx="215" cy="95" r="3.5" fill="#ffffff" opacity="0.5"/>
      <circle cx="245" cy="130" r="5" fill="#c9ff5e" opacity="0.6"/>

      <!-- siluetas de escenario -->
      <g opacity="0.9" fill="#08120f">
        <polygon points="30,300 60,220 90,300"/>
        <polygon points="70,300 105,190 140,300"/>
        <polygon points="120,300 150,235 180,300"/>
      </g>

      <!-- etiqueta "promocionado" -->
      <rect x="16" y="18" width="108" height="24" rx="12" fill="rgba(255,255,255,0.16)"/>
      <text x="30" y="34" font-family="Inter, sans-serif" font-size="10.5" font-weight="700" letter-spacing="0.5" fill="#ffffff">PROMOCIONADO</text>

      <!-- titulo -->
      <text x="18" y="90" font-family="Space Grotesk, sans-serif" font-size="30" font-weight="800" fill="#ffffff" transform="rotate(-2 18 90)">ESTÉREO</text>
      <text x="18" y="126" font-family="Space Grotesk, sans-serif" font-size="30" font-weight="800" fill="#c9ff5e" transform="rotate(-2 18 126)">PICNIC</text>
      <text x="18" y="150" font-family="Inter, sans-serif" font-size="13" fill="#d7f2d0">Playlist oficial · SoundRecords</text>

      <!-- pill CTA -->
      <rect x="18" y="316" width="150" height="30" rx="15" fill="#c9ff5e"/>
      <text x="34" y="336" font-family="Inter, sans-serif" font-size="12.5" font-weight="700" fill="#0c1f1a">Escuchar ahora →</text>
    </svg>
  `;

  readonly promoImageSrc2 = 'data:image/svg+xml;utf8,' + encodeURIComponent(this.promoBannerSvg2);

  private userSub?: Subscription;

  constructor(
    private reviewService: ReviewService,
    private authService: AuthService,
  ) {}

  ngOnInit(): void {
    // Aseguramos que haya un usuario cargado (por si se entra directo a
    // /listener/feed con un token en localStorage pero sin pasar por login).
    this.userSub = this.authService.currentUser$.subscribe();
    this.loadFeed(0);
  }

  ngOnDestroy(): void {
    this.userSub?.unsubscribe();
  }

  loadFeed(page: number): void {
    this.loading.set(true);
    this.errorMessage.set(null);
    this.reviewService.getFeed(page).subscribe({
      next: (res) => {
        this.reviews.set(res.reviews);
        this.page.set(res.page);
        this.hasMore.set(res.hasMore);
        this.loading.set(false);
      },
      error: () => {
        this.errorMessage.set('No pudimos cargar tu feed. Intenta de nuevo.');
        this.loading.set(false);
      },
    });
  }

  goToPage(page: number): void {
    if (page < 0) return;
    if (page > this.page() && !this.hasMore()) return;
    this.loadFeed(page);
  }

  get pageNumbers(): number[] {
    // La API solo retorna hasMore (no un total de páginas), así que
    // mostramos la página actual y, si hay más, la siguiente conocida.
    const nums = [this.page()];
    if (this.hasMore()) nums.push(this.page() + 1);
    return nums;
  }
}
