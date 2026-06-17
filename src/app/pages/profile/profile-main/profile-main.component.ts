import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatAutocompleteModule, MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { catchError, debounceTime, distinctUntilChanged, filter, forkJoin, map, Observable, of, switchMap, tap } from 'rxjs';
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
  styleUrl: './profile-main.component.css'
})
export class ProfileMainComponent implements OnInit {
  private preferenceService = inject(PreferenceService);
  private medicalService = inject(MedicalReportService);
  private foodService = inject(FoodService);

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
      filter(val => typeof val === 'string' && val.length > 1),
      switchMap(val => this.foodService.searchPlates(val, FoodType.INGREDIENT, 0, 10).pipe(
        map(res => res.content),
        catchError(() => of([]))
      ))
    );
  }

  displayFn(food: FoodResponse): string {
    return food && food.foodName ? food.foodName : '';
  }

  private loadPreferences() {
    this.preferenceService.getPreferences().subscribe(res => {
      this.resolveFoodNames(res.allergies).subscribe(data => this.alergias = data);
      this.resolveFoodNames(res.liked).subscribe(data => this.agrada = data);
      this.resolveFoodNames(res.disliked).subscribe(data => this.noAgrada = data);
    });
  }

  private resolveFoodNames(items: PreferenceItemDto[]): Observable<PreferenceDisplay[]> {
    if (!items || items.length === 0) return of([]);
    const requests = items.map(item => 
      this.foodService.getFoodById(item.foodId).pipe(
        map(food => ({
          id: item.id,
          foodId: item.foodId,
          foodName: food.foodName
        })),
        catchError(() => of({ id: item.id, foodId: item.foodId, foodName: 'Desconocido' }))
      )
    );
    return forkJoin(requests);
  }

  onAlergiaSelected(event: MatAutocompleteSelectedEvent) {
    const food: FoodResponse = event.option.value;
    this.preferenceService.addPreference({ foodId: food.id, type: 'allergy' }).subscribe(pref => {
      this.alergias.push({ id: pref.id, foodId: pref.foodId, foodName: food.foodName });
      this.alergiaCtrl.setValue('');
    });
  }

  removeAlergia(item: PreferenceDisplay) {
    this.preferenceService.deletePreference(item.id).subscribe(() => {
      this.alergias = this.alergias.filter(a => a.id !== item.id);
    });
  }

  onAgradaSelected(event: MatAutocompleteSelectedEvent) {
    const food: FoodResponse = event.option.value;
    this.preferenceService.addPreference({ foodId: food.id, type: 'liked' }).subscribe(pref => {
      this.agrada.push({ id: pref.id, foodId: pref.foodId, foodName: food.foodName });
      this.agradaCtrl.setValue('');
    });
  }

  removeAgrada(item: PreferenceDisplay) {
    this.preferenceService.deletePreference(item.id).subscribe(() => {
      this.agrada = this.agrada.filter(a => a.id !== item.id);
    });
  }

  onNoAgradaSelected(event: MatAutocompleteSelectedEvent) {
    const food: FoodResponse = event.option.value;
    this.preferenceService.addPreference({ foodId: food.id, type: 'disliked' }).subscribe(pref => {
      this.noAgrada.push({ id: pref.id, foodId: pref.foodId, foodName: food.foodName });
      this.noAgradaCtrl.setValue('');
    });
  }

  removeNoAgrada(item: PreferenceDisplay) {
    this.preferenceService.deletePreference(item.id).subscribe(() => {
      this.noAgrada = this.noAgrada.filter(a => a.id !== item.id);
    });
  }

  private loadMedicalReports() {
    this.medicalService.getMedicalReports(0, 10).subscribe(res => {
      this.medicalReports = res.content;
    });
  }

  onFileSelected(event: any) {
    const file: File = event.target.files[0];
    if (file) {
      this.isUploading = true;
      const today = new Date().toISOString().split('T')[0];
      this.medicalService.uploadReport(file, today).subscribe({
        next: (report) => {
          this.medicalReports.unshift(report);
          this.isUploading = false;
        },
        error: () => {
          this.isUploading = false;
          alert('Error al subir el archivo');
        }
      });
    }
  }
}
