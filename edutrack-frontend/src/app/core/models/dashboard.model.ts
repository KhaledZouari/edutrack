export interface CourseDashboardRow {
  id: number;
  title: string;
  category: string;
  teacher: string;
  level: string;
  price: number;
  durationHours: number;
  enrollments?: number;
  averageProgress?: number;
}

export interface EnrollmentDashboardRow {
  id: number;
  student: string;
  studentEmail: string;
  course: string;
  teacher: string;
  progress: number;
  status: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED';
  enrolledAt: string;
  category?: string;
  certificateIssued?: boolean;
}

export interface AdminDashboard {
  totalUsers: number;
  totalTeachers: number;
  totalStudents: number;
  totalCourses: number;
  totalCategories: number;
  totalEnrollments: number;
  completedEnrollments: number;
  inProgressEnrollments: number;
  notStartedEnrollments: number;
  averageProgress: number;
  roleDistribution: Record<string, number>;
  coursesByCategory: Record<string, number>;
  enrollmentsByCourse: Record<string, number>;
  topCourses: CourseDashboardRow[];
  recentEnrollments: EnrollmentDashboardRow[];
  enrollmentTrend: Record<string, number>;
}

export interface TeacherDashboard {
  myCourses: CourseDashboardRow[];
  totalMyCourses: number;
  totalMyStudents: number;
  averageProgress: number;
  activeCourses: number;
  completedEnrollments: number;
  enrollmentsByMyCourses: Record<string, number>;
  progressByCourse: Record<string, number>;
  statusDistribution: Record<string, number>;
  topMyCourses: CourseDashboardRow[];
  recentStudentActivity: EnrollmentDashboardRow[];
}

export interface StudentDashboard {
  myEnrollments: EnrollmentDashboardRow[];
  totalMyCourses: number;
  completedCourses: number;
  inProgressCourses: number;
  notStartedCourses: number;
  averageProgress: number;
  certificates: number;
  progressByCourse: Record<string, number>;
  recommendedCourses: CourseDashboardRow[];
  recentCourses: CourseDashboardRow[];
}
