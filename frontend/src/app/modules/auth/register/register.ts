import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/services/auth';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, RouterModule],
  templateUrl: './register.html',
  styleUrls: ['./register.scss'], // <- antes: './register.css'
})
export class RegisterComponent implements OnInit {
  registerForm!: FormGroup;
  loading = false;
  errorMessage = '';

  // Popup "¿Quieres ser artista?" — se muestra tras un registro exitoso
  // si la cuenta nueva quedó como LISTENER (rol por defecto al registrarse).
  showArtistPopup = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.registerForm = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      password: [
        '',
        [Validators.required, Validators.pattern(/^(?=.*[A-Za-z])(?=.*\d).{8,}$/)],
      ],
    });
  }

  get registerUsername() {
    return this.registerForm.get('username');
  }

  get registerEmail() {
    return this.registerForm.get('email');
  }

  get registerPassword() {
    return this.registerForm.get('password');
  }

  onSubmitRegister(): void {
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }

    this.loading = true;
    this.errorMessage = '';

    this.authService.register(this.registerForm.value).subscribe({
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
        this.errorMessage = err.error?.message || 'Error en el registro. Nombre de usuario o email duplicados.';
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