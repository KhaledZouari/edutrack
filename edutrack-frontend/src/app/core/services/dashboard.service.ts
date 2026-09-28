import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AdminDashboard, StudentDashboard, TeacherDashboard } from '../models/dashboard.model';

@Injectable({ providedIn: 'root' })
export class DashboardService {
  private http = inject(HttpClient);
  private base = `${environment.apiUrl}/dashboard`;

  getAdminDashboard(): Observable<AdminDashboard> {
    return this.http.get<AdminDashboard>(`${this.base}/admin`);
  }

  getTeacherDashboard(): Observable<TeacherDashboard> {
    return this.http.get<TeacherDashboard>(`${this.base}/teacher`);
  }

  getStudentDashboard(): Observable<StudentDashboard> {
    return this.http.get<StudentDashboard>(`${this.base}/student`);
  }
}
