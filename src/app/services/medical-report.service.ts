import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { UserService } from './user.service';
import { MedicalReportResponse } from '../models/medical-report';
import { PageResponse } from '../models/page-response';

@Injectable({
  providedIn: 'root',
})
export class MedicalReportService {
  private http = inject(HttpClient);
  private userService = inject(UserService);

  private get userId() {
    return this.userService.currentUser()?.userId;
  }

  getMedicalReports(page: number = 0, size: number = 10, sort: string = 'createdAt,desc') {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString())
      .set('sort', sort);
      
    return this.http.get<PageResponse<MedicalReportResponse>>(`${environment.apiUrl}/medical-reports/user/${this.userId}`, { params });
  }

  uploadReport(file: File, date: string) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('date', date);
    formData.append('userId', this.userId!.toString());

    return this.http.post<MedicalReportResponse>(`${environment.apiUrl}/medical-reports/user/${this.userId}`, formData);
  }
}
