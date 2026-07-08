import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import {
  MatAutocompleteModule,
  MatAutocompleteSelectedEvent,
} from '@angular/material/autocomplete';
import {
  catchError,
  debounceTime,
  distinctUntilChanged,
  filter,
  forkJoin,
  map,
  Observable,
  of,
  switchMap,
} from 'rxjs';
import { PreferenceService } from '../../../services/preference.service';
import { MedicalReportService } from '../../../services/medical-report.service';
import { FoodService } from '../../../services/food.service';
import { FoodResponse, FoodType } from '../../../models/food';
import { PreferenceItemDto } from '../../../models/preference';
import { MedicalReportResponse } from '../../../models/medical-report';

interface PreferenceDisplay {
  id: number;
  foodId: number;
  foodName: string;
}

@Component({
  selector: 'app-profile-main',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatIconModule, MatAutocompleteModule],
  templateUrl: './profile-main.component.html',
  styleUrl: './profile-main.component.css',
})
export class ProfileMainComponent implements OnInit {
  private preferenceService = inject(PreferenceService);
  private medicalService = inject(MedicalReportService);
  private foodService = inject(FoodService);
  private cdr = inject(ChangeDetectorRef);

  activeTab: 'medicos' | 'preferencias' = 'preferencias';

  alergias: PreferenceDisplay[] = [];
  agrada: PreferenceDisplay[] = [];
  noAgrada: PreferenceDisplay[] = [];

  alergiaCtrl = new FormControl('');
  agradaCtrl = new FormControl('');
  noAgradaCtrl = new FormControl('');

  alergiaResults$: Observable<FoodResponse[]>;
  agradaResults$: Observable<FoodResponse[]>;
  noAgradaResults$: Observable<FoodResponse[]>;

  medicalReports: MedicalReportResponse[] = [];
  isUploading = false;

  constructor() {
    this.alergiaResults$ = this.setupSearch(this.alergiaCtrl);
    this.agradaResults$ = this.setupSearch(this.agradaCtrl);
    this.noAgradaResults$ = this.setupSearch(this.noAgradaCtrl);
  }

  ngOnInit() {
    this.loadPreferences();
    this.loadMedicalReports();
  }

  setActiveTab(tab: 'medicos' | 'preferencias') {
    this.activeTab = tab;
  }

  private setupSearch(control: FormControl): Observable<FoodResponse[]> {
    return control.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      filter((val) => typeof val === 'string' && val.length > 1),
      switchMap((val) =>
        this.foodService.searchPlates(val, FoodType.INGREDIENT, 0, 10).pipe(
          map((res) => res.content),
          catchError(() => of([])),
        ),
      ),
    );
  }

  displayFn(food: FoodResponse): string {
    return food && food.foodName ? food.foodName : '';
  }

  private loadPreferences() {
    this.preferenceService.getPreferences().pipe(
      switchMap((res) => {
        const allergies$ = this.resolveFoodNames(res.allergies);
        const liked$ = this.resolveFoodNames(res.liked);
        const disliked$ = this.resolveFoodNames(res.disliked);
        return forkJoin({ allergies: allergies$, liked: liked$, disliked: disliked$ });
      }),
    ).subscribe({
      next: (resolved) => {
        this.alergias = resolved.allergies;
        this.agrada = resolved.liked;
        this.noAgrada = resolved.disliked;
        this.cdr.markForCheck();
      },
      error: () => {
        this.alergias = [];
        this.agrada = [];
        this.noAgrada = [];
        this.cdr.markForCheck();
      },
    });
  }

  private resolveFoodNames(items: PreferenceItemDto[]): Observable<PreferenceDisplay[]> {
    if (!items || items.length === 0) return of([]);
    const requests = items.map((item) =>
      this.foodService.getFoodById(item.foodId).pipe(
        map((food) => ({
          id: item.id,
          foodId: item.foodId,
          foodName: food.foodName,
        })),
        catchError(() => of({ id: item.id, foodId: item.foodId, foodName: 'Desconocido' })),
      ),
    );
    return forkJoin(requests);
  }

  onAlergiaSelected(event: MatAutocompleteSelectedEvent) {
    const food: FoodResponse = event.option.value;
    this.preferenceService.addPreference({ foodId: food.id, type: 'allergy' }).subscribe((pref) => {
      this.alergias = [...this.alergias, { id: pref.id, foodId: pref.foodId, foodName: food.foodName }];
      this.alergiaCtrl.setValue('');
      this.cdr.markForCheck();
    });
  }

  removeAlergia(item: PreferenceDisplay) {
    this.preferenceService.deletePreference(item.id).subscribe(() => {
      this.alergias = this.alergias.filter((a) => a.id !== item.id);
      this.cdr.markForCheck();
    });
  }

  onAgradaSelected(event: MatAutocompleteSelectedEvent) {
    const food: FoodResponse = event.option.value;
    this.preferenceService.addPreference({ foodId: food.id, type: 'liked' }).subscribe((pref) => {
      this.agrada = [...this.agrada, { id: pref.id, foodId: pref.foodId, foodName: food.foodName }];
      this.agradaCtrl.setValue('');
      this.cdr.markForCheck();
    });
  }

  removeAgrada(item: PreferenceDisplay) {
    this.preferenceService.deletePreference(item.id).subscribe(() => {
      this.agrada = this.agrada.filter((a) => a.id !== item.id);
      this.cdr.markForCheck();
    });
  }

  onNoAgradaSelected(event: MatAutocompleteSelectedEvent) {
    const food: FoodResponse = event.option.value;
    this.preferenceService
      .addPreference({ foodId: food.id, type: 'disliked' })
      .subscribe((pref) => {
        this.noAgrada = [...this.noAgrada, { id: pref.id, foodId: pref.foodId, foodName: food.foodName }];
        this.noAgradaCtrl.setValue('');
        this.cdr.markForCheck();
      });
  }

  removeNoAgrada(item: PreferenceDisplay) {
    this.preferenceService.deletePreference(item.id).subscribe(() => {
      this.noAgrada = this.noAgrada.filter((a) => a.id !== item.id);
      this.cdr.markForCheck();
    });
  }

  private loadMedicalReports() {
    this.medicalService.getMedicalReports(0, 10).subscribe((res) => {
      this.medicalReports = res.content;
      this.cdr.markForCheck();
    });
  }

  onFileSelected(event: any) {
    const file: File = event.target.files[0];
    if (file) {
      this.isUploading = true;
      const today = new Date().toISOString().split('T')[0];
      this.medicalService.uploadReport(file, today).subscribe({
        next: (report) => {
          this.medicalReports = [report, ...this.medicalReports];
          this.isUploading = false;
          this.cdr.markForCheck();
        },
        error: () => {
          this.isUploading = false;
          this.cdr.markForCheck();
          alert('Error al subir el archivo');
        },
      });
    }
  }
}
