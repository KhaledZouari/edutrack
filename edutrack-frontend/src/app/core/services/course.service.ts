import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { CourseRequest, CourseResponse } from '../models/course.model';

@Injectable({ providedIn: 'root' })
export class CourseService {
  private http = inject(HttpClient);
  private base = `${environment.apiUrl}/courses`;

  getCourses(filters: { categoryId?: number; teacherId?: number; q?: string } = {}): Observable<CourseResponse[]> {
    let params = new HttpParams();
    if (filters.categoryId) params = params.set('categoryId', filters.categoryId);
    if (filters.teacherId) params = params.set('teacherId', filters.teacherId);
    if (filters.q) params = params.set('q', filters.q);
    return this.http.get<CourseResponse[]>(this.base, { params });
  }

  getAllCourses(): Observable<CourseResponse[]> {
    return this.getCourses();
  }

  getCourseById(id: number): Observable<CourseResponse> {
    return this.http.get<CourseResponse>(`${this.base}/${id}`);
  }

  createCourse(request: CourseRequest): Observable<CourseResponse> {
    return this.http.post<CourseResponse>(this.base, request);
  }

  addCourse(request: CourseRequest): Observable<CourseResponse> {
    return this.createCourse(request);
  }

  updateCourse(id: number, request: CourseRequest): Observable<CourseResponse> {
    return this.http.put<CourseResponse>(`${this.base}/${id}`, request);
  }

  deleteCourse(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}`);
  }
}
