package com.edutrack.edutrack.controller;

import com.edutrack.edutrack.entity.Course;
import com.edutrack.edutrack.entity.Enrollment;
import com.edutrack.edutrack.entity.User;
import com.edutrack.edutrack.enums.Role;
import com.edutrack.edutrack.repository.CategoryRepository;
import com.edutrack.edutrack.repository.CourseRepository;
import com.edutrack.edutrack.repository.EnrollmentRepository;
import com.edutrack.edutrack.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.format.DateTimeFormatter;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
public class DashboardController {
    private static final DateTimeFormatter DATE_FORMAT = DateTimeFormatter.ofPattern("dd/MM/yyyy");

    private final UserRepository userRepository;
    private final CategoryRepository categoryRepository;
    private final CourseRepository courseRepository;
    private final EnrollmentRepository enrollmentRepository;

    @GetMapping("/admin")
    public ResponseEntity<Map<String, Object>> adminDashboard() {
        List<User> users = userRepository.findAll();
        List<Course> courses = courseRepository.findAll();
        List<Enrollment> enrollments = enrollmentRepository.findAll();

        Map<String, Object> data = new LinkedHashMap<>();
        data.put("totalUsers", users.size());
        data.put("totalTeachers", users.stream().filter(user -> user.getRole() == Role.TEACHER).count());
        data.put("totalStudents", users.stream().filter(user -> user.getRole() == Role.STUDENT).count());
        data.put("totalCourses", courses.size());
        data.put("totalCategories", categoryRepository.count());
        data.put("totalEnrollments", enrollments.size());
        data.put("completedEnrollments", enrollments.stream().filter(enrollment -> enrollment.getProgress() >= 100).count());
        data.put("inProgressEnrollments", enrollments.stream().filter(enrollment -> enrollment.getProgress() > 0 && enrollment.getProgress() < 100).count());
        data.put("notStartedEnrollments", enrollments.stream().filter(enrollment -> enrollment.getProgress() == 0).count());
        data.put("averageProgress", averageProgress(enrollments));
        data.put("roleDistribution", roleDistribution(users));
        data.put("coursesByCategory", coursesByCategory(courses));
        data.put("enrollmentsByCourse", enrollmentsByCourse(enrollments));
        data.put("topCourses", topCourses(courses, enrollments));
        data.put("recentEnrollments", recentEnrollments(enrollments, 8));
        data.put("enrollmentTrend", enrollmentTrend(enrollments));
        return ResponseEntity.ok(data);
    }

    @GetMapping("/teacher")
    public ResponseEntity<Map<String, Object>> teacherDashboard(Authentication auth) {
        User teacher = (User) auth.getPrincipal();
        List<Course> teacherCourses = courseRepository.findByTeacherId(teacher.getId());
        List<Enrollment> teacherEnrollments = enrollmentRepository.findByCourseTeacherId(teacher.getId());

        Map<String, Object> data = new LinkedHashMap<>();
        data.put("myCourses", teacherCourses.stream().map(this::courseRow).toList());
        data.put("totalMyCourses", teacherCourses.size());
        data.put("totalMyStudents", teacherEnrollments.stream().map(enrollment -> enrollment.getStudent().getId()).distinct().count());
        data.put("averageProgress", averageProgress(teacherEnrollments));
        data.put("activeCourses", teacherCourses.stream().filter(course -> Boolean.TRUE.equals(course.getActive())).count());
        data.put("completedEnrollments", teacherEnrollments.stream().filter(enrollment -> enrollment.getProgress() >= 100).count());
        data.put("enrollmentsByMyCourses", enrollmentsByCourse(teacherEnrollments));
        data.put("progressByCourse", averageProgressByCourse(teacherCourses, teacherEnrollments));
        data.put("statusDistribution", statusDistribution(teacherEnrollments));
        data.put("topMyCourses", topCourses(teacherCourses, teacherEnrollments));
        data.put("recentStudentActivity", recentEnrollments(teacherEnrollments, 8));
        return ResponseEntity.ok(data);
    }

