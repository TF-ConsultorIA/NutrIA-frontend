import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { FoodWeekPlanDetailResponse } from '../../../../models/food-week-plan';
import { MealPlanService } from '../../../../services/meal-plan.service';

@Component({
  selector: 'app-meal-detail-dialog',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatIconModule],
  templateUrl: './meal-detail-dialog.component.html',
  styleUrl: './meal-detail-dialog.component.css',
})
export class MealDetailDialogComponent implements OnInit {
  private fb = inject(FormBuilder);
  private mealPlanService = inject(MealPlanService);
  public dialogRef = inject(MatDialogRef<MealDetailDialogComponent>);
  public plan: FoodWeekPlanDetailResponse = inject(MAT_DIALOG_DATA);

  public nutrients = signal<{ label: string; value: string }[]>([]);
  public editing = signal(false);
  public saving = signal(false);
  public errorMsg = signal<string | null>(null);

  portionForm = this.fb.group({
    portion: [0, [Validators.required, Validators.min(1)]],
  });

  ngOnInit(): void {
    this.buildNutrientTable();
    this.portionForm.patchValue({ portion: this.plan.portion });
  }

  private buildNutrientTable(): void {
    const food = this.plan.food;
    this.nutrients.set([
      { label: 'Calorías', value: `${food.energy ? food.energy.toFixed(1) : '-'} kcal` },
      { label: 'Proteínas', value: `${food.proteins ? food.proteins.toFixed(1) : '-'} g` },
      { label: 'Grasas totales', value: `${food.totalFat ? food.totalFat.toFixed(1) : '-'} g` },
      { label: 'Carbohidratos totales', value: `${food.carbohydratesTotal ? food.carbohydratesTotal.toFixed(1) : '-'} g` },
      { label: 'Calcio', value: `${food.calcium ? food.calcium.toFixed(1) : '-'} g` },
      { label: 'Hierro', value: `${food.iron ? food.iron.toFixed(1) : '-'} g` },
      { label: 'Sodio', value: `${food.sodium ? food.sodium.toFixed(1) : '-'} g` },
      { label: 'Agua', value: `${food.water ? food.water.toFixed(1) : '-'} g` },
    ]);
  }

  onClose(): void {
    this.dialogRef.close(null);
  }

  toggleEdit(): void {
    this.editing.set(!this.editing());
  }

  onSavePortion(): void {
    if (this.portionForm.invalid) return;

    this.saving.set(true);
    this.errorMsg.set(null);

    this.mealPlanService.updatePortion(this.plan.id, { portion: this.portionForm.value.portion! }).subscribe({
      next: () => {
        this.saving.set(false);
        this.dialogRef.close('updated');
      },
      error: (err) => {
        console.error('Error al actualizar la porción', err);
        this.saving.set(false);
        this.errorMsg.set('No se pudo actualizar la porción. Intenta de nuevo.');
      },
    });
  }

  onDelete(): void {
    if (!confirm('¿Seguro que quieres eliminar esta comida del plan?')) return;

    this.saving.set(true);
    this.mealPlanService.deleteMeal(this.plan.id).subscribe({
      next: () => {
        this.saving.set(false);
        this.dialogRef.close('deleted');
      },
      error: (err) => {
        console.error('Error al eliminar la comida', err);
        this.saving.set(false);
        this.errorMsg.set('No se pudo eliminar la comida. Intenta de nuevo.');
      },
    });
  }
}