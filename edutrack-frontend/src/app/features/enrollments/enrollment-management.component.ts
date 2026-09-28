import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { EnrollmentResponse } from '../../core/models/enrollment.model';
import { EnrollmentService } from '../../core/services/enrollment.service';
import { MaterialModule } from '../../shared/material/material.module';

@Component({
  selector: 'app-enrollment-management',
  standalone: true,
  imports: [CommonModule, FormsModule, MaterialModule],
  template: `
    <section class="page-shell">
      <div class="page-header">
        <div>
          <p class="page-kicker">Inscriptions</p>
          <h1 class="page-title">Gestion des inscriptions</h1>
          <p class="page-subtitle">Relation Enrollment -> Student + Course visible dans un tableau manipulable.</p>
        </div>
        <button mat-stroked-button color="primary" (click)="load()">
          <mat-icon>refresh</mat-icon>
          Actualiser
        </button>
      </div>

      <div *ngIf="loading" class="state-card">
        <mat-icon>sync</mat-icon>
        <strong>Chargement des inscriptions...</strong>
        <span>Recuperation de la relation etudiant-cours depuis l'API REST.</span>
      </div>

      <div *ngIf="error" class="state-card error-state">
        <mat-icon>error_outline</mat-icon>
        <strong>{{ error }}</strong>
        <span>Veuillez verifier le serveur back-end.</span>
      </div>

      <div *ngIf="!loading && !error && enrollments.length === 0" class="state-card">
        <mat-icon>assignment_late</mat-icon>
        <strong>Aucune inscription trouvee.</strong>
        <span>Les inscriptions apparaitront ici apres ajout par un etudiant.</span>
      </div>

      <div *ngIf="!loading && !error && enrollments.length > 0" class="surface-card overflow-hidden enrollment-table">
        <table class="w-full">
          <thead class="bg-slate-50 border-b border-slate-100">
            <tr>
              <th class="th">Etudiant</th>
              <th class="th">Cours</th>
              <th class="th">Enseignant</th>
              <th class="th">Progression</th>
              <th class="th">Statut</th>
              <th class="th text-right">Action</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let item of enrollments" class="border-b border-slate-50">
              <td class="td">
                <strong>{{ item.studentName }}</strong>
                <p class="text-xs text-slate-400">{{ item.studentEmail }}</p>
              </td>
              <td class="td">
                <strong>{{ item.courseTitle }}</strong>
                <p class="text-xs text-slate-400">Relation Course</p>
              </td>
              <td class="td">{{ item.teacherName }}</td>
              <td class="td">
                <div class="progress-editor">
                  <input type="number" [(ngModel)]="item.progress" min="0" max="100" class="progress-input">
                  <span>{{ item.progress }}%</span>
                </div>
                <mat-progress-bar mode="determinate" [value]="item.progress"></mat-progress-bar>
              </td>
              <td class="td">
                <span class="status-badge" [ngClass]="item.certificateIssued ? 'status-success' : statusClass(item.progress)">
                  {{ statusLabel(item) }}
                </span>
              </td>
              <td class="td text-right">
                <button (click)="saveProgress(item)" class="btn-premium btn-premium-outline !py-2">
                  <mat-icon>save</mat-icon>
                  Sauver
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  `,
  styles: [`
    .th{padding:1rem;text-align:left;font-size:.68rem;font-weight:900;text-transform:uppercase;letter-spacing:.14em;color:#94a3b8;white-space:nowrap}
    .td{padding:1rem;color:#334155;vertical-align:middle}
    .progress-editor{display:flex;align-items:center;justify-content:space-between;gap:.75rem;margin-bottom:.45rem;min-width:180px}
    .progress-input{width:5rem;border:1px solid #e2e8f0;border-radius:.85rem;padding:.55rem .7rem;font-weight:800;outline:none;background:#f8fafc}
    .progress-input:focus{border-color:#4f46e5;background:white;box-shadow:0 0 0 4px rgba(79,70,229,.08)}
    .progress-editor span{font-weight:900;color:#0f172a}
    .state-card mat-icon{font-size:2rem;width:2rem;height:2rem;color:#4f46e5;margin-bottom:.65rem}
    .error-state mat-icon{color:#e11d48}
    .enrollment-table{overflow-x:auto}
    table{min-width:920px}
  `]
})
export class EnrollmentManagementComponent implements OnInit {
  private enrollmentService = inject(EnrollmentService);
  enrollments: EnrollmentResponse[] = [];
  loading = false;
  error: string | null = null;

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading = true;
    this.error = null;
    this.enrollmentService.getEnrollments().subscribe({
      next: data => {
        this.enrollments = data;
        this.loading = false;
      },
      error: () => {
        this.error = 'Impossible de charger les inscriptions.';
        this.loading = false;
      },
    });
  }

  saveProgress(item: EnrollmentResponse): void {
    this.enrollmentService.updateProgress(item.id, item.progress).subscribe(updated => {
      item.progress = updated.progress;
      item.certificateIssued = updated.certificateIssued;
    });
  }

  statusLabel(item: EnrollmentResponse): string {
    if (item.certificateIssued) {
      return 'Certificat obtenu';
    }
    return item.progress === 0 ? 'Non commence' : 'En cours';
  }

  statusClass(progress: number): string {
    return progress === 0 ? 'status-muted' : 'status-warning';
  }
}
