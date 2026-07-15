import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

interface CuratedLink {
  title: string;
  description: string;
  url: string;
}

interface CuratedLinkGroup {
  category: string;
  links: CuratedLink[];
}

/**
 * Vista puramente informativa/estática (no consume ningún endpoint del
 * API Contract). Pensada para que un artista nuevo que se registra
 * entienda qué es SoundRecords y encuentre, en un solo lugar, enlaces
 * de interés para arrancar (distribución, derechos de autor, etc.).
 *
 * ⚠️ TODO para el equipo: el texto de "Quiénes somos" y los links de
 * abajo son un punto de partida de ejemplo -- hay que reemplazarlos por
 * la redacción real de la empresa y por los recursos/alianzas que de
 * verdad quieran recomendar (algunos son genéricos/regionales y deben
 * validarse antes de publicar).
 */
@Component({
  selector: 'app-about',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './about.html',
  styleUrl: './about.scss',
})
export class About {
  linkGroups: CuratedLinkGroup[] = [
    {
      category: 'Distribución digital',
      links: [
        {
          title: 'Spotify for Artists',
          description: 'Reclama tu perfil de artista en Spotify y accede a estadísticas de escucha.',
          url: 'https://artists.spotify.com/',
        },
        {
          title: 'DistroKid',
          description: 'Sube tu música a Spotify, Apple Music y otras plataformas.',
          url: 'https://distrokid.com/',
        },
      ],
    },
    {
      category: 'Derechos de autor y regalías',
      links: [
        {
          title: 'SGAE',
          description: 'Sociedad general de autores y editores — registro y gestión de derechos.',
          url: 'https://www.sgae.es/',
        },
      ],
    },
    {
      category: 'Comunidad y aprendizaje',
      links: [
        {
          title: 'Reddit r/WeAreTheMusicMakers',
          description: 'Comunidad activa de músicos independientes compartiendo consejos y feedback.',
          url: 'https://www.reddit.com/r/WeAreTheMusicMakers/',
        },
      ],
    },
  ];
}