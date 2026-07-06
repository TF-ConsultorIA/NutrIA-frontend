import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, signal, ChangeDetectionStrategy } from '@angular/core';
import { NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs';

@Component({
  selector: 'app-food-search-wrapper.component',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, CommonModule],
  templateUrl: './food-search-wrapper.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './food-search-wrapper.component.css',
})
export class FoodSearchWrapperComponent implements OnInit {
  private router = inject(Router);
  public foodTypeLabel = signal<string>('recetas');

  ngOnInit(): void {
    this.updateFoodTypeLabel(this.router.url);

    this.router.events
      .pipe(filter((event): event is NavigationEnd => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        this.updateFoodTypeLabel(event.url);
      });
  }

  updateFoodTypeLabel(path: string) {
    if (path.includes('recetas')) {
      this.foodTypeLabel.set('recetas');
    } else if (path.includes('ingredientes')) {
      this.foodTypeLabel.set('ingredientes');
    }
  }
}
