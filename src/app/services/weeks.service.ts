import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Week } from '../models/week';
import { map } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class WeeksService {
  private baseUrl = `${environment.apiUrl}/weeks`;

  constructor(private http: HttpClient) {}

  getWeeks() {
    return this.http.get<any[]>(`${this.baseUrl}`).pipe(
      map(weeks => 
        weeks.map(week => ({
          ...week,
          startDate: new Date(week.startDate),
          endDate: new Date(week.endDate)
        }))
      )
    );
  }

  getCurrentWeek() {
    return this.http.get<any>(`${this.baseUrl}/current`).pipe(
      map(week => ({
        ...week,
        startDate: new Date(week.startDate),
        endDate: new Date(week.endDate)
      }))
    );
  }
}
