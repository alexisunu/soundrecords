
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

interface PlatformStat {
  icon: string;
  value: string;
  label: string;
}

/**
 * Vista puramente informativa/estática (no consume ningún endpoint del
 * API Contract). Cuenta quiénes somos, nuestra misión y estadísticas
 * destacadas de la plataforma.
 *
 * Los recursos curados para artistas nuevos (distribución, derechos de
 * autor, comunidad) viven ahora en su propia vista: ver
 * modules/info/resources.
 *
 * ⚠️ TODO para el equipo: el texto de "Quiénes somos" es un punto de
 * partida de ejemplo -- hay que reemplazarlo por la redacción real de
 * la empresa.
 *
 * ⚠️ TODO backend: el API Contract actual no define un endpoint de
 * estadísticas globales de la plataforma (tipo GET /api/platform/stats).
 * Mientras no exista, estos números quedan hardcodeados como referencia
 * visual; hay que reemplazarlos por datos reales o conectar un endpoint
 * nuevo cuando esté disponible.
 */
@Component({
  selector: 'app-about',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './about.html',
  styleUrl: './about.scss',
})
export class About {
  stats: PlatformStat[] = [
    { icon: '🎤', value: '1,200+', label: 'Artistas independientes' },
    { icon: '💿', value: '8,500+', label: 'Álbumes reseñados' },
    { icon: '📝', value: '32,000+', label: 'Reseñas de la comunidad' },
    { icon: '⭐', value: '4.6/5', label: 'Calificación promedio' },
  ];
}
