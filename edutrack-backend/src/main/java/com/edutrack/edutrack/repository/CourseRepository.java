package com.edutrack.edutrack.repository;

import com.edutrack.edutrack.entity.Course;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface CourseRepository extends JpaRepository<Course, Long> {
    @EntityGraph(attributePaths = {"category", "teacher"})
    List<Course> findByTeacherId(Long teacherId);

    @EntityGraph(attributePaths = {"category", "teacher"})
    List<Course> findByCategoryId(Long categoryId);

    @EntityGraph(attributePaths = {"category", "teacher"})
    @Query("""
            select c from Course c
            where (:categoryId is null or c.category.id = :categoryId)
              and (:teacherId is null or c.teacher.id = :teacherId)
              and (:q is null or lower(c.title) like lower(concat('%', :q, '%')))
            order by c.createdAt desc
            """)
    List<Course> search(@Param("categoryId") Long categoryId,
                        @Param("teacherId") Long teacherId,
                        @Param("q") String q);
}
