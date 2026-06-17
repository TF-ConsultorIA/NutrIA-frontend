import { Injectable, signal } from '@angular/core';

export interface SelectedMealSlot {
  date: string; // Format: yyyy-MM-dd
  dayName: string; // Lun, Mar, etc.
  mealType: string; // Desayuno, Almuerzo, Cena
}

@Injectable({
  providedIn: 'root'
})
export class MealPlanService {
  private selectedMealSlot = signal<SelectedMealSlot | null>(null);

  getSelectedMealSlot = this.selectedMealSlot.asReadonly();

  setSelectedMealSlot(date: string, dayName: string, mealType: string) {
    this.selectedMealSlot.set({
      date,
      dayName,
      mealType
    });
    console.log('Selected meal slot:', { date, dayName, mealType });
  }

  clearSelectedMealSlot() {
    this.selectedMealSlot.set(null);
  }
}