    @GetMapping("/student")
    public ResponseEntity<Map<String, Object>> studentDashboard(Authentication auth) {
        User student = (User) auth.getPrincipal();
        List<Enrollment> studentEnrollments = enrollmentRepository.findByStudentId(student.getId());
        List<Long> enrolledCourseIds = studentEnrollments.stream().map(enrollment -> enrollment.getCourse().getId()).toList();
        List<Course> recommendedCourses = courseRepository.findAll().stream()
                .filter(course -> !enrolledCourseIds.contains(course.getId()))
                .limit(6)
                .toList();

        Map<String, Object> data = new LinkedHashMap<>();
        data.put("myEnrollments", studentEnrollments.stream()
                .sorted(Comparator.comparing(Enrollment::getEnrolledAt).reversed())
                .map(this::studentEnrollmentRow)
                .toList());
        data.put("totalMyCourses", studentEnrollments.size());
        data.put("completedCourses", studentEnrollments.stream().filter(enrollment -> enrollment.getProgress() >= 100).count());
        data.put("inProgressCourses", studentEnrollments.stream().filter(enrollment -> enrollment.getProgress() > 0 && enrollment.getProgress() < 100).count());
        data.put("notStartedCourses", studentEnrollments.stream().filter(enrollment -> enrollment.getProgress() == 0).count());
        data.put("averageProgress", averageProgress(studentEnrollments));
        data.put("certificates", studentEnrollments.stream().filter(enrollment -> Boolean.TRUE.equals(enrollment.getCertificateIssued())).count());
        data.put("progressByCourse", studentEnrollments.stream()
                .collect(Collectors.toMap(
                        enrollment -> enrollment.getCourse().getTitle(),
                        Enrollment::getProgress,
                        (first, second) -> first,
                        LinkedHashMap::new
                )));
        data.put("recommendedCourses", recommendedCourses.stream().map(this::courseRow).toList());
        data.put("recentCourses", studentEnrollments.stream()
                .sorted(Comparator.comparing(Enrollment::getEnrolledAt).reversed())
                .limit(5)
                .map(enrollment -> courseRow(enrollment.getCourse()))
                .toList());
        return ResponseEntity.ok(data);
    }

    private Map<String, Long> roleDistribution(List<User> users) {
        Map<String, Long> distribution = new LinkedHashMap<>();
        distribution.put("ADMIN", users.stream().filter(user -> user.getRole() == Role.ADMIN).count());
        distribution.put("TEACHER", users.stream().filter(user -> user.getRole() == Role.TEACHER).count());
        distribution.put("STUDENT", users.stream().filter(user -> user.getRole() == Role.STUDENT).count());
        return distribution;
    }

    private Map<String, Long> coursesByCategory(List<Course> courses) {
        return courses.stream().collect(Collectors.groupingBy(
                course -> course.getCategory() == null ? "Sans categorie" : course.getCategory().getName(),
                LinkedHashMap::new,
                Collectors.counting()
        ));
    }

    private Map<String, Long> enrollmentsByCourse(List<Enrollment> enrollments) {
        return enrollments.stream().collect(Collectors.groupingBy(
                enrollment -> enrollment.getCourse().getTitle(),
                LinkedHashMap::new,
                Collectors.counting()
        ));
    }

    private Map<String, Double> averageProgressByCourse(List<Course> courses, List<Enrollment> enrollments) {
        Map<String, Double> progress = new LinkedHashMap<>();
        courses.forEach(course -> {
            List<Enrollment> courseEnrollments = enrollments.stream()
                    .filter(enrollment -> enrollment.getCourse().getId().equals(course.getId()))
                    .toList();
            progress.put(course.getTitle(), averageProgress(courseEnrollments));
        });
        return progress;
    }

