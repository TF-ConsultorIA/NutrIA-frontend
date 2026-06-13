import { Routes } from '@angular/router';
import { AuthLayoutComponent } from './layouts/auth-layout.component/auth-layout.component';
import { authGuard } from './core/guards/auth.guard';
import { noAuthGuard } from './core/guards/no-auth.guard';

export const routes: Routes = [
  {path: '', redirectTo: 'auth/login', pathMatch: 'full'},
  {
    path: 'auth',
    component: AuthLayoutComponent,
    canActivate: [noAuthGuard],
    children: []
  }
];
