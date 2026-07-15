import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth';
import { User } from '../../../core/models/user.model';

// ⚠️ VISTA 14 del mockup ("Descubre Antes que Todos") muestra álbumes
// con fecha de lanzamiento exacta, cuenta regresiva y reseñas
// "embargadas" hasta el día de salida. Nada de eso existe en el
// backend: el ER diagram no tiene tabla de álbumes propia (los
// álbumes se consultan en vivo vía GET /api/spotify/search, que solo
// devuelve álbumes YA públicos, sin fecha de lanzamiento futura ni
// mecanismo de embargo) y el API Contract no define ningún endpoint
// de "acceso anticipado". Por eso esta vista se implementa como
// "Próximamente": la UI del hero es fiel al mockup, pero en vez de
// inventar una lista de lanzamientos con countdown falso, mostramos
// un estado vacío honesto con upsell a Premium para quien no lo tenga.
@Component({
  selector: 'app-early-access',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './early-access.html',
  styleUrl: './early-access.scss',
})
export class EarlyAccess implements OnInit {
  currentUser = signal<User | null>(null);

  readonly filterPills = ['Todos', 'Esta semana', 'Próximos', 'Rock', 'Electrónica', 'Reggaetón', 'Cumbia', 'Hip-Hop'];

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.authService.currentUser$.subscribe((user) => this.currentUser.set(user));
  }
}
