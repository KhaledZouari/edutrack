import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { inject } from '@angular/core';
import { AuthService } from '../core/services/auth.service';
import { Role } from '../core/models/enums';

import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule, MatIconModule, MatButtonModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})
export class RegisterComponent {
  hidePassword = true;
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  isAuthenticated = this.authService.isAuthenticated;
  private router = inject(Router);

  registerForm: FormGroup = this.fb.group({
    firstName: ['', Validators.required],
    lastName: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8), Validators.pattern(/^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z]).{8,}$/)]],
    role: ['STUDENT', Validators.required],
    storeName: [''],
    storeDescription: [''],
  });

  submitting = false;
  errorMessage: string | null = null;

  onSubmit(): void {
    if (this.registerForm.invalid) {
      if (this.registerForm.get('email')?.errors?.['email']) {
        this.errorMessage = "Format d'email invalide.";
      } else if (this.registerForm.get('password')?.errors) {
        this.errorMessage = "Le mot de passe ne respecte pas les critères (8 caractères, majuscule, chiffre).";
      } else {
        this.errorMessage = "Veuillez remplir tous les champs obligatoires.";
      }
      return;
    }

    this.submitting = true;
    this.errorMessage = null;

    this.authService.register(this.registerForm.value).subscribe({
      next: (response) => {
        this.submitting = false;
        const role = response.role;
        if (role === 'ADMIN') this.router.navigate(['/admin/dashboard']);
        else if (role === 'TEACHER') this.router.navigate(['/teacher/dashboard']);
        else this.router.navigate(['/student/dashboard']);
      },
      error: (err) => {
        this.submitting = false;
        this.errorMessage = err.error?.message || 'Erreur lors de l\'inscription.';
      }
    });
  }
}
