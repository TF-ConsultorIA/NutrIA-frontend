import { Routes } from '@angular/router';
import { PlateSearchComponent } from './plate-search/plate-search.component';
import { IngredientSearchComponent } from './ingredient-search/ingredient-search.component';
import { FoodSearchWrapperComponent } from './food-search-wrapper/food-search-wrapper.component';

export const routes: Routes = [
  {
    path: 'plate',
    component: PlateSearchComponent,
  },
  {
    path: 'ingredient',
    component: IngredientSearchComponent,
  },
  {
    path: '',
    redirectTo: 'plate',
    pathMatch: 'full',
  },
];
