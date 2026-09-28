export type CourseLevel = 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';

export interface CourseTeacher {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
}

export interface CourseCategory {
  id: number;
  name: string;
  description?: string | null;
}

export interface CourseRequest {
  title: string;
  description: string;
  price: number;
  level: CourseLevel;
  durationHours: number;
  imageUrl?: string | null;
  categoryId: number;
  teacherId: number;
}

export interface CourseResponse extends CourseRequest {
  id: number;
  categoryName: string;
  teacherName: string;
  teacherEmail: string;
  category?: CourseCategory;
  teacher?: CourseTeacher;
  active: boolean;
  createdAt: string;
  enrollmentsCount: number;
  averageProgress: number;
}

export const COURSE_LEVEL_LABELS: Record<CourseLevel, string> = {
  BEGINNER: 'Debutant',
  INTERMEDIATE: 'Intermediaire',
  ADVANCED: 'Avance'
};
