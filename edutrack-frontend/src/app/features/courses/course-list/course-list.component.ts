import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { AuthService } from '../../../core/services/auth.service';
import { CourseResponse, COURSE_LEVEL_LABELS } from '../../../core/models/course.model';
import { CourseService } from '../../../core/services/course.service';
import { EnrollmentService } from '../../../core/services/enrollment.service';
import { MaterialModule } from '../../../shared/material/material.module';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-course-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, MaterialModule],
  template: `
    <section class="page-shell">
      <header class="home-hero animate-fade-in">
        <img [src]="heroImage" alt="Etudiants suivant un cours en ligne sur EduTrack" class="home-hero-image">
        <div class="home-hero-overlay"></div>

        <div class="home-hero-content">
          <div class="hero-badge">
            <mat-icon>school</mat-icon>
            Plateforme de cours en ligne
          </div>

          <h1>EduTrack</h1>
          <p>
            Gérez les cours, les enseignants, les catégories et les inscriptions dans une interface Angular moderne.
          </p>

          <div class="hero-actions">
            <a href="#catalogue" class="btn-premium btn-premium-primary">
              <mat-icon>menu_book</mat-icon>
              Explorer le catalogue
            </a>
            <a *ngIf="isAdminOrTeacher()" routerLink="/courses/add" class="btn-premium hero-secondary">
              <mat-icon>add_circle</mat-icon>
              Nouveau cours
            </a>
          </div>
        </div>

        <div class="hero-stats" aria-label="Indicateurs EduTrack">
          <div>
            <strong>{{ totalCourses() }}</strong>
            <span>Cours actifs</span>
          </div>
          <div>
            <strong>{{ categoryCount() }}</strong>
            <span>Catégories</span>
          </div>
          <div>
            <strong>{{ totalEnrollments() }}</strong>
            <span>Inscriptions</span>
          </div>
        </div>
      </header>

      <div id="catalogue" class="page-header catalogue-header">
        <div>
          <p class="page-kicker">Catalogue</p>
          <h2 class="page-title">Cours disponibles</h2>
          <p class="page-subtitle">
            Un CRUD complet Angular avec recherche, détails, ajout, modification, suppression et relations métier visibles.
          </p>
        </div>
      </div>

      <div class="surface-card p-4 mb-6 flex flex-col md:flex-row gap-3 md:items-center">
        <div class="flex flex-1 items-center gap-3">
          <mat-icon class="text-slate-400">search</mat-icon>
          <input [(ngModel)]="query" (keyup.enter)="loadCourses()" placeholder="Rechercher par titre, categorie ou enseignant"
            class="flex-1 outline-none text-sm font-medium">
        </div>
        <button mat-stroked-button color="primary" (click)="loadCourses()">
          <mat-icon>filter_alt</mat-icon>
          Filtrer
        </button>
      </div>

      <div *ngIf="error" class="state-card error-state mb-6">
        <mat-icon>error_outline</mat-icon>
        <strong>{{ error }}</strong>
        <span>Verifier la connexion au back-end puis relancer le chargement.</span>
      </div>

      <div class="surface-card overflow-hidden">
        <div *ngIf="loading" class="state-card border-0 shadow-none">
          <mat-icon>sync</mat-icon>
          <strong>Chargement des cours...</strong>
          <span>Recuperation du catalogue depuis l'API REST.</span>
        </div>

        <table mat-table [dataSource]="courses" class="w-full" *ngIf="!loading">
          <ng-container matColumnDef="title">
            <th mat-header-cell *matHeaderCellDef>Cours</th>
            <td mat-cell *matCellDef="let course">
              <div class="flex items-center gap-3 py-3">
                <img [src]="course.imageUrl || fallbackImage" [alt]="course.title" class="w-14 h-14 rounded-xl object-cover bg-slate-100">
                <div>
                  <p class="font-black text-slate-900">{{ course.title }}</p>
                  <p class="text-xs text-slate-500 line-clamp-1">{{ course.description }}</p>
                </div>
              </div>
            </td>
          </ng-container>

          <ng-container matColumnDef="category">
            <th mat-header-cell *matHeaderCellDef>Categorie</th>
            <td mat-cell *matCellDef="let course">
              <span class="status-badge bg-indigo-50 text-indigo-700">
                {{ course.categoryName }}
              </span>
            </td>
          </ng-container>

          <ng-container matColumnDef="teacher">
            <th mat-header-cell *matHeaderCellDef>Enseignant</th>
            <td mat-cell *matCellDef="let course">
              <p class="font-bold text-slate-700">{{ course.teacherName }}</p>
              <p class="text-xs text-slate-400">{{ course.teacherEmail }}</p>
            </td>
          </ng-container>

          <ng-container matColumnDef="price">
            <th mat-header-cell *matHeaderCellDef>Prix</th>
            <td mat-cell *matCellDef="let course" class="font-black">{{ course.price | currency:'EUR' }}</td>
          </ng-container>

          <ng-container matColumnDef="level">
            <th mat-header-cell *matHeaderCellDef>Niveau</th>
            <td mat-cell *matCellDef="let course">
              <span class="status-badge status-muted">{{ getLevelLabel(course.level) }}</span>
            </td>
          </ng-container>

          <ng-container matColumnDef="enrollments">
            <th mat-header-cell *matHeaderCellDef>Inscrits</th>
            <td mat-cell *matCellDef="let course">{{ course.enrollmentsCount }}</td>
          </ng-container>

          <ng-container matColumnDef="actions">
            <th mat-header-cell *matHeaderCellDef>Actions</th>
            <td mat-cell *matCellDef="let course">
              <div class="flex items-center gap-1">
                <a mat-icon-button [routerLink]="['/courses/details', course.id]" matTooltip="Voir details">
                  <mat-icon>visibility</mat-icon>
                </a>
                <button *ngIf="role() === 'STUDENT'" mat-icon-button color="primary" (click)="enroll(course.id)" matTooltip="S'inscrire">
                  <mat-icon>how_to_reg</mat-icon>
                </button>
                <a *ngIf="isAdminOrTeacher()" mat-icon-button color="primary" [routerLink]="['/courses/edit', course.id]" matTooltip="Modifier">
                  <mat-icon>edit</mat-icon>
                </a>
                <button *ngIf="isAdminOrTeacher()" mat-icon-button color="warn" (click)="confirmDelete(course)" matTooltip="Supprimer">
                  <mat-icon>delete</mat-icon>
                </button>
              </div>
            </td>
          </ng-container>

          <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
          <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
        </table>

        <div *ngIf="!loading && courses.length === 0" class="state-card border-0 shadow-none">
          <mat-icon>search_off</mat-icon>
          <strong>Aucun cours trouve.</strong>
          <span>Essayez une autre recherche ou ajoutez un nouveau cours.</span>
        </div>
      </div>
    </section>
  `,
  styles: [`
    th.mat-mdc-header-cell { color:#64748b; font-weight:900; text-transform:uppercase; font-size:.72rem; letter-spacing:.08em; }
    td.mat-mdc-cell, th.mat-mdc-header-cell { padding: 0 1rem; }
    .state-card mat-icon{font-size:2rem;width:2rem;height:2rem;color:#4f46e5;margin-bottom:.65rem}
    .error-state mat-icon{color:#e11d48}
    .mat-mdc-row{transition:background .2s ease}
    @media (max-width: 820px){ table{min-width:850px}.surface-card{overflow-x:auto} }
  `],
})
export class CourseListComponent implements OnInit {
  private courseService = inject(CourseService);
  private enrollmentService = inject(EnrollmentService);
  private authService = inject(AuthService);
  private dialog = inject(MatDialog);
  private route = inject(ActivatedRoute);

