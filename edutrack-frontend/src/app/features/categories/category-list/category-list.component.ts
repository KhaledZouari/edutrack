import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CategoryService } from '../../../core/services/category.service';
import { CategoryRequest, CategoryResponse } from '../../../core/models/category.model';

import { AuthService } from '../../../core/services/auth.service';

import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-category',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule, MatIconModule],
  templateUrl: './category-list.component.html',
  styleUrls: ['./category-list.component.css'],
})
export class CategoryListComponent implements OnInit {
  private categoryService = inject(CategoryService);
  private authService = inject(AuthService);
  private fb = inject(FormBuilder);

  categories: CategoryResponse[] = [];
  loading = false;
  submitting = false;
  error: string | null = null;
  editingCategory: CategoryResponse | null = null;
  showForm = false;
  isAdmin = false;

  categoryForm: FormGroup = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    description: [''],
    parentId: [null],
  });

  ngOnInit(): void {
    this.isAdmin = this.authService.isAdmin();
    this.loadCategories();
  }

  loadCategories(): void {
    this.loading = true;
    this.error = null;
    this.categoryService.getAllCategories().subscribe({
      next: (data) => {
        this.categories = data;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Impossible de charger les catégories.';
        this.loading = false;
        console.error(err);
      },
    });
  }

  openCreateForm(): void {
    this.editingCategory = null;
    this.categoryForm.reset({ name: '', description: '', parentId: null });
    this.showForm = true;
  }

  openEditForm(cat: CategoryResponse): void {
    this.editingCategory = cat;
    this.categoryForm.patchValue({
      name: cat.name,
      description: cat.description ?? '',
      parentId: cat.parentId ?? null,
    });
    this.showForm = true;
  }

  cancelForm(): void {
    this.showForm = false;
    this.editingCategory = null;
    this.categoryForm.reset();
  }

  onSubmit(): void {
    if (this.categoryForm.invalid) return;
    this.submitting = true;
    this.error = null;
    const formValue = this.categoryForm.value as CategoryRequest;

    if (this.editingCategory) {
      this.categoryService.updateCategory(this.editingCategory.id, formValue).subscribe({
        next: () => {
          this.submitting = false;
          this.showForm = false;
          this.loadCategories();
        },
        error: (err) => {
          this.error = 'Erreur lors de la mise à jour.';
          this.submitting = false;
          console.error(err);
        },
      });
    } else {
      this.categoryService.createCategory(formValue).subscribe({
        next: () => {
          this.submitting = false;
          this.showForm = false;
          this.loadCategories();
        },
        error: (err) => {
          this.error = 'Erreur lors de la création.';
          this.submitting = false;
          console.error(err);
        },
      });
    }
  }

  onDelete(id: number): void {
    if (confirm('Supprimer cette catégorie ?')) {
      this.categoryService.deleteCategory(id).subscribe({
        next: () => {
          this.categories = this.categories.filter((c) => c.id !== id);
        },
        error: (err) => {
          this.error = 'Erreur lors de la suppression.';
          console.error(err);
        },
      });
    }
  }

  getParentName(parentId?: number | null): string {
    if (!parentId) return '—';
    const parent = this.categories.find((c) => c.id === parentId);
    return parent ? parent.name : 'N/A';
  }

  get nameControl() { return this.categoryForm.get('name'); }
}
