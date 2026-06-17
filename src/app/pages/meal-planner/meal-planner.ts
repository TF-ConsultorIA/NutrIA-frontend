import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { WeeksService } from '../../services/weeks.service';
import { MealPlanService } from '../../services/meal-plan.service';
import { UserService } from '../../services/user.service';
import { Week } from '../../models/week';
import { FoodWeekPlanDetailResponse } from '../../models/food-week-plan';
import { MealDetailDialogComponent } from './dialogs/meal-detail-dialog.component/meal-detail-dialog.component';

@Component({
  selector: 'app-meal-planner',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './meal-planner.html',
  styleUrl: './meal-planner.css',
})
export class MealPlanner implements OnInit {
  private dialog = inject(MatDialog);
  private userService = inject(UserService);

  days = signal<{ name: string; date: string; fullDate: string }[]>([]);
  times = ['Desayuno', 'Almuerzo', 'Cena'];
  currentWeek = signal<Week | null>(null);
  loading = signal(true);
  error = signal<string | null>(null);
  mealPlans = signal<Map<string, FoodWeekPlanDetailResponse>>(new Map());
  totalComidas = computed(() => this.mealPlans().size);

  constructor(
    private weeksService: WeeksService,
    private mealPlanService: MealPlanService,
    private router: Router,
  ) {}

  ngOnInit() {
    this.loadCurrentWeek();
  }

  private loadCurrentWeek() {
    this.loading.set(true);
    this.error.set(null);
    this.weeksService.getCurrentWeek().subscribe({
      next: (week) => {
        this.currentWeek.set(week);
        this.generateWeekDays(week);
        this.loadMealPlans(week.id);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error loading week:', err);
        this.error.set('Error cargando la semana actual. Por favor intenta de nuevo.');
        this.loading.set(false);
      },
    });
  }

  private loadMealPlans(weekId: number) {
    const userId = this.userService.currentUser()?.userId;
    if (!userId) return;

    this.mealPlanService.getPlansByUserAndWeek(userId, weekId).subscribe({
      next: (plans) => {
        const map = new Map<string, FoodWeekPlanDetailResponse>();
        plans.forEach((plan) => map.set(this.slotKey(plan.date, plan.timeDay), plan));
        this.mealPlans.set(map);
      },
      error: (err) => console.error('Error cargando el plan de comidas:', err),
    });
  }

  private slotKey(date: string, mealType: string): string {
    return `${date}_${mealType}`;
  }

  getMealForSlot(
    dayData: { fullDate: string },
    mealType: string,
  ): FoodWeekPlanDetailResponse | undefined {
    return this.mealPlans().get(this.slotKey(dayData.fullDate, mealType));
  }

  private generateWeekDays(week: Week) {
    const newDays: { name: string; date: string; fullDate: string }[] = [];
    const dayNames = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
    for (let i = 0; i < 7; i++) {
      const date = new Date(week.startDate);
      date.setDate(date.getDate() + i);
      const fullDate = date.toISOString().split('T')[0];
      newDays.push({
        name: dayNames[i],
        date: `${date.getMonth() + 1}/${date.getDate()}`,
        fullDate,
      });
    }
    this.days.set(newDays);
  }

  onMealBoxClick(dayData: { name: string; date: string; fullDate: string }, mealType: string) {
    const existingPlan = this.getMealForSlot(dayData, mealType);
    if (existingPlan) {
      this.openMealDetailDialog(existingPlan);
      return;
    }

    const weekId = this.currentWeek()?.id;
    if (!weekId) {
      console.error('No se pudo determinar la semana actual');
      return;
    }
    this.mealPlanService.setSelectedMealSlot(dayData.fullDate, dayData.name, mealType, weekId);
    this.router.navigate(['/food/plate']);
  }

  private openMealDetailDialog(plan: FoodWeekPlanDetailResponse) {
    const dialogRef = this.dialog.open(MealDetailDialogComponent, {
      width: '440px',
      data: plan,
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result === 'updated' || result === 'deleted') {
        const weekId = this.currentWeek()?.id;
        if (weekId) this.loadMealPlans(weekId);
      }
    });
  }
}
