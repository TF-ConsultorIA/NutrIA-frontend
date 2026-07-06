import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIcon } from '@angular/material/icon';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { UserService } from '../../services/user.service';
import { AuthService } from '../../services/auth.service';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-profile-settings',
  imports: [CommonModule, ReactiveFormsModule, RouterLink, MatIcon],
  templateUrl: './profile-settings.html',
  styleUrl: './profile-settings.css',
})
export class ProfileSettings implements OnInit {
  private fb = inject(FormBuilder);
  private userService = inject(UserService);
  private authService = inject(AuthService);
  private http = inject(HttpClient);

  user = this.userService.currentUser;

  initial = computed(() => {
    const name = this.user()?.name ?? '';
    return name.charAt(0).toUpperCase();
  });

  activeTab = signal<'info' | 'security'>('info');
  editingInfo = signal(false);
  savingInfo = signal(false);
  savingPassword = signal(false);
  infoError = signal<string | null>(null);
  passwordError = signal<string | null>(null);
  passwordSuccess = signal<string | null>(null);
  showCurrent = signal(false);
  showNew = signal(false);
  showConfirm = signal(false);

  infoForm = this.fb.group({
    name: ['', Validators.required],
    birthDate: [''],
  });

  metricsForm = this.fb.group({
    height: [null as number | null],
    chest: [null as number | null],
    arm: [null as number | null],
  });

  passwordForm = this.fb.group({
  currentPassword: ['', Validators.required],
  newPassword: ['', [Validators.required, Validators.minLength(8)]],
  confirmPassword: ['', Validators.required],
});

  ngOnInit(): void {
    const u = this.user();
    if (u) {
      this.infoForm.patchValue({
        name: u.name,
        birthDate: u.birthDate ?? '',
      });
    }

    // Cargar métricas
    const userId = this.user()?.userId;
    if (userId) {
      this.http.get<any>(`${environment.apiUrl}/profiles/${userId}/metrics`).subscribe({
        next: (metrics) => {
          this.metricsForm.patchValue({
            height: metrics.height,
            chest: metrics.chest,
            arm: metrics.arm,
          });
        },
        error: () => {} // Si no tiene métricas aún, los campos quedan vacíos
      });
    }
  }

  saveInfo(): void {
    if (this.infoForm.invalid) return;

    this.savingInfo.set(true);
    this.infoError.set(null);

    const userId = this.user()?.userId;

    // Guardar datos personales
    this.userService.updateMe({
      name: this.infoForm.value.name!,
      birthDate: this.infoForm.value.birthDate!,
    }).subscribe({
      next: () => {
        // Guardar métricas con upsert
        this.http.post(`${environment.apiUrl}/profiles/${userId}/metrics`, {
          height: this.metricsForm.value.height,
          chest: this.metricsForm.value.chest,
          arm: this.metricsForm.value.arm,
        }).subscribe({
          next: () => {
            this.savingInfo.set(false);
            this.editingInfo.set(false);
          },
          error: () => {
            this.savingInfo.set(false);
            this.infoError.set('Error al guardar las métricas. Intenta de nuevo.');
          }
        });
      },
      error: () => {
        this.savingInfo.set(false);
        this.infoError.set('Error al guardar los datos personales. Intenta de nuevo.');
      }
    });
  }


savePassword(): void {
  this.passwordError.set(null);
  this.passwordSuccess.set(null);

  const { currentPassword, newPassword, confirmPassword } = this.passwordForm.getRawValue();

  if (newPassword !== confirmPassword) {
    this.passwordError.set('Las contraseñas nuevas no coinciden.');
    return;
  }

  this.savingPassword.set(true);

  this.authService.changePassword({
    oldPassword: currentPassword!,
    newPassword: newPassword!,
  }).subscribe({
    next: () => {
      this.savingPassword.set(false);
      this.passwordSuccess.set('Contraseña actualizada correctamente.');
      this.passwordForm.reset();
    },
    error: () => {
      this.savingPassword.set(false);
      this.passwordError.set('Ocurrió un error al actualizar la contraseña. Intenta de nuevo.');
    }
  });
}
}