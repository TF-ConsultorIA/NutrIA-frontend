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
  infoSuccess = signal<string | null>(null);
  passwordError = signal<string | null>(null);
  passwordSuccess = signal<string | null>(null);
  showNew = signal(false);
  showConfirm = signal(false);

  infoForm = this.fb.group({
    name:      [{ value: '', disabled: true }, Validators.required],
    lastNames: [{ value: '', disabled: true }, Validators.required],
    gender:    [{ value: '', disabled: true }],
    birthDate: [{ value: '', disabled: true }],
  });

  metricsForm = this.fb.group({
    height: [null as number | null],
    chest:  [null as number | null],
    arm:    [null as number | null],
  });

  passwordForm = this.fb.group({
    oldPassword:     ['', Validators.required],
    newPassword:     ['', [Validators.required, Validators.minLength(8)]],
    confirmPassword: ['', Validators.required],
  });

  ngOnInit(): void {
    const u = this.user();
    if (u) {
      this.infoForm.patchValue({
        name:      u.name,
        lastNames: u.lastNames,
        gender:    u.gender,
        birthDate: u.birthDate ?? '',
      });
    }

    const userId = this.user()?.userId;
    if (userId) {
      this.http.get<any>(`${environment.apiUrl}/profiles/${userId}/metrics`).subscribe({
        next: (metrics) => {
          this.metricsForm.patchValue({
            height: metrics.height,
            chest:  metrics.chest,
            arm:    metrics.arm,
          });
        },
        error: () => {}
      });
    }
  }

  toggleEdit(): void {
    const editing = !this.editingInfo();
    this.editingInfo.set(editing);
    if (editing) {
      this.infoForm.enable();
    } else {
      this.infoForm.disable();
    }
  }

  saveInfo(): void {
    if (this.infoForm.invalid) return;

    this.savingInfo.set(true);
    this.infoError.set(null);
    this.infoSuccess.set(null);

    const userId = this.user()?.userId;
    const raw = this.infoForm.getRawValue();

    this.userService.updateMe({
      name:      raw.name!,
      lastNames: raw.lastNames!,
      gender:    raw.gender as any,
      birthDate: raw.birthDate!,
    }).subscribe({
      next: () => {
        this.savingInfo.set(false);
        this.infoSuccess.set('Información personal actualizada correctamente.');
        this.toggleEdit();

        this.http.post(`${environment.apiUrl}/profiles/${userId}/metrics`, {
          height: this.metricsForm.value.height,
          chest:  this.metricsForm.value.chest,
          arm:    this.metricsForm.value.arm,
        }).subscribe({
          error: () => {}
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

    const { oldPassword, newPassword, confirmPassword } = this.passwordForm.getRawValue();

    if (newPassword !== confirmPassword) {
      this.passwordError.set('Las contraseñas nuevas no coinciden.');
      return;
    }

    this.savingPassword.set(true);

    this.authService.changePassword({
      oldPassword: oldPassword!,
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