    private Map<String, Long> statusDistribution(List<Enrollment> enrollments) {
        Map<String, Long> distribution = new LinkedHashMap<>();
        distribution.put("NOT_STARTED", enrollments.stream().filter(enrollment -> enrollment.getProgress() == 0).count());
        distribution.put("IN_PROGRESS", enrollments.stream().filter(enrollment -> enrollment.getProgress() > 0 && enrollment.getProgress() < 100).count());
        distribution.put("COMPLETED", enrollments.stream().filter(enrollment -> enrollment.getProgress() >= 100).count());
        return distribution;
    }

    private List<Map<String, Object>> topCourses(List<Course> courses, List<Enrollment> enrollments) {
        return courses.stream()
                .map(course -> {
                    List<Enrollment> courseEnrollments = enrollments.stream()
                            .filter(enrollment -> enrollment.getCourse().getId().equals(course.getId()))
                            .toList();
                    Map<String, Object> row = courseRow(course);
                    row.put("enrollments", courseEnrollments.size());
                    row.put("averageProgress", averageProgress(courseEnrollments));
                    return row;
                })
                .sorted((first, second) -> Long.compare(toLong(second.get("enrollments")), toLong(first.get("enrollments"))))
                .limit(6)
                .toList();
    }

    private List<Map<String, Object>> recentEnrollments(List<Enrollment> enrollments, int limit) {
        return enrollments.stream()
                .sorted(Comparator.comparing(Enrollment::getEnrolledAt).reversed())
                .limit(limit)
                .map(this::enrollmentRow)
                .toList();
    }

    private Map<String, Long> enrollmentTrend(List<Enrollment> enrollments) {
        return enrollments.stream()
                .sorted(Comparator.comparing(Enrollment::getEnrolledAt))
                .collect(Collectors.groupingBy(
                        enrollment -> enrollment.getEnrolledAt().format(DATE_FORMAT),
                        LinkedHashMap::new,
                        Collectors.counting()
                ));
    }

    private Map<String, Object> enrollmentRow(Enrollment enrollment) {
        Map<String, Object> row = new LinkedHashMap<>();
        row.put("id", enrollment.getId());
        row.put("student", fullName(enrollment.getStudent()));
        row.put("studentEmail", enrollment.getStudent().getEmail());
        row.put("course", enrollment.getCourse().getTitle());
        row.put("teacher", fullName(enrollment.getCourse().getTeacher()));
        row.put("progress", enrollment.getProgress());
        row.put("status", status(enrollment.getProgress()));
        row.put("enrolledAt", enrollment.getEnrolledAt().format(DATE_FORMAT));
        return row;
    }

    private Map<String, Object> studentEnrollmentRow(Enrollment enrollment) {
        Map<String, Object> row = enrollmentRow(enrollment);
        row.put("category", enrollment.getCourse().getCategory().getName());
        row.put("certificateIssued", enrollment.getCertificateIssued());
        return row;
    }

    private Map<String, Object> courseRow(Course course) {
        Map<String, Object> row = new LinkedHashMap<>();
        row.put("id", course.getId());
        row.put("title", course.getTitle());
        row.put("category", course.getCategory() == null ? "Sans categorie" : course.getCategory().getName());
        row.put("teacher", course.getTeacher() == null ? "" : fullName(course.getTeacher()));
        row.put("level", course.getLevel().name());
        row.put("price", course.getPrice());
        row.put("durationHours", course.getDurationHours());
        return row;
    }

    private Double averageProgress(List<Enrollment> enrollments) {
        return enrollments.stream().mapToInt(Enrollment::getProgress).average().orElse(0);
    }

    private String status(Integer progress) {
        if (progress == null || progress == 0) {
            return "NOT_STARTED";
        }
        if (progress >= 100) {
            return "COMPLETED";
        }
        return "IN_PROGRESS";
    }

    private String fullName(User user) {
        return ((user.getFirstName() == null ? "" : user.getFirstName()) + " " + (user.getLastName() == null ? "" : user.getLastName())).trim();
    }

    private long toLong(Object value) {
        if (value instanceof Number number) {
            return number.longValue();
        }
        return 0;
    }
}
