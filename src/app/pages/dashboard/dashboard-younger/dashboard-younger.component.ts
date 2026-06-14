import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { UserService } from '../../../services/user.service';
import { CommonModule } from '@angular/common';
import { StreakService } from '../../../services/streak.service';
import { UserWeightService } from '../../../services/user-weight.service';
import { UserWeightCreateRequest, UserWeightResponse } from '../../../models/user-weight';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ApexChart, NgApexchartsModule, ApexAxisChartSeries, ApexGrid, ApexMarkers, ApexStroke, ApexTheme, ApexXAxis, ApexYAxis } from 'ng-apexcharts'
import { DateUtilsService } from '../../../utils/date-utils.service';

export type ChartOptions = {
  series: ApexAxisChartSeries;
  chart: ApexChart;
  xaxis: ApexXAxis;
  yaxis: ApexYAxis;
  stroke: ApexStroke;
  markers: ApexMarkers;
  grid: ApexGrid;
  theme: ApexTheme;
};

@Component({
  standalone: true,
  selector: 'app-dashboard-younger.component',
  imports: [MatButtonModule, MatIconModule, CommonModule, ReactiveFormsModule, NgApexchartsModule],
  templateUrl: './dashboard-younger.component.html',
  styleUrl: './dashboard-younger.component.css',
})
export class DashboardYoungerComponent implements OnInit {
  private userService = inject(UserService);
  private streakService = inject(StreakService);
  private userWeightService = inject(UserWeightService);
  private dateUtils = inject(DateUtilsService);
  private fb = inject(FormBuilder);
  currentDate = new Date();

  currentStreak = signal(0);
  userWeights = signal<UserWeightResponse[]>([]);
  lastWeight = signal<UserWeightResponse | null>(null);
  previousWeight = signal<UserWeightResponse | null>(null);
  weighChange = signal<number | null>(null);
  minimumWeight = signal<number | null>(null);
  maximumWeight = signal<number | null>(null);
  public hasData = computed(() => this.userWeights().length > 0);

  weightForm = this.fb.group({
    weightKg: [null, [Validators.required, Validators.min(0)]],
  });

  ngOnInit(): void {
    if (this.user) {
      this.streakService.getCurrentStreak(this.user.userId).subscribe((streak) => {
        this.currentStreak.set(streak.streakNumber);
      });
    }
    this.loadUserWeights();
  }

  loadUserWeights() {
    this.userWeightService.listWeights().subscribe((weights) => {
      weights.sort((a, b) => new Date(a.registerDate).getTime() - new Date(b.registerDate).getTime());
      this.userWeights.set(weights);
      if (weights.length > 0) {
        this.lastWeight.set(weights[weights.length - 1]);
      }
      if (weights.length > 1) {
        this.previousWeight.set(weights[weights.length - 2]);
      }
      if (this.lastWeight() && this.previousWeight()) {
        this.weighChange.set(this.lastWeight()!.weightKg - this.previousWeight()!.weightKg);
      }
      if (weights.length > 0) {
        this.minimumWeight.set(Math.min(...weights.map((w) => w.weightKg)));
        this.maximumWeight.set(Math.max(...weights.map((w) => w.weightKg)));
      }

      this.initChart();
    });
  }

  registerWeight() {
    if (this.weightForm.valid) {
      const weightKg = this.weightForm.value.weightKg;
      let request: UserWeightCreateRequest = {
        registerDate: this.dateUtils.formatDateToLocale(new Date()),
        weightKg: weightKg || 0,
      };
      if (weightKg && this.user) {
        this.userWeightService.registerWeight(request).subscribe(() => {
          this.loadUserWeights();
          this.weightForm.reset();
        });
      }
    }
  }

  get user() {
    return this.userService.currentUser();
  }

  public chartOptions!: Partial<ChartOptions>;

  private initChart(): void {
    const weights = this.userWeights().map(item => item.weightKg);
    const dates = this.userWeights().map(item => item.registerDate);

    this.chartOptions = {
      series: [
        {
          name: 'Peso',
          data: weights
        }
      ],
      chart: {
        type: 'area' as "area",
        height: 240,
        toolbar: { show: false },
        zoom: { enabled: false }
      },
      stroke: {
        curve: 'smooth',
        width: 3,
        colors: ['#2D8B57']
      },
      markers: {
        size: 5,
        colors: ['#A8F0C8'],
        strokeColors: '#2D8B57',
        strokeWidth: 2,
        hover: { size: 7 }
      },
      xaxis: {
        categories: dates,
        labels: {
          style: { colors: '#9CA3AF', fontSize: '12px' }
        },
        axisBorder: { show: false },
        axisTicks: { show: false }
      },
      yaxis: {
        labels: {
          style: { colors: '#9CA3AF', fontSize: '12px' },
          formatter: (val) => `${val.toFixed(0)}`
        }
      },
      grid: {
        borderColor: '#F3F4F6',
        strokeDashArray: 4,
        xaxis: { lines: { show: false } },
        yaxis: { lines: { show: true } }
      },
      theme: {
        monochrome: {
          enabled: true,
          color: '#2D8B57',
          shadeTo: 'light',
          shadeIntensity: 0.1
        }
      }
    };
  }
}
