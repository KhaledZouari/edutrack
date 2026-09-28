import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { CourseResponse, COURSE_LEVEL_LABELS } from '../../../core/models/course.model';
import { CourseService } from '../../../core/services/course.service';
import { EnrollmentService } from '../../../core/services/enrollment.service';
import { MaterialModule } from '../../../shared/material/material.module';

@Component({
  selector: 'app-course-details',
  standalone: true,
  imports: [CommonModule, RouterModule, MaterialModule],
  template: `
    <section class="max-w-6xl mx-auto px-4 py-8" *ngIf="course">
      <div class="grid lg:grid-cols-[1.2fr_0.8fr] gap-8">
        <div class="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm">
          <img [src]="course.imageUrl || fallbackImage" [alt]="course.title" class="w-full h-80 object-cover">
          <div class="p-8">
            <span class="px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-[10px] font-black uppercase tracking-widest">
              Categorie du cours : {{ course.categoryName }}
            </span>
            <h1 class="text-4xl font-black text-slate-900 mt-4 mb-4">{{ course.title }}</h1>
            <p class="text-slate-600 leading-7">{{ course.description }}</p>
          </div>
        </div>
        <aside class="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm h-fit">
          <p class="text-3xl font-black text-slate-900 mb-6">{{ course.price | currency:'EUR' }}</p>
          <div class="space-y-4 mb-6">
            <div class="flex justify-between"><span class="text-slate-500">Categorie du cours</span><strong>{{ course.categoryName }}</strong></div>
            <div class="flex justify-between"><span class="text-slate-500">Enseignant responsable</span><strong>{{ course.teacherName }}</strong></div>
            <div class="flex justify-between"><span class="text-slate-500">Nombre d'etudiants inscrits</span><strong>{{ course.enrollmentsCount }}</strong></div>
            <div class="flex justify-between"><span class="text-slate-500">Niveau</span><strong>{{ levelLabels[course.level] }}</strong></div>
            <div class="flex justify-between"><span class="text-slate-500">Duree</span><strong>{{ course.durationHours }} heures</strong></div>
            <div class="flex justify-between"><span class="text-slate-500">Progression moyenne</span><strong>{{ course.averageProgress | number:'1.0-0' }}%</strong></div>
          </div>
          <button *ngIf="role() === 'STUDENT'" (click)="enroll()" class="w-full btn-premium btn-premium-primary">S'inscrire au cours</button>
          <a *ngIf="role() === 'ADMIN' || role() === 'TEACHER'" [routerLink]="['/courses/edit', course.id]" class="w-full btn-premium btn-premium-outline mt-3">Modifier</a>
        </aside>
      </div>
    </section>
  `
})
export class CourseDetailsComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private courseService = inject(CourseService);
  private enrollmentService = inject(EnrollmentService);
  private authService = inject(AuthService);

  course: CourseResponse | null = null;
  fallbackImage = 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3';
  levelLabels = COURSE_LEVEL_LABELS;
  role = this.authService.currentRole;

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.courseService.getCourseById(id).subscribe(course => this.course = course);
  }

  enroll(): void {
    if (!this.course) return;
    this.enrollmentService.enroll(this.course.id).subscribe({
      next: () => alert('Inscription effectuee.'),
      error: () => alert('Inscription impossible ou deja effectuee.')
    });
  }
}
