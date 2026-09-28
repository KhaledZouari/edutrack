import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { RouterModule } from '@angular/router';
import { BaseChartDirective, provideCharts, withDefaultRegisterables } from 'ng2-charts';
import { ChartConfiguration, ChartOptions } from 'chart.js';
import { AdminDashboard } from '../../../core/models/dashboard.model';
import { DashboardService } from '../../../core/services/dashboard.service';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    BaseChartDirective,
    MatButtonModule,
    MatCardModule,
    MatChipsModule,
    MatDividerModule,
    MatIconModule,
    MatTableModule,
  ],
  providers: [provideCharts(withDefaultRegisterables())],
  template: `
    <section class="dashboard-shell dashboard-admin">
      <header class="dashboard-header">
        <div>
          <p class="eyebrow">Tableau de bord administrateur</p>
          <h1>Bonjour Admin</h1>
          <p>Voici une vue globale de la plateforme EduTrack : utilisateurs, cours, inscriptions et progression.</p>
        </div>
        <a mat-flat-button color="primary" routerLink="/courses/add">
          <mat-icon>add_circle</mat-icon>
          Ajouter un cours
        </a>
      </header>

      <div *ngIf="loading" class="state-card">
        <mat-icon class="state-icon">sync</mat-icon>
        <strong>Chargement des donnees...</strong>
        <span>Preparation des statistiques de la plateforme.</span>
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
              <mat-card-title>Cours par categorie</mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <canvas baseChart [data]="coursesByCategoryData()" [type]="'bar'" [options]="barOptions"></canvas>
            </mat-card-content>
          </mat-card>

          <mat-card class="chart-card">
            <mat-card-header>
              <mat-card-title>Inscriptions par cours</mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <canvas baseChart [data]="enrollmentsByCourseData()" [type]="'bar'" [options]="barOptions"></canvas>
            </mat-card-content>
          </mat-card>

          <mat-card class="chart-card">
            <mat-card-header>
              <mat-card-title>Repartition des roles</mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <canvas baseChart [data]="roleDistributionData()" [type]="'doughnut'" [options]="doughnutOptions"></canvas>
            </mat-card-content>
          </mat-card>

          <mat-card class="chart-card">
            <mat-card-header>
              <mat-card-title>Evolution des inscriptions</mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <canvas baseChart [data]="enrollmentTrendData()" [type]="'line'" [options]="lineOptions"></canvas>
            </mat-card-content>
          </mat-card>
        </div>

        <div class="table-grid">
          <mat-card>
            <mat-card-header>
              <mat-card-title>Meilleurs cours</mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <table mat-table [dataSource]="stats.topCourses" class="dashboard-table">
                <ng-container matColumnDef="title">
                  <th mat-header-cell *matHeaderCellDef>Cours</th>
                  <td mat-cell *matCellDef="let row">{{ row.title }}</td>
                </ng-container>
                <ng-container matColumnDef="category">
                  <th mat-header-cell *matHeaderCellDef>Categorie</th>
                  <td mat-cell *matCellDef="let row">{{ row.category }}</td>
                </ng-container>
                <ng-container matColumnDef="enrollments">
                  <th mat-header-cell *matHeaderCellDef>Inscrits</th>
                  <td mat-cell *matCellDef="let row">
                    <mat-chip>{{ row.enrollments || 0 }}</mat-chip>
                  </td>
                </ng-container>
                <tr mat-header-row *matHeaderRowDef="topCourseColumns"></tr>
                <tr mat-row *matRowDef="let row; columns: topCourseColumns;"></tr>
              </table>
            </mat-card-content>
          </mat-card>

          <mat-card>
            <mat-card-header>
              <mat-card-title>Dernieres inscriptions</mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <table mat-table [dataSource]="stats.recentEnrollments" class="dashboard-table">
                <ng-container matColumnDef="student">
                  <th mat-header-cell *matHeaderCellDef>Etudiant</th>
                  <td mat-cell *matCellDef="let row">{{ row.student }}</td>
                </ng-container>
                <ng-container matColumnDef="course">
                  <th mat-header-cell *matHeaderCellDef>Cours</th>
                  <td mat-cell *matCellDef="let row">{{ row.course }}</td>
                </ng-container>
                <ng-container matColumnDef="status">
                  <th mat-header-cell *matHeaderCellDef>Statut</th>
                  <td mat-cell *matCellDef="let row">
                    <mat-chip>{{ statusLabel(row.status) }}</mat-chip>
                  </td>
                </ng-container>
                <ng-container matColumnDef="date">
                  <th mat-header-cell *matHeaderCellDef>Date</th>
                  <td mat-cell *matCellDef="let row">{{ row.enrolledAt }}</td>
                </ng-container>
                <tr mat-header-row *matHeaderRowDef="recentColumns"></tr>
                <tr mat-row *matRowDef="let row; columns: recentColumns;"></tr>
              </table>
            </mat-card-content>
          </mat-card>
        </div>
      </ng-container>
    </section>
  `,
  styles: [``],
})
export class AdminDashboardComponent implements OnInit {
  private dashboardService = inject(DashboardService);
  stats: AdminDashboard | null = null;
  loading = true;
  error: string | null = null;
  topCourseColumns = ['title', 'category', 'enrollments'];
  recentColumns = ['student', 'course', 'status', 'date'];

