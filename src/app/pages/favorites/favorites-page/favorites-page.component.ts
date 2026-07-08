import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { FavoriteService } from '../../../services/favorite.service';
import { FoodService } from '../../../services/food.service';
import { FavoriteResponse } from '../../../models/favorite';
import { forkJoin, of, catchError, map, switchMap } from 'rxjs';

interface FavoriteDisplay {
  id: number;
  foodId: number;
  foodName: string;
  addedDate: string;
}

@Component({
  selector: 'app-favorites-page',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  templateUrl: './favorites-page.component.html',
  styleUrl: './favorites-page.component.css',
})
export class FavoritesPageComponent implements OnInit {
  private favoriteService = inject(FavoriteService);
  private foodService = inject(FoodService);
  private cdr = inject(ChangeDetectorRef);

  favorites: FavoriteDisplay[] = [];
  isLoading = true;

  ngOnInit() {
    this.loadFavorites();
  }

  private loadFavorites() {
    this.isLoading = true;
    this.favoriteService.getFavorites(0, 100).pipe(
      switchMap((res) => {
        if (!res.content || res.content.length === 0) {
          return of([]);
        }
        const requests = res.content.map((fav: FavoriteResponse) =>
          this.foodService.getFoodById(fav.foodId).pipe(
            map((food) => ({
              id: fav.id,
              foodId: fav.foodId,
              foodName: food.foodName,
              addedDate: fav.addedDate,
            })),
            catchError(() =>
              of({
                id: fav.id,
                foodId: fav.foodId,
                foodName: 'Receta desconocida',
                addedDate: fav.addedDate,
              }),
            ),
          ),
        );
        return forkJoin(requests);
      }),
    ).subscribe({
      next: (resolved) => {
        this.favorites = resolved as FavoriteDisplay[];
        this.isLoading = false;
        this.cdr.markForCheck();
      },
      error: () => {
        this.favorites = [];
        this.isLoading = false;
        this.cdr.markForCheck();
      },
    });
  }

  removeFavorite(item: FavoriteDisplay) {
    this.favoriteService.removeFavorite(item.id).subscribe(() => {
      this.favorites = this.favorites.filter((f) => f.id !== item.id);
      this.cdr.markForCheck();
    });
  }
}
