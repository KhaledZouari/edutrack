package com.edutrack.edutrack.repository;

import com.edutrack.edutrack.entity.Enrollment;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface EnrollmentRepository extends JpaRepository<Enrollment, Long> {
    interface CourseEnrollmentStats {
        Long getCourseId();
        Long getEnrollmentsCount();
        Double getAverageProgress();
    }

    @EntityGraph(attributePaths = {"course", "course.category", "course.teacher"})
    List<Enrollment> findByStudentId(Long studentId);

    @EntityGraph(attributePaths = {"student", "course", "course.category", "course.teacher"})
    List<Enrollment> findByCourseTeacherId(Long teacherId);

    Optional<Enrollment> findByStudentIdAndCourseId(Long studentId, Long courseId);

    Long countByCourseTeacherId(Long teacherId);

    Long countByStudentId(Long studentId);

    @Query("""
            select e.course.id as courseId,
                   count(e.id) as enrollmentsCount,
                   coalesce(avg(e.progress), 0) as averageProgress
            from Enrollment e
            group by e.course.id
            """)
    List<CourseEnrollmentStats> aggregateStatsByCourse();

    @Query("select coalesce(avg(e.progress), 0) from Enrollment e where e.course.teacher.id = :teacherId")
    Double averageProgressForTeacher(@Param("teacherId") Long teacherId);

    @Query("select coalesce(avg(e.progress), 0) from Enrollment e where e.student.id = :studentId")
    Double averageProgressForStudent(@Param("studentId") Long studentId);
}
