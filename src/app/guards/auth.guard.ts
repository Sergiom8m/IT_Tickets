import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { inject } from '@angular/core';
import { map } from 'rxjs/operators';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService); // Usamos inject para obtener el AuthService
  const router = inject(Router); // Usamos inject para obtener el Router
  return authService.stateAuth().pipe(
    map(user => {
      if (user) {
        console.log('Usuario autenticado');
        return true; // Si el usuario está autenticado, permitimos el acceso
      } else {
        console.log('Usuario no autenticado');
        router.navigate(['/login']); // Si no está autenticado, lo redirigimos al login
        return false;
      }
    })
  );
};