  courses: CourseResponse[] = [];
  displayedColumns = ['title', 'category', 'teacher', 'price', 'level', 'enrollments', 'actions'];
  query = '';
  loading = false;
  error: string | null = null;
  heroImage = 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1800&q=85';
  fallbackImage = 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3';
  levelLabels = COURSE_LEVEL_LABELS;
  role = this.authService.currentRole;

  ngOnInit(): void {
    this.route.queryParamMap.subscribe(params => {
      const search = params.get('search');
      if (search !== null) {
        this.query = search;
      }
      this.loadCourses();
    });
  }

  private getTeacherFilter(): number | undefined {
    return this.role() === 'TEACHER' ? this.authService.getUserId() ?? undefined : undefined;
  }

  refresh(): void {
    this.loadCourses();
  }

  isAdminOrTeacher(): boolean {
    return this.role() === 'ADMIN' || this.role() === 'TEACHER';
  }

  getLevelLabel(level: keyof typeof COURSE_LEVEL_LABELS): string {
    return this.levelLabels[level];
  }

  totalCourses(): number {
    return this.courses.length;
  }

  totalEnrollments(): number {
    return this.courses.reduce((total, course) => total + (course.enrollmentsCount || 0), 0);
  }

  categoryCount(): number {
    return new Set(this.courses.map(course => course.categoryName).filter(Boolean)).size;
  }

  loadCourses(): void {
    this.loading = true;
    this.error = null;
    this.courseService.getCourses({ q: this.query || undefined, teacherId: this.getTeacherFilter() }).subscribe({
      next: courses => {
        this.courses = courses.filter(course => course.active);
        this.loading = false;
      },
      error: () => {
        this.error = 'Impossible de charger les cours.';
        this.loading = false;
      },
    });
  }

  enroll(courseId: number): void {
    this.enrollmentService.enroll(courseId).subscribe({
      next: () => this.loadCourses(),
      error: () => alert('Inscription impossible ou deja effectuee.'),
    });
  }

  confirmDelete(course: CourseResponse): void {
    const ref = this.dialog.open(ConfirmDialogComponent, {
      width: '420px',
      data: {
        title: 'Supprimer le cours',
        message: `Voulez-vous vraiment supprimer "${course.title}" ?`,
        confirmText: 'Supprimer',
      },
    });

    ref.afterClosed().subscribe(confirmed => {
      if (confirmed) {
        this.courseService.deleteCourse(course.id).subscribe(() => this.loadCourses());
      }
    });
  }
}
