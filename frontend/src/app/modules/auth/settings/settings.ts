import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { UserService } from '../../../core/services/user';
import { AuthService } from '../../../core/services/auth';
import { Router } from '@angular/router';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './settings.html',
  styleUrls: ['./settings.scss'],
})
export class SettingsComponent implements OnInit {
  activeTab: 'perfil' | 'cuenta' | 'spotify' | 'privacidad' | 'planes' = 'perfil';

  profileForm!: FormGroup;
  credentialsForm!: FormGroup;
  privacyForm!: FormGroup;

  user: any = null;
  credentialsError: string = '';

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.initForms();

    this.authService.currentUser$.subscribe(user => {
      this.user = user;
      if (user) {
        this.profileForm.patchValue({
          username: user.username,
          bio: user.bio || '',
          photoUrl: user.photoUrl || '',
          country: user.country || ''
        });
        this.credentialsForm.patchValue({
          email: user.email
        });
      }
    });
  }

  switchTab(tab: 'perfil' | 'cuenta' | 'spotify' | 'privacidad' | 'planes'): void {
    this.activeTab = tab;
  }

  initForms(): void {
    this.profileForm = this.fb.group({
      username: ['', [Validators.required]],
      bio: ['', [Validators.maxLength(200)]],
      photoUrl: [''],
      country: ['']
    });

    this.credentialsForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      newPassword: ['', [Validators.minLength(8)]],
      confirmPassword: ['']
    });

    this.privacyForm = this.fb.group({
      publicProfile: [true],
      showLists: [true],
      showLikes: [false],
      emailNotifications: [true]
    });
  }

  get bioLength(): number {
    return this.profileForm.get('bio')?.value?.length || 0;
  }

  discardProfileChanges(): void {
    if (this.user) {
      this.profileForm.patchValue({
        username: this.user.username,
        bio: this.user.bio || '',
        photoUrl: this.user.photoUrl || '',
        country: this.user.country || ''
      });
    }
  }

  saveProfile(): void {
    if (this.profileForm.invalid) return;
    this.userService.updateProfile(this.profileForm.value).subscribe({
      next: () => {
        alert('Perfil actualizado con éxito');
        this.authService.loadCurrentUser().subscribe();
      },
      error: (err) => alert(err.error?.message || 'Error al actualizar perfil')
    });
  }

  saveCredentials(): void {
    this.credentialsError = '';
    if (this.credentialsForm.invalid) return;

    const { newPassword, confirmPassword } = this.credentialsForm.value;
    if (newPassword && newPassword !== confirmPassword) {
      this.credentialsError = 'Las contraseñas no coinciden';
      return;
    }

    const body: any = { email: this.credentialsForm.value.email };
    if (newPassword) body.newPassword = newPassword;

    this.userService.updateCredentials(body).subscribe({
      next: () => alert('Credenciales actualizadas de forma segura'),
      error: (err) => alert(err.error?.message || 'Error al cambiar credenciales')
    });
  }

  savePrivacy(): void {
    this.userService.updatePrivacy(this.privacyForm.value).subscribe({
      next: () => alert('Preferencias de privacidad guardadas'),
      error: (err) => alert(err.error?.message || 'Error al actualizar privacidad')
    });
  }

  disconnectSpotify(): void {
    // TODO: conectar con DELETE /api/spotify/disconnect cuando esté disponible en el backend
    alert('Función de desvinculación de Spotify próximamente disponible');
  }

  selectPlan(plan: string): void {
    const planCode = plan === 'Artista Premium' ? 'ARTIST_PREMIUM' : 'LISTENER_PREMIUM';
    this.router.navigate(['/plans'], { queryParams: { plan: planCode } });
  }

  onDeleteAccount(): void {
    if (confirm('¿Estás completamente seguro? Esta acción borrará permanentemente tus datos en Sound Records.')) {
      this.userService.deleteAccount().subscribe({
        next: () => {
          alert('Cuenta eliminada.');
          this.authService.logout();
          this.router.navigate(['/login']);
        },
        error: (err) => alert(err.error?.message || 'Error al procesar la baja de la cuenta')
      });
    }
  }
}