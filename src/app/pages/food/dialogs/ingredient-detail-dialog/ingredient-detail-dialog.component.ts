import { Component, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { FoodResponse } from '../../../../models/food';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-ingredient-detail-dialog.component',
  imports: [MatIconModule],
  templateUrl: './ingredient-detail-dialog.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './ingredient-detail-dialog.component.css',
})
export class IngredientDetailDialogComponent {
  public dialogRef = inject(MatDialogRef<IngredientDetailDialogComponent>);

  public food: FoodResponse = inject(MAT_DIALOG_DATA);
  public nutrients = signal<{ label: string; value: string }[]>([]);

  ngOnInit(): void {
    this.buildNutrientTable();
  }

  private buildNutrientTable(): void {
    if (!this.food) return;

    this.nutrients.set([
      { label: 'Calorías', value: `${this.food.energy ? this.food.energy.toFixed(1) : '-'} kcal` },
      {
        label: 'Proteínas',
        value: `${this.food.proteins ? this.food.proteins.toFixed(1) : '-'} g`,
      },
      {
        label: 'Grasas totales',
        value: `${this.food.totalFat ? this.food.totalFat.toFixed(1) : '-'} g`,
      },
      {
        label: 'Carbohidratos totales',
        value: `${this.food.carbohydratesTotal ? this.food.carbohydratesTotal.toFixed(1) : '-'} g`,
      },
      { label: 'Calcio', value: `${this.food.calcium ? this.food.calcium.toFixed(1) : '-'} g` },
      { label: 'Hierro', value: `${this.food.iron ? this.food.iron.toFixed(1) : '-'} g` },
      { label: 'Sodio', value: `${this.food.sodium ? this.food.sodium.toFixed(1) : '-'} g` },
      { label: 'Agua', value: `${this.food.water ? this.food.water.toFixed(1) : '-'} g` },
    ]);
  }

  onCancel(): void {
    this.dialogRef.close(null);
  }
}
