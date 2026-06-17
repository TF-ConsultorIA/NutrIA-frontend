import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { WeeksService } from '../../services/weeks.service';
import { MealPlanService } from '../../services/meal-plan.service';
import { Week } from '../../models/week';

@Component({
  selector: 'app-meal-planner',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './meal-planner.html',
  styleUrl: './meal-planner.css',
})
export class MealPlanner implements OnInit {
  days = signal<{ name: string; date: string; fullDate: string }[]>([]);
  times = ['Desayuno', 'Almuerzo', 'Cena'];
  currentWeek = signal<Week | null>(null);
  loading = signal(true);
  error = signal<string | null>(null);

  constructor(
    private weeksService: WeeksService,
    private mealPlanService: MealPlanService,
    private router: Router
  ) {}

  ngOnInit() {
    console.log('MealPlanner component initialized');
    this.loadCurrentWeek();
  }

  private loadCurrentWeek() {
    this.loading.set(true);
    this.error.set(null);

    this.weeksService.getCurrentWeek()
      .subscribe({
        next: (week) => {
          this.currentWeek.set(week);
          this.generateWeekDays(week);
          this.loading.set(false);
        },
        error: (err) => {
          console.error('Error loading week:', err);
          this.error.set('Error cargando la semana actual. Por favor intenta de nuevo.');
          this.loading.set(false);
        }
      });
  }

  private generateWeekDays(week: Week) {
    const newDays: { name: string; date: string; fullDate: string }[] = [];
    const dayNames = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
    
    for (let i = 0; i < 7; i++) {
      const date = new Date(week.startDate);
      date.setDate(date.getDate() + i);
      
      // Format full date as yyyy-MM-dd
      const fullDate = date.toISOString().split('T')[0];
      
      newDays.push({
        name: dayNames[i],
        date: `${date.getMonth() + 1}/${date.getDate()}`,
        fullDate: fullDate
      });
    }
    this.days.set(newDays);
  }

  onMealBoxClick(dayData: { name: string; date: string; fullDate: string }, mealType: string) {
    console.log(`Clicked: ${mealType} on ${dayData.name} (${dayData.fullDate})`);
    
    // Store the selected meal slot
    this.mealPlanService.setSelectedMealSlot(dayData.fullDate, dayData.name, mealType);
    
    // Navigate to food/recetas page
    this.router.navigate(['/food/plate']);
  }
}
