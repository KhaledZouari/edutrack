import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { EnrollmentResponse } from '../models/enrollment.model';

@Injectable({ providedIn: 'root' })
export class EnrollmentService {
  private http = inject(HttpClient);
  private base = `${environment.apiUrl}/enrollments`;

  getEnrollments(): Observable<EnrollmentResponse[]> {
    return this.http.get<EnrollmentResponse[]>(this.base);
  }

  enroll(courseId: number): Observable<EnrollmentResponse> {
    return this.http.post<EnrollmentResponse>(`${this.base}/course/${courseId}`, {});
  }

  updateProgress(id: number, progress: number): Observable<EnrollmentResponse> {
    const params = new HttpParams().set('progress', progress);
    return this.http.put<EnrollmentResponse>(`${this.base}/${id}/progress`, {}, { params });
  }

  deleteEnrollment(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}`);
  }
}
