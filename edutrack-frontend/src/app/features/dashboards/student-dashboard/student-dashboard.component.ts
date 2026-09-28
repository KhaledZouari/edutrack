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
import { StudentDashboard } from '../../../core/models/dashboard.model';
import { DashboardService } from '../../../core/services/dashboard.service';

@Component({
  selector: 'app-student-dashboard',
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
    <section class="dashboard-shell dashboard-student">
      <header class="dashboard-header">
        <div>
          <p class="eyebrow">Tableau de bord etudiant</p>
          <h1>Bonjour Etudiant</h1>
          <p>Continuez votre apprentissage et suivez votre progression cours par cours.</p>
        </div>
        <a mat-flat-button color="primary" routerLink="/courses">
          <mat-icon>explore</mat-icon>
          Explorer les cours
        </a>
      </header>

      <div *ngIf="loading" class="state-card">
        <mat-icon class="state-icon">sync</mat-icon>
        <strong>Chargement des donnees...</strong>
        <span>Recuperation de vos cours et recommandations.</span>
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
              <mat-card-title>Progression par cours</mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <canvas baseChart [data]="progressChartData()" [type]="'bar'" [options]="barOptions"></canvas>
            </mat-card-content>
          </mat-card>

          <mat-card class="chart-card">
            <mat-card-header>
              <mat-card-title>Cours termines vs en cours</mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <canvas baseChart [data]="completionChartData()" [type]="'doughnut'" [options]="doughnutOptions"></canvas>
            </mat-card-content>
          </mat-card>
        </div>

        <div class="content-grid">
          <mat-card>
            <mat-card-header>
              <mat-card-title>Barres de progression</mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <div class="progress-row" *ngFor="let row of progressRows()">
                <div>
                  <strong>{{ row.label }}</strong>
                  <span>{{ row.value }}%</span>
                </div>
                <mat-progress-bar mode="determinate" [value]="row.value"></mat-progress-bar>
              </div>
            </mat-card-content>
          </mat-card>

          <mat-card>
            <mat-card-header>
              <mat-card-title>Cours recommandes</mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <table mat-table [dataSource]="stats.recommendedCourses" class="dashboard-table">
                <ng-container matColumnDef="title">
                  <th mat-header-cell *matHeaderCellDef>Cours</th>
                  <td mat-cell *matCellDef="let row">{{ row.title }}</td>
                </ng-container>
                <ng-container matColumnDef="category">
                  <th mat-header-cell *matHeaderCellDef>Categorie</th>
                  <td mat-cell *matCellDef="let row">{{ row.category }}</td>
                </ng-container>
                <ng-container matColumnDef="level">
                  <th mat-header-cell *matHeaderCellDef>Niveau</th>
                  <td mat-cell *matCellDef="let row"><mat-chip>{{ row.level }}</mat-chip></td>
                </ng-container>
                <tr mat-header-row *matHeaderRowDef="recommendationColumns"></tr>
                <tr mat-row *matRowDef="let row; columns: recommendationColumns;"></tr>
              </table>
            </mat-card-content>
          </mat-card>
        </div>

        <mat-card class="activity-card">
          <mat-card-header>
            <mat-card-title>Mes cours suivis</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <table mat-table [dataSource]="stats.myEnrollments" class="dashboard-table">
              <ng-container matColumnDef="course">
                <th mat-header-cell *matHeaderCellDef>Cours</th>
                <td mat-cell *matCellDef="let row">{{ row.course }}</td>
              </ng-container>
              <ng-container matColumnDef="category">
                <th mat-header-cell *matHeaderCellDef>Categorie</th>
                <td mat-cell *matCellDef="let row">{{ row.category }}</td>
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
              <ng-container matColumnDef="certificate">
                <th mat-header-cell *matHeaderCellDef>Certificat</th>
                <td mat-cell *matCellDef="let row">
                  <mat-icon [class.text-green]="row.certificateIssued">{{ row.certificateIssued ? 'workspace_premium' : 'hourglass_empty' }}</mat-icon>
                </td>
              </ng-container>
              <tr mat-header-row *matHeaderRowDef="enrollmentColumns"></tr>
              <tr mat-row *matRowDef="let row; columns: enrollmentColumns;"></tr>
            </table>
          </mat-card-content>
        </mat-card>
      </ng-container>
    </section>
  `,
  styles: [``],
})
export class StudentDashboardComponent implements OnInit {
  private dashboardService = inject(DashboardService);
  stats: StudentDashboard | null = null;
  loading = true;
  error: string | null = null;
  recommendationColumns = ['title', 'category', 'level'];
  enrollmentColumns = ['course', 'category', 'progress', 'status', 'certificate'];

  barOptions: ChartOptions<'bar'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: { y: { beginAtZero: true, max: 100 } },
  };

  doughnutOptions: ChartOptions<'doughnut'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { position: 'bottom' } },
  };

  ngOnInit(): void {
    this.dashboardService.getStudentDashboard().subscribe({
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
      { label: 'Mes cours', value: stats?.totalMyCourses ?? 0, icon: 'menu_book', description: 'Cours actuellement suivis' },
      { label: 'Cours termines', value: stats?.completedCourses ?? 0, icon: 'verified', description: 'Objectifs valides a 100%' },
      { label: 'Cours en cours', value: stats?.inProgressCourses ?? 0, icon: 'pending_actions', description: 'Formations en progression' },
      { label: 'Progression moyenne', value: `${Math.round(stats?.averageProgress ?? 0)}%`, icon: 'trending_up', description: 'Avancement global personnel' },
      { label: 'Certificats', value: stats?.certificates ?? 0, icon: 'workspace_premium', description: 'Certificats obtenus' },
      { label: 'Recommandations', value: stats?.recommendedCourses.length ?? 0, icon: 'auto_awesome', description: 'Nouveaux cours proposes' },
    ];
  }

  progressChartData(): ChartConfiguration<'bar'>['data'] {
    const source = this.stats?.progressByCourse ?? {};
    return { labels: Object.keys(source), datasets: [{ data: Object.values(source), label: 'Progression', backgroundColor: '#22c55e', borderRadius: 8 }] };
  }

  completionChartData(): ChartConfiguration<'doughnut'>['data'] {
    const stats = this.stats;
    return {
      labels: ['Termines', 'En cours', 'Non commences'],
      datasets: [{ data: [stats?.completedCourses ?? 0, stats?.inProgressCourses ?? 0, stats?.notStartedCourses ?? 0], backgroundColor: ['#22c55e', '#4f46e5', '#94a3b8'] }],
    };
  }

  progressRows(): { label: string; value: number }[] {
    return Object.entries(this.stats?.progressByCourse ?? {}).map(([label, value]) => ({ label, value }));
  }

  statusLabel(status: string): string {
    return status === 'COMPLETED' ? 'Termine' : status === 'NOT_STARTED' ? 'Non commence' : 'En cours';
  }
}
