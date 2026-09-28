package com.edutrack.edutrack.dto.response;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class EnrollmentResponse {
    private Long id;
    private Long studentId;
    private String studentName;
    private String studentEmail;
    private Long courseId;
    private String courseTitle;
    private String teacherName;
    private Integer progress;
    private Boolean certificateIssued;
    private String enrolledAt;
}
