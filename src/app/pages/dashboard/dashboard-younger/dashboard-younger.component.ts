import {
  Component,
  computed,
  inject,
  OnInit,
  signal,
  ChangeDetectionStrategy,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { UserService } from '../../../services/user.service';
import { CommonModule } from '@angular/common';
import { StreakService } from '../../../services/streak.service';
import { UserWeightService } from '../../../services/user-weight.service';
import { UserWeightCreateRequest, UserWeightResponse } from '../../../models/user-weight';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import {
  ApexChart,
  NgApexchartsModule,
  ApexAxisChartSeries,
  ApexGrid,
  ApexMarkers,
  ApexStroke,
  ApexTheme,
  ApexXAxis,
  ApexYAxis,
} from 'ng-apexcharts';
import { DateUtilsService } from '../../../utils/date-utils.service';
import { take } from 'rxjs';
import { MetricsService } from '../../../services/metrics.service';
import { UserMetricResponse } from '../../../models/metrics';

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
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './dashboard-younger.component.css',
})
export class DashboardYoungerComponent implements OnInit {
  private userService = inject(UserService);
  private streakService = inject(StreakService);
  private userWeightService = inject(UserWeightService);
  private dateUtils = inject(DateUtilsService);
  private metricsService = inject(MetricsService);
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

  public totalEvolution = computed(() => {
    const weights = this.userWeights();
    if (weights.length < 2) return 'Sin datos';

    const diff = weights[weights.length - 1].weightKg - weights[0].weightKg;
    const sign = diff > 0 ? '+' : '';
    return `${sign}${diff.toFixed(1)} kg`;
  });

  public userMetrics = signal<UserMetricResponse | null>(null);

  weightForm = this.fb.group({
    weightKg: [null, [Validators.required, Validators.min(0)]],
  });

  ngOnInit(): void {
    if (this.user) {
      this.streakService
        .getCurrentStreak(this.user.userId)
        .pipe(take(1))
        .subscribe((streak) => {
          this.currentStreak.set(streak.streakNumber);
        });
    }
    this.loadUserWeights();
    this.loadUserMetrics();
  }

  loadUserWeights() {
    this.userWeightService
      .listWeights()
      .pipe(take(1))
      .subscribe((weights) => {
        weights.sort(
          (a, b) => new Date(a.registerDate).getTime() - new Date(b.registerDate).getTime(),
        );

        this.userWeights.set(weights);

        if (weights.length > 0) {
          this.lastWeight.set(weights[weights.length - 1]);
          this.minimumWeight.set(Math.min(...weights.map((w) => w.weightKg)));
          this.maximumWeight.set(Math.max(...weights.map((w) => w.weightKg)));
          this.initChart();
        }
        if (weights.length > 1) {
          this.previousWeight.set(weights[weights.length - 2]);
        }
        if (this.lastWeight() && this.previousWeight()) {
          this.weighChange.set(this.lastWeight()!.weightKg - this.previousWeight()!.weightKg);
        }
      });
  }

  loadUserMetrics() {
    this.metricsService
      .getMetrics()
      .pipe(take(1))
      .subscribe((metrics) => {
        this.userMetrics.set(metrics);
      });
  }

  registerWeight() {
    if (this.weightForm.valid) {
      this.weightForm.disable();
      const weightKg = this.weightForm.value.weightKg;
      let request: UserWeightCreateRequest = {
        registerDate: this.dateUtils.formatDateToLocale(new Date()),
        weightKg: weightKg || 0,
      };
      if (weightKg && this.user) {
        this.userWeightService
          .registerWeight(request)
          .pipe(take(1))
          .subscribe(() => {
            this.loadUserWeights();
            this.weightForm.reset();
            this.weightForm.enable();
          });
      }
    }
  }

  get user() {
    return this.userService.currentUser();
  }

  public chartOptions!: Partial<ChartOptions>;

  private initChart(): void {
    const weights = this.userWeights().map((item) => item.weightKg);
    const dates = this.userWeights().map((item) => item.registerDate);

    this.chartOptions = {
      series: [
        {
          name: 'Peso',
          data: weights,
        },
      ],
      chart: {
        type: 'area' as 'area',
        height: 240,
        toolbar: { show: false },
        zoom: { enabled: false },
      },
      stroke: {
        curve: 'smooth',
        width: 3,
        colors: ['#2D8B57'],
      },
      markers: {
        size: 5,
        colors: ['#A8F0C8'],
        strokeColors: '#2D8B57',
        strokeWidth: 2,
        hover: { size: 7 },
      },
      xaxis: {
        categories: dates,
        labels: {
          style: { colors: '#9CA3AF', fontSize: '12px' },
        },
        axisBorder: { show: false },
        axisTicks: { show: false },
      },
      yaxis: {
        labels: {
          style: { colors: '#9CA3AF', fontSize: '12px' },
          formatter: (val) => `${val.toFixed(0)}`,
        },
      },
      grid: {
        borderColor: '#F3F4F6',
        strokeDashArray: 4,
        xaxis: { lines: { show: false } },
        yaxis: { lines: { show: true } },
      },
      theme: {
        monochrome: {
          enabled: true,
          color: '#2D8B57',
          shadeTo: 'light',
          shadeIntensity: 0.1,
        },
      },
    };
  }
}
