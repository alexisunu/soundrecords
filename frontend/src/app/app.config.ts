import {
  ApplicationConfig,
  provideBrowserGlobalErrorListeners,
  provideZonelessChangeDetection,
} from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';

import { routes } from './app.routes';
import { jwtInterceptor } from './core/interceptors/jwt-interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    // El proyecto no tiene zone.js instalado, así que había que declarar
    // explícitamente el modo zoneless. Sin este provider, Angular solo
    // repintaba la vista tras eventos de plantilla (clics, etc.) y nunca
    // tras respuestas HTTP asíncronas, que era la causa de que el feed no
    // se actualizara solo. Combinado con signals en los componentes que
    // reciben datos async (ver Feed), esto asegura que cualquier cambio de
    // estado dispare detección de cambios sin importar su origen.
    provideZonelessChangeDetection(),
    provideRouter(routes),
    provideHttpClient(withInterceptors([jwtInterceptor])),
  ],
};