  barOptions: ChartOptions<'bar'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: { y: { beginAtZero: true } },
  };

  lineOptions: ChartOptions<'line'> = {
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
    this.dashboardService.getAdminDashboard().subscribe({
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
      { label: 'Utilisateurs', value: stats?.totalUsers ?? 0, icon: 'groups', description: 'Comptes actifs sur la plateforme' },
      { label: 'Enseignants', value: stats?.totalTeachers ?? 0, icon: 'school', description: 'Profils responsables des cours' },
      { label: 'Etudiants', value: stats?.totalStudents ?? 0, icon: 'person', description: 'Apprenants inscrits' },
      { label: 'Cours', value: stats?.totalCourses ?? 0, icon: 'menu_book', description: 'Cours disponibles dans EduTrack' },
      { label: 'Categories', value: stats?.totalCategories ?? 0, icon: 'category', description: 'Domaines pedagogiques' },
      { label: 'Inscriptions', value: stats?.totalEnrollments ?? 0, icon: 'assignment', description: 'Relations etudiant-cours' },
      { label: 'Progression moyenne', value: `${Math.round(stats?.averageProgress ?? 0)}%`, icon: 'trending_up', description: 'Avancement global des apprenants' },
      { label: 'Cours termines', value: stats?.completedEnrollments ?? 0, icon: 'verified', description: 'Formations terminees' },
    ];
  }

  coursesByCategoryData(): ChartConfiguration<'bar'>['data'] {
    return this.mapToBarData(this.stats?.coursesByCategory ?? {}, '#4f46e5', 'Cours');
  }

  enrollmentsByCourseData(): ChartConfiguration<'bar'>['data'] {
    return this.mapToBarData(this.stats?.enrollmentsByCourse ?? {}, '#0ea5e9', 'Inscriptions');
  }

  enrollmentTrendData(): ChartConfiguration<'line'>['data'] {
    const source = this.stats?.enrollmentTrend ?? {};
    return {
      labels: Object.keys(source),
      datasets: [{ data: Object.values(source), label: 'Inscriptions', borderColor: '#f43f5e', backgroundColor: 'rgba(244,63,94,.12)', tension: .35, fill: true }],
    };
  }

  roleDistributionData(): ChartConfiguration<'doughnut'>['data'] {
    const source = this.stats?.roleDistribution ?? {};
    return {
      labels: Object.keys(source),
      datasets: [{ data: Object.values(source), backgroundColor: ['#0f172a', '#4f46e5', '#22c55e'] }],
    };
  }

  statusLabel(status: string): string {
    return status === 'COMPLETED' ? 'Termine' : status === 'NOT_STARTED' ? 'Non commence' : 'En cours';
  }

  private mapToBarData(source: Record<string, number>, color: string, label: string): ChartConfiguration<'bar'>['data'] {
    return { labels: Object.keys(source), datasets: [{ data: Object.values(source), label, backgroundColor: color, borderRadius: 8 }] };
  }
}
