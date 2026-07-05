import { Component, inject, OnInit, signal, ChangeDetectionStrategy } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { FoodResponse } from '../../../../models/food';
import { TimeDay } from '../../../../models/food-week-plan';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MealPlanService } from '../../../../services/meal-plan.service';
import { UserService } from '../../../../services/user.service';
import { Router } from '@angular/router';
import { Week } from '../../../../models/week';

@Component({
  selector: 'app-plate-detail-dialog.component',
  imports: [ReactiveFormsModule, CommonModule, MatIconModule],
  templateUrl: './plate-detail-dialog.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
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
    'Lunes',
    'Martes',
    'Miércoles',
    'Jueves',
    'Viernes',
    'Sábado',
    'Domingo',
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
        Lun: 'Lunes',
        Mar: 'Martes',
        Mié: 'Miércoles',
        Jue: 'Jueves',
        Vie: 'Viernes',
        Sáb: 'Sábado',
        Dom: 'Domingo',
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
    if (this.planForm.invalid) return;

    const userId = this.userService.currentUser()?.userId;
    if (!userId) {
      this.saveError.set('No se pudo identificar al usuario. Inicia sesión de nuevo.');
      return;
    }

    this.saving.set(true);
    this.saveError.set(null);

    // Obtiene la semana actual del backend
    this.mealPlanService.getCurrentWeek().subscribe({
      next: (week: Week) => {
        const selectedDay = this.planForm.value.day!;
        const selectedTime = this.planForm.value.timeSlot!;

        const offset =
          { Lunes: 0, Martes: 1, Miércoles: 2, Jueves: 3, Viernes: 4, Sábado: 5, Domingo: 6 }[
            selectedDay
          ] ?? 0;
        const date = new Date(week.startDate);
        date.setDate(date.getDate() + offset);
        const dateStr = date.toISOString().split('T')[0];

        const request = {
          weekId: week.id,
          foodId: this.food.id,
          userId,
          date: dateStr,
          timeDay: this.timeDayMap[selectedTime],
          portion: this.planForm.value.amountGrams!,
        };

        this.mealPlanService.addMeal(request).subscribe({
          next: () => {
            this.saving.set(false);
            this.mealPlanService.clearSelectedMealSlot();
            this.dialogRef.close('added');
          },
          error: (err) => {
            console.error('Error al añadir la comida', err);
            this.saving.set(false);
            this.saveError.set('Ocurrió un error al guardar la comida. Intenta de nuevo.');
          },
        });
      },
      error: () => {
        this.saving.set(false);
        this.saveError.set('No se pudo obtener la semana actual. Intenta de nuevo.');
      },
    });
  }
}
