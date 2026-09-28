import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';
import { LoginComponent } from './features/auth/login/login.component';

export const appRoutes: Routes = [
  {
    path: '',
    redirectTo: 'courses',
    pathMatch: 'full',
  },
  {
    path: 'home',
    redirectTo: 'courses',
    pathMatch: 'full',
  },
  {
    path: 'login',
    component: LoginComponent,
    data: { title: 'Connexion EduTrack' },
  },
  {
    path: 'register',
    loadComponent: () => import('./register/register.component').then(m => m.RegisterComponent),
    data: { title: 'Inscription EduTrack' },
  },
  {
    path: 'forgot-password',
    loadComponent: () => import('./features/auth/forgot-password/forgot-password.component').then(m => m.ForgotPasswordComponent),
  },
  {
    path: 'reset-password',
    loadComponent: () => import('./features/auth/reset-password/reset-password.component').then(m => m.ResetPasswordComponent),
  },
  {
    path: 'forbidden',
    loadComponent: () => import('./shared/forbidden/forbidden.component').then(m => m.ForbiddenComponent),
  },
  {
    path: 'courses',
    loadComponent: () => import('./features/courses/course-list/course-list.component').then(m => m.CourseListComponent),
  },
  {
    path: 'courses/add',
    canActivate: [authGuard, roleGuard],
    data: { roles: ['ADMIN', 'TEACHER'] },
    loadComponent: () => import('./features/courses/course-form/course-form.component').then(m => m.CourseFormComponent),
  },
  {
    path: 'courses/new',
    redirectTo: 'courses/add',
    pathMatch: 'full',
  },
  {
    path: 'courses/edit/:id',
    canActivate: [authGuard, roleGuard],
    data: { roles: ['ADMIN', 'TEACHER'] },
    loadComponent: () => import('./features/courses/course-form/course-form.component').then(m => m.CourseFormComponent),
  },
  {
    path: 'courses/details/:id',
    loadComponent: () => import('./features/courses/course-details/course-details.component').then(m => m.CourseDetailsComponent),
  },
  {
    path: 'courses/:id',
    redirectTo: 'courses/details/:id',
  },
  {
    path: 'categories',
    canActivate: [authGuard, roleGuard],
    data: { roles: ['ADMIN'] },
    loadComponent: () => import('./features/categories/category-list/category-list.component').then(m => m.CategoryListComponent),
  },
  {
    path: 'enrollments',
    canActivate: [authGuard],
    loadComponent: () => import('./features/enrollments/enrollment-management.component').then(m => m.EnrollmentManagementComponent),
  },
  {
    path: 'users',
    canActivate: [authGuard, roleGuard],
    data: { roles: ['ADMIN'] },
    loadComponent: () => import('./features/users/user-list/user-list.component').then(m => m.UserListComponent),
  },
  {
    path: 'admin/dashboard',
    canActivate: [authGuard, roleGuard],
    data: { roles: ['ADMIN'] },
    loadComponent: () => import('./features/dashboards/admin-dashboard/admin-dashboard.component').then(m => m.AdminDashboardComponent),
  },
  {
    path: 'teacher/dashboard',
    canActivate: [authGuard, roleGuard],
    data: { roles: ['TEACHER'] },
    loadComponent: () => import('./features/dashboards/teacher-dashboard/teacher-dashboard.component').then(m => m.TeacherDashboardComponent),
  },
  {
    path: 'student/dashboard',
    canActivate: [authGuard, roleGuard],
    data: { roles: ['STUDENT'] },
    loadComponent: () => import('./features/dashboards/student-dashboard/student-dashboard.component').then(m => m.StudentDashboardComponent),
  },
  { path: 'dashboard/admin', redirectTo: 'admin/dashboard', pathMatch: 'full' },
  { path: 'dashboard/teacher', redirectTo: 'teacher/dashboard', pathMatch: 'full' },
  { path: 'dashboard/student', redirectTo: 'student/dashboard', pathMatch: 'full' },
  {
    path: 'profile',
    canActivate: [authGuard],
    loadComponent: () => import('./components/profile/profile.component').then(m => m.ProfileComponent),
  },
  {
    path: '**',
    redirectTo: 'courses',
  },
];
