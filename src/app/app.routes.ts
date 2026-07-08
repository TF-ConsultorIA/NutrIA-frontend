import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { AuthLayoutComponent } from './layouts/auth-layout/auth-layout.component';
import { noAuthGuard } from './core/guards/no-auth.guard';
import { AppLayoutComponent } from './layouts/app-layout/app-layout.component';
import { FoodSearchWrapperComponent } from './pages/food/food-search-wrapper/food-search-wrapper.component';


export const routes: Routes = [
  { path: '', redirectTo: '/auth/login', pathMatch: 'full' },
  {
    path: 'auth',
    component: AuthLayoutComponent,
    canActivate: [noAuthGuard],
    loadChildren: () => import('./pages/auth/auth.routes').then((m) => m.routes),
  },
  {
    path: '',
    component: AppLayoutComponent,
    canActivate: [authGuard],
    children: [
      {
        path: 'dashboard',
        loadChildren: () => import('./pages/dashboard/dashboard.routes').then((m) => m.routes),
      },
      {
        path: 'food',
        component: FoodSearchWrapperComponent,
        loadChildren: () => import('./pages/food/food.routes').then((m) => m.routes),
      },
      {
        path: 'favoritos',
        loadChildren: () => import('./pages/favorites/favorites.routes').then((m) => m.routes),
      },
      {
        path: 'meal-planner',
        loadChildren: () => import('./pages/meal-planner/meal-planner.routes').then((m) => m.routes),
      },
      {
        path: 'profile',
        loadChildren: () => import('./pages/profile/profile.routes').then((m) => m.routes),
      },
      {
        path: 'settings',
        loadChildren: () =>
          import('./pages/profile-settings/profile-settings.routes').then((m) => m.routes),
      },
      {
        path: 'chatbot',
        loadChildren: () => import('./pages/chatbot/chatbot.routes').then((m) => m.routes),
      }
    ],
  },
];
