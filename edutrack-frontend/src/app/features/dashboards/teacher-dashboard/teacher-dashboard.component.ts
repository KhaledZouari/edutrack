import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTableModule } from '@angular/material/table';
import { RouterModule } from '@angular/router';
import { BaseChartDirective, provideCharts, withDefaultRegisterables } from 'ng2-charts';
import { ChartConfiguration, ChartOptions } from 'chart.js';
import { TeacherDashboard } from '../../../core/models/dashboard.model';
import { DashboardService } from '../../../core/services/dashboard.service';

@Component({
  selector: 'app-teacher-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    BaseChartDirective,
    MatButtonModule,
    MatCardModule,
    MatChipsModule,
    MatIconModule,
    MatProgressBarModule,
    MatTableModule,
  ],
  providers: [provideCharts(withDefaultRegisterables())],
  template: `
    <section class="dashboard-shell dashboard-teacher">
      <header class="dashboard-header">
        <div>
          <p class="eyebrow">Tableau de bord enseignant</p>
          <h1>Bonjour Enseignant</h1>
          <p>Suivez vos cours, vos etudiants et leur progression avec des donnees dynamiques.</p>
        </div>
        <a mat-flat-button color="primary" routerLink="/courses/add">
          <mat-icon>add_circle</mat-icon>
          Creer un cours
        </a>
      </header>

      <div *ngIf="loading" class="state-card">
        <mat-icon class="state-icon">sync</mat-icon>
        <strong>Chargement des donnees...</strong>
        <span>Recuperation de vos cours et inscriptions.</span>
      </div>

      <div *ngIf="error" class="state-card error-state">
        <mat-icon class="state-icon">error_outline</mat-icon>
        <strong>Impossible de charger les donnees.</strong>
        <span>Veuillez verifier l'API puis reessayer.</span>
      </div>

      <ng-container *ngIf="stats && !loading && !error">
        <div class="stat-grid">
          <mat-card class="stat-card" *ngFor="let card of statCards()">
            <mat-icon>{{ card.icon }}</mat-icon>
            <span>{{ card.label }}</span>
            <strong>{{ card.value }}</strong>
            <p>{{ card.description }}</p>
          </mat-card>
        </div>

        <div class="chart-grid">
          <mat-card class="chart-card">
            <mat-card-header>
              <mat-card-title>Inscriptions par mes cours</mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <canvas baseChart [data]="enrollmentsChartData()" [type]="'bar'" [options]="barOptions"></canvas>
            </mat-card-content>
          </mat-card>

          <mat-card class="chart-card">
            <mat-card-header>
              <mat-card-title>Statut des etudiants</mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <canvas baseChart [data]="statusChartData()" [type]="'doughnut'" [options]="doughnutOptions"></canvas>
            </mat-card-content>
          </mat-card>
        </div>

        <div class="content-grid">
          <mat-card>
            <mat-card-header>
              <mat-card-title>Progression moyenne par cours</mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <div class="progress-row" *ngFor="let row of progressRows()">
                <div>
                  <strong>{{ row.label }}</strong>
                  <span>{{ row.value | number:'1.0-0' }}%</span>
                </div>
                <mat-progress-bar mode="determinate" [value]="row.value"></mat-progress-bar>
              </div>
            </mat-card-content>
          </mat-card>

          <mat-card>
            <mat-card-header>
              <mat-card-title>Cours les plus suivis</mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <table mat-table [dataSource]="stats.topMyCourses" class="dashboard-table">
                <ng-container matColumnDef="title">
                  <th mat-header-cell *matHeaderCellDef>Cours</th>
                  <td mat-cell *matCellDef="let row">{{ row.title }}</td>
                </ng-container>
                <ng-container matColumnDef="enrollments">
                  <th mat-header-cell *matHeaderCellDef>Inscrits</th>
                  <td mat-cell *matCellDef="let row"><mat-chip>{{ row.enrollments || 0 }}</mat-chip></td>
                </ng-container>
                <ng-container matColumnDef="average">
                  <th mat-header-cell *matHeaderCellDef>Progression</th>
                  <td mat-cell *matCellDef="let row">{{ (row.averageProgress || 0) | number:'1.0-0' }}%</td>
                </ng-container>
                <tr mat-header-row *matHeaderRowDef="topColumns"></tr>
                <tr mat-row *matRowDef="let row; columns: topColumns;"></tr>
              </table>
            </mat-card-content>
          </mat-card>
        </div>

        <mat-card class="activity-card">
          <mat-card-header>
            <mat-card-title>Etudiants recemment inscrits</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <table mat-table [dataSource]="stats.recentStudentActivity" class="dashboard-table">
              <ng-container matColumnDef="student">
                <th mat-header-cell *matHeaderCellDef>Etudiant</th>
                <td mat-cell *matCellDef="let row">{{ row.student }}</td>
              </ng-container>
              <ng-container matColumnDef="course">
                <th mat-header-cell *matHeaderCellDef>Cours</th>
                <td mat-cell *matCellDef="let row">{{ row.course }}</td>
              </ng-container>
              <ng-container matColumnDef="progress">
                <th mat-header-cell *matHeaderCellDef>Progression</th>
                <td mat-cell *matCellDef="let row">
                  <div class="table-progress">
                    <span>{{ row.progress }}%</span>
                    <mat-progress-bar mode="determinate" [value]="row.progress"></mat-progress-bar>
                  </div>
                </td>
              </ng-container>
              <ng-container matColumnDef="status">
                <th mat-header-cell *matHeaderCellDef>Statut</th>
                <td mat-cell *matCellDef="let row"><mat-chip>{{ statusLabel(row.status) }}</mat-chip></td>
              </ng-container>
              <tr mat-header-row *matHeaderRowDef="activityColumns"></tr>
              <tr mat-row *matRowDef="let row; columns: activityColumns;"></tr>
            </table>
          </mat-card-content>
        </mat-card>
      </ng-container>
    </section>
  `,
  styles: [``],
})
export class TeacherDashboardComponent implements OnInit {
  private dashboardService = inject(DashboardService);
  stats: TeacherDashboard | null = null;
  loading = true;
  error: string | null = null;
  topColumns = ['title', 'enrollments', 'average'];
  activityColumns = ['student', 'course', 'progress', 'status'];

