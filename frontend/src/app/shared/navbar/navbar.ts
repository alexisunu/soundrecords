import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from '../../core/services/auth';
import { NotificationService } from '../../core/services/notification';
import { User } from '../../core/models/user.model';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './navbar.html',
  styleUrl: './navbar.scss',
})
export class Navbar implements OnInit {
  user$: Observable<User | null>;

  // Contador para el badge del link "Notificaciones" (VISTA 17). Se
  // carga una vez al montar el sidebar; no hay endpoint de sockets/
  // polling en el contrato, así que no se refresca en tiempo real.
  unreadNotifications = 0;

  constructor(
    private authService: AuthService,
    private notificationService: NotificationService,
    private router: Router,
  ) {
    this.user$ = this.authService.currentUser$;
  }

  ngOnInit(): void {
    this.notificationService.getMe().subscribe({
      next: (res) => (this.unreadNotifications = res.unreadCount),
      error: () => {
        // Silencioso: si falla, simplemente no mostramos el badge.
      },
    });
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}