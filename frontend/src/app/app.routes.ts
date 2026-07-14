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

      // alias usado en el sidebar (routerLink="/home") -> apunta al feed del listener
      { path: 'home', redirectTo: 'listener/feed', pathMatch: 'full' },
    ],
  },

  { path: '**', redirectTo: 'login' },
];