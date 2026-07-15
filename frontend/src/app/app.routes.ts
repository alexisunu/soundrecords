
import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth-guard';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },

  {
    path: 'login',
    loadComponent: () =>
      import('./modules/auth/login/login').then((m) => m.LoginComponent),
  },
  {
    path: 'register',
    loadComponent: () =>
      import('./modules/auth/register/register').then((m) => m.RegisterComponent),
  },
  {
    path: 'plans',
    loadComponent: () =>
      import('./modules/auth/plans/plans').then((m) => m.Plans),
  },

  // Vistas autenticadas: comparten el sidebar a través de MainLayout.
  {
    path: '',
    loadComponent: () =>
      import('./shared/main-layout/main-layout').then((m) => m.MainLayout),
    children: [
      {
        path: 'settings',
        //canActivate: [authGuard],
        loadComponent: () =>
          import('./modules/auth/settings/settings').then((m) => m.SettingsComponent),
      },

      // VISTA 17 — centro de notificaciones (GET /api/notifications/me).
      {
        path: 'notifications',
        //canActivate: [authGuard],
        loadComponent: () =>
          import('./modules/interaction/notifications/notifications').then(
            (m) => m.Notifications,
          ),
      },
      {
        path: 'listener/feed',
        //canActivate: [authGuard],
        loadComponent: () =>
          import('./modules/listener/feed/feed').then((m) => m.Feed),
      },
      {
        path: 'listener/my-profile',
        //canActivate: [authGuard],
        loadComponent: () =>
          import('./modules/listener/my-profile/my-profile').then((m) => m.MyProfileComponent),
      },
      {
        path: 'listener/collections',
        //canActivate: [authGuard],
        loadComponent: () =>
          import('./modules/listener/collections/collections').then((m) => m.Collections),
      },
      {
        path: 'listener/missions',
        //canActivate: [authGuard],
        loadComponent: () =>
          import('./modules/gamification/missions/missions').then((m) => m.Missions),
      },
      {
        path: 'listener/badge-store',
        //canActivate: [authGuard],
        loadComponent: () =>
          import('./modules/gamification/badge-store/badge-store').then((m) => m.BadgeStore),
      },
      {
        path: 'listener/album-search',
        //canActivate: [authGuard],
        loadComponent: () =>
          import('./modules/listener/album-search/album-search').then((m) => m.AlbumSearch),
      },
      {
        path: 'listener/explore',
        //canActivate: [authGuard],
        loadComponent: () =>
          import('./modules/listener/explore/explore').then((m) => m.Explore),
      },
      {
        path: 'listener/album/:id',
        //canActivate: [authGuard],
        loadComponent: () =>
          import('./modules/listener/album-detail/album-detail').then((m) => m.AlbumDetail),
      },
      {
        path: 'listener/album/:id/review',
        //canActivate: [authGuard],
        loadComponent: () =>
          import('./modules/listener/review-editor/review-editor').then((m) => m.ReviewEditor),
      },

      // Descubre — artistas emergentes (GET /api/artists/discover).
      // Va ANTES que 'artist/dashboard' y 'artist/:id' solo por orden de
      // lectura; no hay conflicto de rutas porque vive bajo 'listener/'.
      {
        path: 'listener/discover',
        //canActivate: [authGuard],
        loadComponent: () =>
          import('./modules/artist/discover/discover').then((m) => m.Discover),
      },

      // VISTA 16 — dashboard privado del artista (GET /api/artists/me/dashboard).
      // ⚠️ Va ANTES que 'artist/:id': si quedara después, Angular
      // interpretaría "dashboard" como el parámetro :id de la vista 15.
      {
        path: 'artist/dashboard',
        //canActivate: [authGuard],
        loadComponent: () =>
          import('./modules/artist/artist-dashboard/artist-dashboard').then(
            (m) => m.ArtistDashboard,
          ),
      },

      // VISTA 15 — vista pública del artista (GET /api/artists/:id)
      {
        path: 'artist/:id',
        //canActivate: [authGuard],
        loadComponent: () =>
          import('./modules/artist/artist-public/artist-public').then((m) => m.ArtistPublic),
      },

      // Quiénes somos (vista puramente informativa, no consume ningún
      // endpoint del contrato).
      {
        path: 'about',
        loadComponent: () =>
          import('./modules/info/about/about').then((m) => m.About),
      },

      // Recursos curados para artistas nuevos (vista puramente
      // informativa, no consume ningún endpoint del contrato).
      {
        path: 'resources',
        loadComponent: () =>
          import('./modules/info/resources/resources').then((m) => m.Resources),
      },

      // alias usado en el sidebar (routerLink="/home") -> apunta al feed del listener
      { path: 'home', redirectTo: 'listener/feed', pathMatch: 'full' },
    ],
  },

  { path: '**', redirectTo: 'login' },
];
