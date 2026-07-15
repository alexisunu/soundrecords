import { Component, OnInit, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { catchError, of } from 'rxjs';

import { NotificationService } from '../../../core/services/notification';
import { AppNotification, NotificationType } from '../../../core/models/notification.model';

type CategoryFilter = 'all' | 'social' | 'missions' | 'system';
type Category = 'social' | 'missions' | 'system';

interface NotifGroup {
  label: string;
  items: AppNotification[];
}

// Mapea los 7 tipos del contrato a las 3 pestañas del mockup (VISTA 17:
// Todas / Social / Misiones / Sistema). El backend no manda una
// categoría propia, así que la derivamos del `type`.
const CATEGORY_BY_TYPE: Record<NotificationType, Category> = {
  LIKE: 'social',
  NEW_FOLLOWER: 'social',
  COMMENT: 'social',
  MISSION_COMPLETED: 'missions',
  NEW_BADGE: 'missions',
  LEVEL_UP: 'system',
  ARTIST_RELEASE: 'system',
};

// Tipos que en el mockup se ven con una miniatura decorativa junto al
// texto (album art / avatar). El contrato no manda imágenes por
// notificación, así que es puramente decorativo, igual que en MU_2.html.
const TYPES_WITH_THUMB = new Set<NotificationType>(['LIKE', 'COMMENT', 'ARTIST_RELEASE']);

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './notifications.html',
  styleUrl: './notifications.scss',
})
export class Notifications implements OnInit {
  // ⚠️ Zoneless: todo lo que se lee en el template va en signals (mismo
  // patrón que badge-store.ts / missions.ts).
  notifications = signal<AppNotification[]>([]);
  unreadCount = signal(0);
  loading = signal(true);
  error = signal<string | null>(null);

  activeTab = signal<CategoryFilter>('all');
  markingAllRead = signal(false);

  readonly tabs: { key: CategoryFilter; label: string }[] = [
    { key: 'all', label: 'Todas' },
    { key: 'social', label: 'Social' },
    { key: 'missions', label: 'Misiones' },
    { key: 'system', label: 'Sistema' },
  ];

  filteredNotifications = computed(() => {
    const tab = this.activeTab();
    const all = this.notifications();
    if (tab === 'all') return all;
    return all.filter((n) => CATEGORY_BY_TYPE[n.type] === tab);
  });

  groupedNotifications = computed<NotifGroup[]>(() => {
    const groups: NotifGroup[] = [
      { label: 'Hoy', items: [] },
      { label: 'Ayer', items: [] },
      { label: 'Esta semana', items: [] },
      { label: 'Más antiguo', items: [] },
    ];

    for (const n of this.filteredNotifications()) {
      const idx = this.groupIndex(n.createdAt);
      groups[idx].items.push(n);
    }

    return groups.filter((g) => g.items.length > 0);
  });

  constructor(private notificationService: NotificationService) {}

  ngOnInit(): void {
    this.loadNotifications();
  }

  private loadNotifications(): void {
    this.loading.set(true);
    this.error.set(null);

    this.notificationService
      .getMe()
      .pipe(
        catchError((err) => {
          this.error.set(
            err?.name === 'TimeoutError'
              ? 'La carga está tardando demasiado. Intenta de nuevo.'
              : 'No pudimos cargar tus notificaciones.',
          );
          return of(null);
        }),
      )
      .subscribe((res) => {
        this.loading.set(false);
        if (res) {
          this.notifications.set(res.notifications);
          this.unreadCount.set(res.unreadCount);
        }
      });
  }

  selectTab(tab: CategoryFilter): void {
    this.activeTab.set(tab);
  }

  category(type: NotificationType): Category {
    return CATEGORY_BY_TYPE[type];
  }

  hasThumb(type: NotificationType): boolean {
    return TYPES_WITH_THUMB.has(type);
  }

  timeAgo(createdAt: string): string {
    const diffMs = Date.now() - new Date(createdAt).getTime();
    const minutes = Math.floor(diffMs / 60000);
    if (minutes < 1) return 'justo ahora';
    if (minutes < 60) return `hace ${minutes} min`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `hace ${hours} h`;
    const days = Math.floor(hours / 24);
    return `hace ${days} d`;
  }

  markAsRead(notif: AppNotification): void {
    if (notif.isRead) return;

    // Optimista: la vista no debería sentirse trabada esperando la red
    // para algo tan simple como marcar como leída.
    notif.isRead = true;
    this.notifications.update((list) => [...list]);
    this.unreadCount.update((count) => Math.max(0, count - 1));

    this.notificationService.markRead(notif.id).subscribe({
      error: () => {
        // Revertimos si el backend rechazó el cambio.
        notif.isRead = false;
        this.notifications.update((list) => [...list]);
        this.unreadCount.update((count) => count + 1);
      },
    });
  }

  markAllAsRead(): void {
    if (this.markingAllRead() || this.unreadCount() === 0) return;

    this.markingAllRead.set(true);
    this.notificationService
      .markAllRead()
      .pipe(
        catchError(() => {
          this.markingAllRead.set(false);
          return of(null);
        }),
      )
      .subscribe((res) => {
        this.markingAllRead.set(false);
        if (!res) return;
        this.notifications.update((list) => list.map((n) => ({ ...n, isRead: true })));
        this.unreadCount.set(res.unreadCount);
      });
  }

  private groupIndex(createdAt: string): number {
    const date = new Date(createdAt);
    const now = new Date();

    const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
    const today = startOfDay(now);
    const day = startOfDay(date);
    const diffDays = Math.round((today - day) / 86400000);

    if (diffDays <= 0) return 0; // Hoy
    if (diffDays === 1) return 1; // Ayer
    if (diffDays <= 7) return 2; // Esta semana
    return 3; // Más antiguo
  }
}