package com.edutrack.edutrack.controller;

import com.edutrack.edutrack.dto.request.CourseRequest;
import com.edutrack.edutrack.dto.response.CourseResponse;
import com.edutrack.edutrack.entity.Category;
import com.edutrack.edutrack.entity.Course;
import com.edutrack.edutrack.entity.User;
import com.edutrack.edutrack.exception.BusinessException;
import com.edutrack.edutrack.repository.CategoryRepository;
import com.edutrack.edutrack.repository.CourseRepository;
import com.edutrack.edutrack.repository.EnrollmentRepository;
import com.edutrack.edutrack.repository.UserRepository;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/courses")
@RequiredArgsConstructor
public class CourseController {
    private final CourseRepository courseRepository;
    private final CategoryRepository categoryRepository;
    private final UserRepository userRepository;
    private final EnrollmentRepository enrollmentRepository;

    @GetMapping
    public ResponseEntity<List<CourseResponse>> getCourses(
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) Long teacherId,
            @RequestParam(required = false) String q
    ) {
        Map<Long, EnrollmentRepository.CourseEnrollmentStats> statsByCourse = enrollmentRepository
                .aggregateStatsByCourse()
                .stream()
                .collect(Collectors.toMap(EnrollmentRepository.CourseEnrollmentStats::getCourseId, Function.identity()));

        return ResponseEntity.ok(courseRepository.search(categoryId, teacherId, q).stream()
                .map(course -> toResponse(course, statsByCourse.get(course.getId())))
                .toList());
    }

    @GetMapping("/{id}")
    public ResponseEntity<CourseResponse> getCourse(@PathVariable Long id) {
        EnrollmentRepository.CourseEnrollmentStats stats = enrollmentRepository.aggregateStatsByCourse().stream()
                .filter(item -> item.getCourseId().equals(id))
                .findFirst()
                .orElse(null);
        return ResponseEntity.ok(toResponse(findCourse(id), stats));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN','TEACHER')")
    public ResponseEntity<CourseResponse> createCourse(@Valid @RequestBody CourseRequest request) {
        Course course = new Course();
        applyRequest(course, request);
        course.setActive(true);
        course.setCreatedAt(java.time.LocalDateTime.now());
        return ResponseEntity.status(HttpStatus.CREATED).body(toResponse(courseRepository.save(course), null));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','TEACHER')")
    public ResponseEntity<CourseResponse> updateCourse(@PathVariable Long id, @Valid @RequestBody CourseRequest request) {
        Course course = findCourse(id);
        applyRequest(course, request);
        return ResponseEntity.ok(toResponse(courseRepository.save(course), null));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','TEACHER')")
    public ResponseEntity<Void> deleteCourse(@PathVariable Long id) {
        Course course = findCourse(id);
        course.setActive(false);
        courseRepository.save(course);
        return ResponseEntity.noContent().build();
    }

    private Course findCourse(Long id) {
        return courseRepository.findById(id).orElseThrow(() -> new BusinessException("Course not found"));
    }

    private void applyRequest(Course course, CourseRequest request) {
        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new BusinessException("Category not found"));
        User teacher = userRepository.findById(request.getTeacherId())
                .orElseThrow(() -> new BusinessException("Teacher not found"));

        course.setTitle(request.getTitle());
        course.setDescription(request.getDescription());
        course.setPrice(request.getPrice());
        course.setLevel(request.getLevel());
        course.setDurationHours(request.getDurationHours());
        course.setImageUrl(request.getImageUrl());
        course.setCategory(category);
        course.setTeacher(teacher);
    }

    private CourseResponse toResponse(Course course, EnrollmentRepository.CourseEnrollmentStats stats) {
        String teacherName = ((course.getTeacher().getFirstName() == null ? "" : course.getTeacher().getFirstName()) + " "
                + (course.getTeacher().getLastName() == null ? "" : course.getTeacher().getLastName())).trim();
        long enrollmentsCount = stats == null ? 0 : stats.getEnrollmentsCount();
        double average = stats == null ? 0 : stats.getAverageProgress();

        return CourseResponse.builder()
                .id(course.getId())
                .title(course.getTitle())
                .description(course.getDescription())
                .price(course.getPrice())
                .level(course.getLevel())
                .durationHours(course.getDurationHours())
                .imageUrl(course.getImageUrl())
                .categoryId(course.getCategory().getId())
                .categoryName(course.getCategory().getName())
                .teacherId(course.getTeacher().getId())
                .teacherName(teacherName.isBlank() ? course.getTeacher().getEmail() : teacherName)
                .teacherEmail(course.getTeacher().getEmail())
                .active(course.getActive())
                .createdAt(course.getCreatedAt().format(DateTimeFormatter.ISO_DATE_TIME))
                .enrollmentsCount(enrollmentsCount)
                .averageProgress(average)
                .build();
    }
}
