package com.edutrack.edutrack.dto.request;

import com.edutrack.edutrack.enums.CourseLevel;
import jakarta.validation.constraints.*;
import lombok.Data;

@Data
public class CourseRequest {
    @NotBlank
    private String title;

    @NotBlank
    private String description;

    @NotNull
    @PositiveOrZero
    private Double price;

    @NotNull
    private CourseLevel level;

    @NotNull
    @Positive
    private Integer durationHours;

    private String imageUrl;

    @NotNull
    private Long categoryId;

    @NotNull
    private Long teacherId;
}
