import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatToolbarModule } from '@angular/material/toolbar';
import { AuthService } from '../../core/services/auth.service';

type UserRole = 'STUDENT' | 'TEACHER' | 'ADMIN' | 'GUEST';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, MatToolbarModule, MatButtonModule, MatIconModule, MatMenuModule],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent {
  public router = inject(Router);
  private authService = inject(AuthService);

  userRole = computed(() => (this.authService.currentRole() as UserRole) || 'GUEST');
  isMobileMenuOpen = signal(false);
  searchQuery = '';

  navLinks = computed(() => {
    switch (this.userRole()) {
      case 'ADMIN':
        return [
          { label: 'Tableau de bord', path: '/admin/dashboard', icon: 'dashboard_customize' },
          { label: 'Cours', path: '/courses', icon: 'menu_book' },
          { label: 'Categories', path: '/categories', icon: 'category' },
          { label: 'Inscriptions', path: '/enrollments', icon: 'assignment' },
          { label: 'Utilisateurs', path: '/users', icon: 'groups' }
        ];
      case 'TEACHER':
        return [
          { label: 'Tableau de bord', path: '/teacher/dashboard', icon: 'dashboard_customize' },
          { label: 'Mes cours', path: '/courses', icon: 'menu_book' },
          { label: 'Inscriptions', path: '/enrollments', icon: 'assignment' },
          { label: 'Nouveau cours', path: '/courses/add', icon: 'add_circle' }
        ];
      case 'STUDENT':
        return [
          { label: 'Tableau de bord', path: '/student/dashboard', icon: 'dashboard_customize' },
          { label: 'Cours', path: '/courses', icon: 'menu_book' },
          { label: 'Mes inscriptions', path: '/enrollments', icon: 'assignment' }
        ];
      default:
        return [
          { label: 'Cours', path: '/courses', icon: 'menu_book' }
        ];
    }
  });

  roleLabel(): string {
    if (this.userRole() === 'ADMIN') return 'Administrateur';
    if (this.userRole() === 'TEACHER') return 'Enseignant';
    if (this.userRole() === 'STUDENT') return 'Etudiant';
    return 'Invite';
  }

  onSearch(): void {
    this.router.navigate(['/courses'], { queryParams: { search: this.searchQuery } });
  }

  dashboardPath(): string {
    if (this.userRole() === 'ADMIN') return '/admin/dashboard';
    if (this.userRole() === 'TEACHER') return '/teacher/dashboard';
    return '/student/dashboard';
  }

  toggleMobileMenu(): void {
    this.isMobileMenuOpen.update(value => !value);
  }

  logout(): void {
    this.authService.logout().subscribe({
      next: () => this.router.navigate(['/courses']),
      error: () => {
        this.authService.clearSession();
        this.router.navigate(['/courses']);
      }
    });
  }
}
