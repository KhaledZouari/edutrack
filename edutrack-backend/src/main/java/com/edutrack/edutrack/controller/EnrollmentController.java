package com.edutrack.edutrack.controller;

import com.edutrack.edutrack.dto.response.EnrollmentResponse;
import com.edutrack.edutrack.entity.Course;
import com.edutrack.edutrack.entity.Enrollment;
import com.edutrack.edutrack.entity.User;
import com.edutrack.edutrack.exception.BusinessException;
import com.edutrack.edutrack.repository.CourseRepository;
import com.edutrack.edutrack.repository.EnrollmentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

@RestController
@RequestMapping("/api/enrollments")
@RequiredArgsConstructor
public class EnrollmentController {
    private final EnrollmentRepository enrollmentRepository;
    private final CourseRepository courseRepository;

    @GetMapping
    public ResponseEntity<List<EnrollmentResponse>> getEnrollments(Authentication auth) {
        User user = (User) auth.getPrincipal();
        List<Enrollment> enrollments;
        if (user.getRole().name().equals("ADMIN")) {
            enrollments = enrollmentRepository.findAll();
        } else if (user.getRole().name().equals("TEACHER")) {
            enrollments = enrollmentRepository.findByCourseTeacherId(user.getId());
        } else {
            enrollments = enrollmentRepository.findByStudentId(user.getId());
        }
        return ResponseEntity.ok(enrollments.stream().map(this::toResponse).toList());
    }

    @PostMapping("/course/{courseId}")
    public ResponseEntity<EnrollmentResponse> enroll(@PathVariable Long courseId, Authentication auth) {
        User student = (User) auth.getPrincipal();
        Course course = courseRepository.findById(courseId).orElseThrow(() -> new BusinessException("Course not found"));

        enrollmentRepository.findByStudentIdAndCourseId(student.getId(), courseId)
                .ifPresent(e -> { throw new BusinessException("Already enrolled"); });

        Enrollment enrollment = Enrollment.builder()
                .student(student)
                .course(course)
                .progress(0)
                .certificateIssued(false)
                .enrolledAt(LocalDateTime.now())
                .build();
        return ResponseEntity.status(HttpStatus.CREATED).body(toResponse(enrollmentRepository.save(enrollment)));
    }

    @PutMapping("/{id}/progress")
    public ResponseEntity<EnrollmentResponse> updateProgress(@PathVariable Long id, @RequestParam Integer progress) {
        Enrollment enrollment = enrollmentRepository.findById(id).orElseThrow(() -> new BusinessException("Enrollment not found"));
        int normalized = Math.max(0, Math.min(100, progress));
        enrollment.setProgress(normalized);
        enrollment.setCertificateIssued(normalized == 100);
        return ResponseEntity.ok(toResponse(enrollmentRepository.save(enrollment)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteEnrollment(@PathVariable Long id) {
        enrollmentRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    private EnrollmentResponse toResponse(Enrollment enrollment) {
        User student = enrollment.getStudent();
        Course course = enrollment.getCourse();
        String studentName = ((student.getFirstName() == null ? "" : student.getFirstName()) + " "
                + (student.getLastName() == null ? "" : student.getLastName())).trim();
        String teacherName = ((course.getTeacher().getFirstName() == null ? "" : course.getTeacher().getFirstName()) + " "
                + (course.getTeacher().getLastName() == null ? "" : course.getTeacher().getLastName())).trim();

        return EnrollmentResponse.builder()
                .id(enrollment.getId())
                .studentId(student.getId())
                .studentName(studentName.isBlank() ? student.getEmail() : studentName)
                .studentEmail(student.getEmail())
                .courseId(course.getId())
                .courseTitle(course.getTitle())
                .teacherName(teacherName.isBlank() ? course.getTeacher().getEmail() : teacherName)
                .progress(enrollment.getProgress())
                .certificateIssued(enrollment.getCertificateIssued())
                .enrolledAt(enrollment.getEnrolledAt().format(DateTimeFormatter.ISO_DATE_TIME))
                .build();
    }
}
