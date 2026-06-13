import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { AuthService } from '../../../services/auth.service';
import { Gender, RegisterUserRequest, UserType } from '../../../models/auth';
import { MatIconModule } from '@angular/material/icon';

@Component({
  standalone: true,
  selector: 'app-register',
  imports: [
    ReactiveFormsModule,
    RouterLink,
    MatButtonModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatIconModule
  ],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css',
})
export class RegisterComponent {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private authService = inject(AuthService);

  readonly selectedRole = signal<'student' | 'family' | null>('student');
  readonly errorMessage = signal('');
  readonly isSubmitting = signal(false);

  readonly registerForm = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    name: ['', [Validators.required, Validators.minLength(2)]],
    lastNames: [''],
    birthDate: ['', [Validators.required]],
    gender: ['', [Validators.required]],
    password: ['', [Validators.required, Validators.minLength(8)]],
  });

  readonly genderOptions = [
    { value: Gender.MALE, label: 'Masculino' },
    { value: Gender.FEMALE, label: 'Femenino' },
    { value: Gender.NO_ESPECIFICADO, label: 'No especificado' },
  ] as const;

  selectRole(role: 'student' | 'family') {
    if (role === 'family') {
      return;
    }

    this.selectedRole.set(role);
    this.errorMessage.set('');
  }

  goBack() {
    this.selectedRole.set(null);
    this.errorMessage.set('');
  }

  onSubmit() {
    this.errorMessage.set('');

    if (!this.selectedRole()) {
      this.errorMessage.set('Selecciona el tipo de cuenta para continuar.');
      return;
    }

    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }

    const { email, name, lastNames, birthDate, gender, password } = this.registerForm.getRawValue();

    if (!this.isGender(gender)) {
      this.errorMessage.set('Selecciona un género válido.');
      return;
    }

    const request: RegisterUserRequest = {
      email: email.trim(),
      name: name.trim(),
      lastNames: lastNames.trim() || undefined,
      birthDate,
      gender,
      userType: this.selectedRole() === 'family' ? UserType.FAMILY : UserType.YOUNGER,
      password,
    };

    this.isSubmitting.set(true);

    this.authService.register(request).subscribe({
      next: () => {
        this.isSubmitting.set(false);
        this.router.navigate(['/auth/login']);
      },
      error: (err) => {
        this.isSubmitting.set(false);
        this.errorMessage.set(err?.error?.message || 'No se pudo crear la cuenta.');
      },
    });
  }

  private isGender(value: string): value is Gender {
    return value === Gender.MALE || value === Gender.FEMALE || value === Gender.NO_ESPECIFICADO;
  }
}
