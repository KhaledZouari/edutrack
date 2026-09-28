import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CategoryService } from '../../../core/services/category.service';
import { AuthService } from '../../../core/services/auth.service';
import { UserService } from '../../../core/services/user.service';
import { CategoryResponse } from '../../../core/models/category.model';
import { User } from '../../../core/models/user.model';
import { CourseRequest } from '../../../core/models/course.model';
import { CourseService } from '../../../core/services/course.service';
import { MaterialModule } from '../../../shared/material/material.module';

@Component({
  selector: 'app-course-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, MaterialModule],
  template: `
    <section class="page-shell max-w-5xl">
      <div class="page-header">
        <div>
          <p class="page-kicker">CRUD Course</p>
          <h1 class="page-title">{{ isEditMode ? 'Modifier le cours' : 'Ajouter un cours' }}</h1>
          <p class="page-subtitle">
          Formulaire reactif Angular avec validations et relations Course -> Category / Course -> Teacher.
          </p>
        </div>
        <a routerLink="/courses" class="btn-premium btn-premium-outline">
          <mat-icon>arrow_back</mat-icon>
          Catalogue
        </a>
      </div>

      <form [formGroup]="courseForm" (ngSubmit)="onSubmit()" class="surface-card p-6 md:p-8 grid md:grid-cols-2 gap-5">
        <label class="md:col-span-2">
          <span class="label">Titre</span>
          <input formControlName="title" class="input" placeholder="Angular professionnel">
          <small *ngIf="courseForm.controls.title.touched && courseForm.controls.title.invalid" class="error">Titre obligatoire, 120 caracteres maximum.</small>
        </label>

        <label class="md:col-span-2">
          <span class="label">Description</span>
          <textarea formControlName="description" rows="5" class="input" placeholder="Objectifs, competences, contenu du cours..."></textarea>
          <small *ngIf="courseForm.controls.description.touched && courseForm.controls.description.invalid" class="error">Description obligatoire, 1000 caracteres maximum.</small>
        </label>

        <label>
          <span class="label">Prix</span>
          <input type="number" formControlName="price" class="input">
          <small *ngIf="courseForm.controls.price.touched && courseForm.controls.price.invalid" class="error">Prix obligatoire, minimum 0.</small>
        </label>

        <label>
          <span class="label">Duree en heures</span>
          <input type="number" formControlName="durationHours" class="input">
          <small *ngIf="courseForm.controls.durationHours.touched && courseForm.controls.durationHours.invalid" class="error">Duree obligatoire, minimum 1 heure.</small>
        </label>

        <label>
          <span class="label">Niveau</span>
          <select formControlName="level" class="input">
            <option value="BEGINNER">Debutant</option>
            <option value="INTERMEDIATE">Intermediaire</option>
            <option value="ADVANCED">Avance</option>
          </select>
        </label>

        <label>
          <span class="label">Categorie</span>
          <select formControlName="categoryId" class="input">
            <option [ngValue]="null">Choisir une categorie</option>
            <option *ngFor="let category of categories" [ngValue]="category.id">{{ category.name }}</option>
          </select>
          <small *ngIf="courseForm.controls.categoryId.touched && courseForm.controls.categoryId.invalid" class="error">Categorie obligatoire.</small>
        </label>

        <label>
          <span class="label">Enseignant responsable</span>
          <select formControlName="teacherId" class="input">
            <option [ngValue]="currentUserId" *ngIf="role === 'TEACHER'">Moi-meme</option>
            <option *ngFor="let teacher of teachers" [ngValue]="teacher.id">
              {{ teacher.firstName }} {{ teacher.lastName }} - {{ teacher.email }}
            </option>
          </select>
          <small *ngIf="courseForm.controls.teacherId.touched && courseForm.controls.teacherId.invalid" class="error">Enseignant obligatoire.</small>
        </label>

        <label>
          <span class="label">Image URL</span>
          <input formControlName="imageUrl" class="input" placeholder="https://...">
        </label>

        <div class="md:col-span-2 relation-panel">
          <mat-icon>hub</mat-icon>
          <div>
            <strong>Relations visibles dans l'application</strong>
            <span>Chaque cours est relie a une categorie et a un enseignant, puis utilise dans les inscriptions.</span>
          </div>
        </div>

        <div *ngIf="error" class="md:col-span-2 bg-red-50 text-red-600 rounded-xl p-4 font-bold flex items-center gap-2">
          <mat-icon>error_outline</mat-icon>
          {{ error }}
        </div>

        <div class="md:col-span-2 flex justify-end gap-3">
          <a routerLink="/courses" class="btn-premium btn-premium-outline">Annuler</a>
          <button [disabled]="courseForm.invalid || submitting" class="btn-premium btn-premium-primary">
            <mat-icon>save</mat-icon> {{ submitting ? 'Enregistrement...' : 'Enregistrer' }}
          </button>
        </div>
      </form>
    </section>
  `,
  styles: [`
    .label { display:block; margin-bottom: .5rem; font-size: .68rem; font-weight: 900; text-transform: uppercase; letter-spacing: .16em; color:#94a3b8; }
    .input { width:100%; border:1px solid #e2e8f0; border-radius:1rem; padding:.9rem 1rem; outline:none; background:#f8fafc; font-weight:600; }
    .input:focus { border-color:#4f46e5; background:white; box-shadow:0 0 0 4px rgba(79,70,229,.08); }
    .error { display:block; color:#dc2626; font-weight:700; margin-top:.35rem; }
    .relation-panel{display:flex;gap:.9rem;align-items:flex-start;border:1px solid #dbeafe;background:#eff6ff;border-radius:1rem;padding:1rem;color:#1e3a8a}
    .relation-panel mat-icon{color:#2563eb}
    .relation-panel strong{display:block;font-weight:900}
    .relation-panel span{display:block;margin-top:.2rem;font-size:.9rem;color:#475569}
  `],
})
export class CourseFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private courseService = inject(CourseService);
  private categoryService = inject(CategoryService);
  private userService = inject(UserService);
  private authService = inject(AuthService);

  categories: CategoryResponse[] = [];
  teachers: User[] = [];
  isEditMode = false;
  courseId: number | null = null;
  submitting = false;
  error: string | null = null;
  role = this.authService.getRole();
  currentUserId = this.authService.getUserId();

  courseForm = this.fb.group({
    title: ['', [Validators.required, Validators.maxLength(120)]],
    description: ['', [Validators.required, Validators.maxLength(1000)]],
    price: [0, [Validators.required, Validators.min(0)]],
    level: ['INTERMEDIATE', Validators.required],
    durationHours: [10, [Validators.required, Validators.min(1)]],
    imageUrl: ['', Validators.maxLength(500)],
    categoryId: [null as number | null, Validators.required],
    teacherId: [this.currentUserId, Validators.required],
  });

  ngOnInit(): void {
    this.categoryService.getAllCategories().subscribe(categories => this.categories = categories);

    if (this.role === 'ADMIN') {
      this.courseForm.controls.teacherId.enable();
      this.userService.getTeachers().subscribe({
        next: teachers => this.teachers = teachers,
        error: () => this.teachers = [],
      });
    } else {
      this.courseForm.controls.teacherId.disable();
    }

    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode = true;
      this.courseId = Number(id);
      this.courseService.getCourseById(this.courseId).subscribe(course => {
        this.courseForm.patchValue({
          title: course.title,
          description: course.description,
          price: course.price,
          level: course.level,
          durationHours: course.durationHours,
          imageUrl: course.imageUrl,
          categoryId: course.categoryId,
          teacherId: course.teacherId,
        });
      });
    }
  }

  onSubmit(): void {
    if (this.courseForm.invalid) {
      this.courseForm.markAllAsTouched();
      return;
    }

    const value = this.courseForm.getRawValue();
    const payload: CourseRequest = {
      title: value.title ?? '',
      description: value.description ?? '',
      price: Number(value.price),
      level: value.level as CourseRequest['level'],
      durationHours: Number(value.durationHours),
      imageUrl: value.imageUrl,
      categoryId: Number(value.categoryId),
      teacherId: Number(value.teacherId),
    };

    this.submitting = true;
    const request = this.isEditMode && this.courseId
      ? this.courseService.updateCourse(this.courseId, payload)
      : this.courseService.addCourse(payload);

    request.subscribe({
      next: course => this.router.navigate(['/courses/details', course.id]),
      error: err => {
        this.error = err?.error?.message || 'Erreur lors de l enregistrement du cours.';
        this.submitting = false;
      },
    });
  }
}
