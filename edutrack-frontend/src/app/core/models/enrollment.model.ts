import { CourseResponse } from './course.model';
import { User } from './user.model';

export interface EnrollmentResponse {
  id: number;
  studentId: number;
  studentName: string;
  studentEmail: string;
  courseId: number;
  courseTitle: string;
  teacherName: string;
  student?: User;
  course?: CourseResponse;
  progress: number;
  certificateIssued: boolean;
  enrolledAt: string;
}