  barOptions: ChartOptions<'bar'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: { y: { beginAtZero: true } },
  };

  doughnutOptions: ChartOptions<'doughnut'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { position: 'bottom' } },
  };

  ngOnInit(): void {
    this.dashboardService.getTeacherDashboard().subscribe({
      next: stats => {
        this.stats = stats;
        this.loading = false;
      },
      error: () => {
        this.error = 'Impossible de charger les donnees.';
        this.loading = false;
      },
    });
  }

  statCards() {
    const stats = this.stats;
    return [
      { label: 'Mes cours', value: stats?.totalMyCourses ?? 0, icon: 'menu_book', description: 'Cours dont vous etes responsable' },
      { label: 'Mes etudiants', value: stats?.totalMyStudents ?? 0, icon: 'groups', description: 'Apprenants inscrits a vos cours' },
      { label: 'Progression moyenne', value: `${Math.round(stats?.averageProgress ?? 0)}%`, icon: 'trending_up', description: 'Avancement moyen observe' },
      { label: 'Cours actifs', value: stats?.activeCourses ?? 0, icon: 'check_circle', description: 'Cours visibles dans le catalogue' },
      { label: 'Cours termines', value: stats?.completedEnrollments ?? 0, icon: 'verified', description: 'Inscriptions finalisees' },
      { label: 'Activite recente', value: stats?.recentStudentActivity.length ?? 0, icon: 'history', description: 'Dernieres inscriptions suivies' },
    ];
  }

  enrollmentsChartData(): ChartConfiguration<'bar'>['data'] {
    const source = this.stats?.enrollmentsByMyCourses ?? {};
    return { labels: Object.keys(source), datasets: [{ data: Object.values(source), label: 'Inscriptions', backgroundColor: '#0ea5e9', borderRadius: 8 }] };
  }

  statusChartData(): ChartConfiguration<'doughnut'>['data'] {
    const source = this.stats?.statusDistribution ?? {};
    return {
      labels: Object.keys(source).map(status => this.statusLabel(status)),
      datasets: [{ data: Object.values(source), backgroundColor: ['#94a3b8', '#4f46e5', '#22c55e'] }],
    };
  }

  progressRows(): { label: string; value: number }[] {
    return Object.entries(this.stats?.progressByCourse ?? {}).map(([label, value]) => ({ label, value }));
  }

  statusLabel(status: string): string {
    return status === 'COMPLETED' ? 'Termine' : status === 'NOT_STARTED' ? 'Non commence' : 'En cours';
  }
}
