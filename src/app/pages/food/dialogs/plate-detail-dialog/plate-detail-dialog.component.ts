import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { FoodResponse } from '../../../../models/food';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MealPlanService } from '../../../../services/meal-plan.service';

@Component({
  selector: 'app-plate-detail-dialog.component',
  imports: [ReactiveFormsModule, CommonModule, MatIconModule],
  templateUrl: './plate-detail-dialog.component.html',
  styleUrl: './plate-detail-dialog.component.css',
})

export class PlateDetailDialogComponent implements OnInit {
  private fb = inject(FormBuilder);
  private mealPlanService = inject(MealPlanService);

  public dialogRef = inject(MatDialogRef<PlateDetailDialogComponent>);
  public food: FoodResponse = inject(MAT_DIALOG_DATA);

  // Days and times for dropdowns
  public days = signal<string[]>([
    'Lunes',
    'Martes',
    'Miércoles',
    'Jueves',
    'Viernes',
    'Sábado',
    'Domingo',
  ]);

  public times = signal<string[]>(['Desayuno', 'Almuerzo', 'Cena']);

  planForm = this.fb.group({
    day: ['', [Validators.required]],
    timeSlot: ['', [Validators.required]],
    amountGrams: [200, [Validators.required, Validators.min(1)]],
  });

  public nutrients = signal<{ label: string; value: string }[]>([]);

  ngOnInit(): void {
    this.buildNutrientTable();
    this.preFillFormFromMealPlan();
  }

  private preFillFormFromMealPlan(): void {
    const selectedMeal = this.mealPlanService.getSelectedMealSlot();
    
    if (selectedMeal) {
      console.log('Pre-filling form with:', selectedMeal);
      
      // Map day name from meal planner format (Lun, Mar, etc.) to full names
      const dayMapping: { [key: string]: string } = {
        'Lun': 'Lunes',
        'Mar': 'Martes',
        'Mié': 'Miércoles',
        'Jue': 'Jueves',
        'Vie': 'Viernes',
        'Sáb': 'Sábado',
        'Dom': 'Domingo',
      };

      const fullDayName = dayMapping[selectedMeal.dayName] || selectedMeal.dayName;

      this.planForm.patchValue({
        day: fullDayName,
        timeSlot: selectedMeal.mealType,
      });
    }
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

  onAdd(): void {
    if (this.planForm.valid) {
      const dataToSave = {
        foodId: this.food.id,
        ...this.planForm.value,
      };

      this.dialogRef.close(dataToSave);
    }
  }
}
