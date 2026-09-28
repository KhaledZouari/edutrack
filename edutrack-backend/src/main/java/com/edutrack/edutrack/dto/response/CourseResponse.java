package com.edutrack.edutrack.dto.response;

import com.edutrack.edutrack.enums.CourseLevel;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class CourseResponse {
    private Long id;
    private String title;
    private String description;
    private Double price;
    private CourseLevel level;
    private Integer durationHours;
    private String imageUrl;
    private Long categoryId;
    private String categoryName;
    private Long teacherId;
    private String teacherName;
    private String teacherEmail;
    private Boolean active;
    private String createdAt;
    private Long enrollmentsCount;
    private Double averageProgress;
}
