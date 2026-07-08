import { Component, computed, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { PageResponse } from '../../../models/page-response';
import { FoodResponse, FoodType } from '../../../models/food';
import { FoodService } from '../../../services/food.service';
import { take } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { IngredientDetailDialogComponent } from '../dialogs/ingredient-detail-dialog/ingredient-detail-dialog.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-ingredient-search.component',
  imports: [MatIconModule, ReactiveFormsModule, CommonModule],
  templateUrl: './ingredient-search.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './ingredient-search.component.css',
})
export class IngredientSearchComponent {
  private foodService = inject(FoodService);
  private dialog = inject(MatDialog);
  private fb = inject(FormBuilder);

  private foodType = FoodType.INGREDIENT;

  private paginationSize = signal<number>(12);
  public currentPage = signal<number>(0);
  public totalPages = computed(() => this.ingredientResults()?.totalPages || 0);
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

  searchForm = this.fb.group({
    query: [''],
    minCalories: [null],
    maxCalories: [null],
    minProtein: [null],
  });

  private ingredientResults = signal<PageResponse<FoodResponse> | null>(null);
  public results = this.ingredientResults.asReadonly();

  private gradients = [
    'from-emerald-400 to-teal-600',
    'from-green-400 to-emerald-500',
    'from-lime-500 to-emerald-600',
    'from-teal-400 to-cyan-600',
    'from-orange-400 to-amber-600',
    'from-amber-600/80 to-stone-500',
    'from-amber-500 to-stone-600',
  ];

  ngOnInit(): void {
    this.loadIngredients();
  }

  loadIngredients() {
    this.foodService
      .getByType(this.foodType, this.currentPage(), this.paginationSize())
      .pipe(take(1))
      .subscribe((results) => {
        const recipesWithBg = results.content.map((recipe) => ({
          ...recipe,
          randomBg: this.getRandomGradient(recipe.id),
        }));

        this.ingredientResults.set({ ...results, content: recipesWithBg });
      });
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
          this.ingredientResults.set({ ...results, content: recipesWithBg });
        });
    } else if (query === '') {
      this.loadIngredients();
    }
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
      minProtein: null,
    });
    this.triggerSearchFromZero();
  }

  hasActiveFilters(): boolean {
    const values = this.searchForm.value;
    return !!(values.query || values.minCalories || values.maxCalories || values.minProtein);
  }

  triggerSearchFromZero(): void {
    this.currentPage.set(0);
    this.loadIngredients();
  }

  goToPage(pageIndex: number): void {
    if (pageIndex >= 0 && pageIndex < this.totalPages()) {
      this.currentPage.set(pageIndex);
      this.loadIngredients();
    }
  }

  private getRandomGradient(id: number): string {
    const index = id % this.gradients.length;
    return this.gradients[index];
  }

  openIngredientDetail(selectedFood: FoodResponse): void {
    this.dialog.open(IngredientDetailDialogComponent, {
      width: '440px',
      data: selectedFood,
      panelClass: 'custom-dialog-container',
      disableClose: false,
    });
  }
}
