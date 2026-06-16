import { CommonModule } from '@angular/common';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatIconModule } from '@angular/material/icon';
import { FoodService } from '../../../services/food.service';
import { FoodResponse, FoodType } from '../../../models/food';
import { PageResponse } from '../../../models/page-response';
import { take } from 'rxjs';
import { FavoriteService } from '../../../services/favorite.service';
import { FavoriteCreateRequestDto } from '../../../models/favorite';
import { MatDialog } from '@angular/material/dialog';
import { PlateDetailDialogComponent } from '../dialogs/plate-detail-dialog/plate-detail-dialog.component';

@Component({
  selector: 'app-plate-search.component',
  imports: [MatIconModule, ReactiveFormsModule, CommonModule],
  templateUrl: './plate-search.component.html',
  styleUrl: './plate-search.component.css',
})
export class PlateSearchComponent implements OnInit {
  private foodService = inject(FoodService);
  private favoriteService = inject(FavoriteService);
  private _snackBar = inject(MatSnackBar);
  private dialog = inject(MatDialog);
  private fb = inject(FormBuilder);

  private gradients = [
    'from-orange-400 to-amber-500',
    'from-emerald-400 to-teal-500',
    'from-green-400 to-emerald-600',
    'from-purple-400 to-indigo-500',
    'from-sky-400 to-blue-500',
    'from-amber-400 to-orange-500',
    'from-rose-400 to-pink-500',
    'from-cyan-400 to-blue-500',
  ];

  private foodType = FoodType.PLATE;

  private paginationSize = signal<number>(12);
  public currentPage = signal<number>(0);
  public totalPages = computed(() => this.plateResults()?.totalPages || 0);
  public pageNumbers = computed(() => {
    const total = this.totalPages();
    const current = this.currentPage() + 1;
    const maxVisible = 12;

    let start = 1;
    let end = total;

    if (total > maxVisible) {
      const half = Math.floor(maxVisible / 2);

      if (current <= half) {
        start = 1;
        end = maxVisible;
      } else if (current + half >= total) {
        start = total - maxVisible + 1;
        end = total;
      } else {
        start = current - half;
        end = current + (maxVisible - half - 1);
      }
    }

    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  });

  private plateResults = signal<PageResponse<FoodResponse> | null>(null);
  public results = this.plateResults.asReadonly();

  public searchForm = this.fb.group({
    query: [''],
    minCalories: [''],
    maxCalories: [''],
    minProtein: [''],
  });

  ngOnInit(): void {
    this.loadPlates();
  }

  loadPlates() {
    this.foodService
      .getByType(this.foodType, this.currentPage(), this.paginationSize())
      .pipe(take(1))
      .subscribe((results) => {
        const recipesWithBg = results.content.map((recipe) => ({
          ...recipe,
          randomBg: this.getRandomGradient(recipe.id),
        }));

        this.plateResults.set({ ...results, content: recipesWithBg });
      });
  }

  private getRandomGradient(id: number): string {
    const index = id % this.gradients.length;
    return this.gradients[index];
  }

  onSearch() {
    const query = this.searchForm.get('query')?.value;
    this.currentPage.set(0);
    if (query) {
      this.foodService
        .searchPlates(query, this.foodType, this.currentPage(), this.paginationSize())
        .pipe(take(1))
        .subscribe((results) => {
          const recipesWithBg = results.content.map((recipe) => ({
            ...recipe,
            randomBg: this.getRandomGradient(recipe.id),
          }));
          this.plateResults.set({ ...results, content: recipesWithBg });
        });
    }
  }

  hasActiveFilters(): boolean {
    const values = this.searchForm.value;
    return !!(values.query || values.minCalories || values.maxCalories || values.minProtein);
  }

  clearQueryField(): void {
    this.searchForm.get('query')?.setValue('');
    this.triggerSearchFromZero();
  }

  resetAllFilters(): void {
    this.searchForm.reset({
      query: '',
      minCalories: null,
      maxCalories: null,
      minProtein: null
    });
    this.triggerSearchFromZero();
  }

  triggerSearchFromZero(): void {
    this.currentPage.set(0);
    this.loadPlates();
  }

  addFavorite(foodId: number) {
    let request: FavoriteCreateRequestDto = { foodId: foodId };

    this.favoriteService
      .addFavorite(request)
      .pipe(take(1))
      .subscribe({
        next: () => {
          this._snackBar.open('Plato agregado a favoritos', 'Cerrar', { duration: 3000 });
        },
        error: () => {
          this._snackBar.open('Este plato ya esta en favoritos', 'Cerrar', { duration: 3000 });
        },
      });
  }

  isFirstPage() {
    return this.plateResults()?.first;
  }

  isLastPage() {
    return this.plateResults()?.last;
  }

  goToPage(pageIndex: number): void {
    if (pageIndex >= 0 && pageIndex < this.totalPages()) {
      this.currentPage.set(pageIndex);
      this.loadPlates();
    }
  }

  openRecipeDetail(selectedFood: FoodResponse): void {
    this.dialog.open(PlateDetailDialogComponent, {
      data: selectedFood,
      width: '440px',
      panelClass: 'custom-dialog-container',
      disableClose: false
    });
  }
}
