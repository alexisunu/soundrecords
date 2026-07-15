
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
 * API Contract). Antes vivía dentro de "Quiénes somos"; se separó en su
 * propia vista para que "Quiénes somos" se enfoque en la empresa y esta
 * vista se enfoque en ayudar a artistas nuevos a arrancar.
 *
 * ⚠️ TODO para el equipo: los links de abajo son un punto de partida de
 * ejemplo -- hay que reemplazarlos por los recursos/alianzas que de
 * verdad quieran recomendar (algunos son genéricos/regionales y deben
 * validarse antes de publicar).
 */
@Component({
  selector: 'app-resources',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './resources.html',
  styleUrl: './resources.scss',
})
export class Resources {
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
