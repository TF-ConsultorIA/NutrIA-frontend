import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatToolbarModule } from '@angular/material/toolbar';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-app-layout.component',
  imports: [
    RouterOutlet,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatToolbarModule,
    RouterLinkActive,
    RouterLink,
  ],
  templateUrl: './app-layout.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './app-layout.component.css',
})
export class AppLayoutComponent {
  private authService = inject(AuthService);
  private userService = inject(UserService);
  private streakService = inject(UserService);
  private router = inject(Router);

  logout(): void {
    this.authService.logout().subscribe(() => {
      this.router.navigate(['/']);
    });
  }

  get user() {
    return this.userService.currentUser();
  }
}
