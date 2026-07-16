import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/services/auth';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, RouterModule],
  templateUrl: './login.html',
  styleUrls: ['./login.scss'], // <- antes: './login.css'
})
export class LoginComponent implements OnInit {
  loginForm!: FormGroup;
  loading = false;
  errorMessage = '';

  // Popup "¿Quieres ser artista?" — se muestra tras un login exitoso
  // solo si el usuario todavía es LISTENER (no tiene sentido ofrecérselo
  // a quien ya es ARTIST o ADMIN).
  showArtistPopup = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],
    });
  }

  get loginEmail() {
    return this.loginForm.get('email');
  }

  get loginPassword() {
    return this.loginForm.get('password');
  }

  onSubmitLogin(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.loading = true;
    this.errorMessage = '';

    this.authService.login(this.loginForm.value).subscribe({
      next: (res) => {
        this.loading = false;

        if (res.user.role === 'LISTENER') {
          this.showArtistPopup = true;
        } else {
          this.router.navigate(['/listener/feed']);
        }
      },
      error: (err) => {
        this.loading = false;
        this.errorMessage = err.error?.message || 'Credenciales incorrectas. Inténtalo de nuevo.';
      },
    });
  }

  onAcceptArtistPopup(): void {
    this.showArtistPopup = false;
    this.router.navigate(['/plans']);
  }

  onDismissArtistPopup(): void {
    this.showArtistPopup = false;
    this.router.navigate(['/listener/feed']);
  }
}