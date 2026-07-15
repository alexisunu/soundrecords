import { Component, OnInit, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { catchError, of } from 'rxjs';
import { MissionService } from '../../../core/services/mission';
import { Badge, MissionsMeResponse } from '../../../core/models/mission.model';

const RING_RADIUS = 34;
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS; // ≈ 213.63

@Component({
  selector: 'app-missions',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './missions.html',
  styleUrl: './missions.scss',
})
export class Missions implements OnInit {
  // Signals: la app corre Angular zoneless (sin zone.js), así que todo
  // lo que se lee en el template va en signals, no en propiedades planas.
  me = signal<MissionsMeResponse | null>(null);
  loadingMe = signal(true);
  errorMe = signal<string | null>(null);

  ownedBadges = signal<Badge[]>([]);
  loadingBadges = signal(true);
  errorBadges = signal<string | null>(null);

  readonly ringCircumference = RING_CIRCUMFERENCE;

  // ⚠️ El contrato NO da un total fijo de XP por nivel, solo "points"
  // (acumulado) y "pointsToNextLevel" (lo que falta). Asumimos que el
  // "ancho de la barra" de este nivel es points + pointsToNextLevel.
  // Si el backend maneja niveles con umbrales distintos, este cálculo
  // puede no ser exacto, pero es lo mejor que se puede hacer con los
  // datos que expone /api/missions/me.
  levelProgressPct = computed(() => {
    const m = this.me();
    if (!m) return 0;
    const total = m.points + m.pointsToNextLevel;
    if (total <= 0) return 0;
    return Math.min(100, Math.round((m.points / total) * 100));
  });

  ringDashoffset = computed(() => {
    return RING_CIRCUMFERENCE * (1 - this.levelProgressPct() / 100);
  });

  constructor(private missionService: MissionService) {}

  ngOnInit(): void {
    this.loadMe();
    this.loadOwnedBadges();
  }

  private loadMe(): void {
    this.loadingMe.set(true);
    this.errorMe.set(null);

    this.missionService
      .getMe()
      .pipe(
        catchError((err) => {
          this.errorMe.set(
            err?.name === 'TimeoutError'
              ? 'La carga está tardando demasiado. Intenta de nuevo.'
              : 'No pudimos cargar tu progreso.',
          );
          return of(null);
        }),
      )
      .subscribe((res) => {
        this.loadingMe.set(false);
        if (res) this.me.set(res);
      });
  }

  private loadOwnedBadges(): void {
    this.loadingBadges.set(true);
    this.errorBadges.set(null);

    // No existe un "GET /api/missions/badges/mine": la única forma de
    // saber qué insignias tiene el usuario es traer la tienda completa
    // (GET /api/missions/badges/store) y filtrar owned === true.
    this.missionService
      .getBadgesStore()
      .pipe(
        catchError(() => {
          this.errorBadges.set('No pudimos cargar tus insignias.');
          return of(null);
        }),
      )
      .subscribe((res) => {
        this.loadingBadges.set(false);
        if (res) this.ownedBadges.set(res.badges.filter((b) => b.owned));
      });
  }

  progressPct(progress?: string): number | null {
    if (!progress) return null;
    const [done, total] = progress.split('/').map((n) => parseInt(n.trim(), 10));
    if (!total || isNaN(done) || isNaN(total)) return null;
    return Math.min(100, Math.round((done / total) * 100));
  }
}