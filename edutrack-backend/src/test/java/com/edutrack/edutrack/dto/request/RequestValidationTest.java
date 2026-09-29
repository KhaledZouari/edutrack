package com.edutrack.edutrack.dto.request;

import com.edutrack.edutrack.enums.CourseLevel;
import jakarta.validation.Validation;
import jakarta.validation.Validator;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class RequestValidationTest {
    private static Validator validator;

    @BeforeAll
    static void createValidator() {
        validator = Validation.buildDefaultValidatorFactory().getValidator();
    }

    @Test
    void registerRejectsMalformedEmailAndWeakPassword() {
        RegisterRequest request = validRegistration();
        request.setEmail("invalid-email");
        request.setPassword("weak");

        var violations = validator.validate(request);

        assertThat(violations)
                .extracting(violation -> violation.getPropertyPath().toString())
                .contains("email", "password");
    }

    @Test
    void registerAcceptsCompleteValidInput() {
        assertThat(validator.validate(validRegistration())).isEmpty();
    }

    @Test
    void courseRejectsNegativePriceAndZeroDuration() {
        CourseRequest request = new CourseRequest();
        request.setTitle("API REST");
        request.setDescription("Cours de conception d API");
        request.setPrice(-1.0);
        request.setLevel(CourseLevel.BEGINNER);
        request.setDurationHours(0);
        request.setCategoryId(1L);
        request.setTeacherId(2L);

        var violations = validator.validate(request);

        assertThat(violations)
                .extracting(violation -> violation.getPropertyPath().toString())
                .containsExactlyInAnyOrder("price", "durationHours");
    }

    private static RegisterRequest validRegistration() {
        RegisterRequest request = new RegisterRequest();
        request.setEmail("student@example.com");
        request.setPassword("Secure123");
        request.setFirstName("Khaled");
        request.setLastName("Zouari");
        return request;
    }
}
