import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { FoodResponse } from '../../../../models/food';
import { TimeDay } from '../../../../models/food-week-plan';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MealPlanService } from '../../../../services/meal-plan.service';
import { UserService } from '../../../../services/user.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-plate-detail-dialog.component',
  imports: [ReactiveFormsModule, CommonModule, MatIconModule],
  templateUrl: './plate-detail-dialog.component.html',
  styleUrl: './plate-detail-dialog.component.css',
})
export class PlateDetailDialogComponent implements OnInit {
  private fb = inject(FormBuilder);
  private mealPlanService = inject(MealPlanService);
  private userService = inject(UserService);
  private router = inject(Router);
  public dialogRef = inject(MatDialogRef<PlateDetailDialogComponent>);
  public food: FoodResponse = inject(MAT_DIALOG_DATA);

  public days = signal<string[]>([
    'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo',
  ]);
  public times = signal<string[]>(['Desayuno', 'Almuerzo', 'Cena']);

private readonly timeDayMap: Record<string, TimeDay> = {
  Desayuno: 'Desayuno',
  Almuerzo: 'Almuerzo',
  Cena: 'Cena',
};

  planForm = this.fb.group({
    day: ['', [Validators.required]],
    timeSlot: ['', [Validators.required]],
    amountGrams: [200, [Validators.required, Validators.min(1)]],
  });

  public nutrients = signal<{ label: string; value: string }[]>([]);
  public saving = signal(false);
  public saveError = signal<string | null>(null);

  ngOnInit(): void {
    this.buildNutrientTable();
    this.preFillFormFromMealPlan();
  }

  private preFillFormFromMealPlan(): void {
    const selectedMeal = this.mealPlanService.getSelectedMealSlot();
    if (selectedMeal) {
      const dayMapping: { [key: string]: string } = {
        Lun: 'Lunes', Mar: 'Martes', Mié: 'Miércoles', Jue: 'Jueves',
        Vie: 'Viernes', Sáb: 'Sábado', Dom: 'Domingo',
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
      { label: 'Proteínas', value: `${this.food.proteins ? this.food.proteins.toFixed(1) : '-'} g` },
      { label: 'Grasas totales', value: `${this.food.totalFat ? this.food.totalFat.toFixed(1) : '-'} g` },
      { label: 'Carbohidratos totales', value: `${this.food.carbohydratesTotal ? this.food.carbohydratesTotal.toFixed(1) : '-'} g` },
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
    if (this.planForm.invalid) return;

    const slot = this.mealPlanService.getSelectedMealSlot();
    if (!slot) {
      this.saveError.set('No se encontró el día/horario seleccionado. Vuelve al calendario e intenta de nuevo.');
      return;
    }

    const userId = this.userService.currentUser()?.userId;
    if (!userId) {
      this.saveError.set('No se pudo identificar al usuario. Inicia sesión de nuevo.');
      return;
    }

    const timeSlotValue = this.planForm.value.timeSlot!;
    const request = {
      weekId: slot.weekId,
      foodId: this.food.id,
      userId,
      date: slot.date,
      timeDay: this.timeDayMap[timeSlotValue],
      portion: this.planForm.value.amountGrams!,
    };

    this.saving.set(true);
    this.saveError.set(null);

    this.mealPlanService.addMeal(request).subscribe({
      next: () => {
        this.mealPlanService.clearSelectedMealSlot();
        this.saving.set(false);
        this.dialogRef.close(true);
        this.router.navigate(['/meal-planner']);
      },
      error: (err) => {
        console.error('Error al añadir la comida', err);
        this.saving.set(false);
        this.saveError.set('Ocurrió un error al guardar la comida. Intenta de nuevo.');
      },
    });
  }
}