import { Component, OnInit, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { catchError, of } from 'rxjs';
import { MissionService } from '../../../core/services/mission';
import { Badge } from '../../../core/models/mission.model';

type RarityFilter = 'all' | 'legendaria' | 'rara' | 'comun' | 'owned';
type Rarity = 'legendaria' | 'rara' | 'comun';

// ⚠️ El API Contract (GET /api/missions/badges/store) no expone un
// campo `rarity`: solo id/name/imageUrl/costPoints/owned. El mockup
// (VISTA 13) sí muestra insignias "Legendaria/Rara/Común", así que
// derivamos la rareza a partir de costPoints en vez de inventar un
// campo que el backend no manda. Si el backend llega a exponer
// `rarity` en el futuro, esto se reemplaza por el valor real.
const LEGENDARY_MIN = 500;
const RARE_MIN = 200;

@Component({
  selector: 'app-badge-store',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './badge-store.html',
  styleUrl: './badge-store.scss',
})
export class BadgeStore implements OnInit {
  // Signals: la app corre Angular zoneless, todo lo que se lee en el
  // template va en signals (mismo patrón que missions.ts).
  myPoints = signal(0);
  badges = signal<Badge[]>([]);
  loading = signal(true);
  error = signal<string | null>(null);

  activeTab = signal<RarityFilter>('all');
  purchasingId = signal<string | null>(null);
  successMessage = signal<string | null>(null);
  purchaseErrorId = signal<string | null>(null);
  purchaseErrorMsg = signal<string | null>(null);

  readonly tabs: { key: RarityFilter; label: string }[] = [
    { key: 'all', label: 'Todas' },
    { key: 'legendaria', label: 'Legendarias' },
    { key: 'rara', label: 'Raras' },
    { key: 'comun', label: 'Comunes' },
    { key: 'owned', label: 'Mis insignias' },
  ];

  filteredBadges = computed(() => {
    const tab = this.activeTab();
    const all = this.badges();
    if (tab === 'all') return all;
    if (tab === 'owned') return all.filter((b) => b.owned);
    return all.filter((b) => this.rarity(b) === tab);
  });

  ownedCount = computed(() => this.badges().filter((b) => b.owned).length);

  constructor(private missionService: MissionService) {}

  ngOnInit(): void {
    this.loadStore();
  }

  private loadStore(): void {
    this.loading.set(true);
    this.error.set(null);

    this.missionService
      .getBadgesStore()
      .pipe(
        catchError((err) => {
          this.error.set(
            err?.name === 'TimeoutError'
              ? 'La carga está tardando demasiado. Intenta de nuevo.'
              : 'No pudimos cargar la tienda de insignias.',
          );
          return of(null);
        }),
      )
      .subscribe((res) => {
        this.loading.set(false);
        if (res) {
          this.myPoints.set(res.myPoints);
          this.badges.set(res.badges);
        }
      });
  }

  rarity(badge: Badge): Rarity {
    if (badge.costPoints >= LEGENDARY_MIN) return 'legendaria';
    if (badge.costPoints >= RARE_MIN) return 'rara';
    return 'comun';
  }

  canAfford(badge: Badge): boolean {
    return this.myPoints() >= badge.costPoints;
  }

  selectTab(tab: RarityFilter): void {
    this.activeTab.set(tab);
  }

  purchase(badge: Badge): void {
    if (badge.owned || this.purchasingId() || !this.canAfford(badge)) return;

    this.purchasingId.set(badge.id);
    this.purchaseErrorId.set(null);
    this.purchaseErrorMsg.set(null);
    this.successMessage.set(null);

    this.missionService
      .purchaseBadge(badge.id)
      .pipe(
        catchError((err) => {
          let msg = 'No pudimos completar la compra. Intenta de nuevo.';
          if (err?.status === 400) msg = 'No tienes puntos suficientes para esta insignia.';
          else if (err?.status === 409) msg = 'Ya tienes esta insignia.';
          else if (err?.name === 'TimeoutError') msg = 'La compra está tardando demasiado. Intenta de nuevo.';
          this.purchaseErrorId.set(badge.id);
          this.purchaseErrorMsg.set(msg);
          return of(null);
        }),
      )
      .subscribe((res) => {
        this.purchasingId.set(null);
        if (!res) return;

        this.myPoints.set(res.remainingPoints);
        this.badges.update((list) => list.map((b) => (b.id === badge.id ? { ...b, owned: true } : b)));
        this.successMessage.set(`¡Insignia "${badge.name}" obtenida!`);
      });
  }
}