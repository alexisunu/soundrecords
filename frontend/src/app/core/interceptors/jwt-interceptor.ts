import { HttpInterceptorFn } from '@angular/common/http';

export const jwtInterceptor: HttpInterceptorFn = (req, next) => {
  // Ajusta 'token' al nombre exacto de la llave donde guardas tu JWT
  const token = localStorage.getItem('sr_token'); 
  
  console.log('--- INTERCEPTOR EJECUTÁNDOSE ---');
  console.log('URL de la petición:', req.url);
  console.log('Token encontrado en el navegador:', token);

  if (token && req.url.includes('/api/')) {
    console.log('¡Condición cumplida! Adjuntando token...');
    req = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`,
      },
    });
  } else {
    console.log('No se adjuntó el token. ¿Falta el token o la URL no incluye /api/?');
  }

  return next(req);
};