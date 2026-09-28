package com.edutrack.edutrack;

import com.edutrack.edutrack.entity.Category;
import com.edutrack.edutrack.entity.Course;
import com.edutrack.edutrack.entity.Enrollment;
import com.edutrack.edutrack.entity.User;
import com.edutrack.edutrack.enums.CourseLevel;
import com.edutrack.edutrack.enums.Role;
import com.edutrack.edutrack.repository.CategoryRepository;
import com.edutrack.edutrack.repository.CourseRepository;
import com.edutrack.edutrack.repository.EnrollmentRepository;
import com.edutrack.edutrack.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

@SpringBootApplication
public class EdutrackApplication {

    public static void main(String[] args) {
        SpringApplication.run(EdutrackApplication.class, args);
    }

    @Bean
    public CommandLineRunner commandLineRunner(
            UserRepository userRepository,
            CategoryRepository categoryRepository,
            CourseRepository courseRepository,
            EnrollmentRepository enrollmentRepository,
            JdbcTemplate jdbcTemplate,
            PasswordEncoder passwordEncoder
    ) {
        return args -> {
            jdbcTemplate.execute("ALTER TABLE users ALTER COLUMN role VARCHAR(30)");

            User admin = ensureUser(userRepository, passwordEncoder, "admin@edutrack.com", "Admin123", "EduTrack", "Admin", Role.ADMIN);

            User teacher1 = ensureUser(userRepository, passwordEncoder, "teacher@edutrack.com", "Teacher123", "Nadia", "Benali", Role.TEACHER);
            User teacher2 = ensureUser(userRepository, passwordEncoder, "teacher2@edutrack.com", "Teacher123", "Yassine", "Mansouri", Role.TEACHER);
            User teacher3 = ensureUser(userRepository, passwordEncoder, "teacher3@edutrack.com", "Teacher123", "Salma", "Kabbaj", Role.TEACHER);

            User student1 = ensureUser(userRepository, passwordEncoder, "student@edutrack.com", "Student123", "Sami", "Alaoui", Role.STUDENT);
            User student2 = ensureUser(userRepository, passwordEncoder, "student2@edutrack.com", "Student123", "Lina", "Idrissi", Role.STUDENT);
            User student3 = ensureUser(userRepository, passwordEncoder, "student3@edutrack.com", "Student123", "Omar", "Rami", Role.STUDENT);
            User student4 = ensureUser(userRepository, passwordEncoder, "student4@edutrack.com", "Student123", "Ines", "Bennani", Role.STUDENT);
            User student5 = ensureUser(userRepository, passwordEncoder, "student5@edutrack.com", "Student123", "Adam", "Tazi", Role.STUDENT);
            User student6 = ensureUser(userRepository, passwordEncoder, "student6@edutrack.com", "Student123", "Sara", "El Amrani", Role.STUDENT);

            // Keep the admin reference used so static analysis does not mark it as accidental.
            if (!admin.getActive()) {
                admin.setActive(true);
                userRepository.save(admin);
            }

            Category web = ensureCategory(categoryRepository, "Developpement Web", "Angular, Spring Boot et applications full-stack.", "https://images.unsplash.com/photo-1498050108023-c5249f4df085");
            Category programming = ensureCategory(categoryRepository, "Programmation", "Java, Python, POO et bonnes pratiques de codage.", "https://images.unsplash.com/photo-1515879218367-8466d910aaa4");
            Category database = ensureCategory(categoryRepository, "Base de donnees", "SQL, modelisation, requetes et optimisation.", "https://images.unsplash.com/photo-1544383835-bda2bc66a55d");
            Category ai = ensureCategory(categoryRepository, "Intelligence Artificielle", "IA, machine learning et analyse de donnees.", "https://images.unsplash.com/photo-1555949963-aa79dcee981c");
            Category security = ensureCategory(categoryRepository, "Cybersecurite", "Securite applicative, reseaux et bonnes pratiques.", "https://images.unsplash.com/photo-1550751827-4bd374c3f58b");
            Category design = ensureCategory(categoryRepository, "Design UI/UX", "Figma, design systems et experience utilisateur.", "https://images.unsplash.com/photo-1581291518857-4e27b48ff24e");
            Category cloud = ensureCategory(categoryRepository, "Cloud Computing", "AWS, deploiement, conteneurs et architectures cloud.", "https://images.unsplash.com/photo-1451187580459-43490279c0fa");

            ensureCourse(courseRepository, "Angular pour debutants", "Composants standalone, templates, routing et bases Angular.", 79.0, CourseLevel.BEGINNER, 20, "https://images.unsplash.com/photo-1498050108023-c5249f4df085", web, teacher1);
            ensureCourse(courseRepository, "Angular professionnel", "Architecture Angular, services, guards, lazy loading et ReactiveForms.", 129.0, CourseLevel.INTERMEDIATE, 32, "https://images.unsplash.com/photo-1516321318423-f06f85e504b3", web, teacher1);
            ensureCourse(courseRepository, "Developpement Front-End moderne", "Interfaces responsives, Angular Material, composants et UX.", 109.0, CourseLevel.INTERMEDIATE, 26, "https://images.unsplash.com/photo-1461749280684-dccba630e2f6", web, teacher1);
            ensureCourse(courseRepository, "Spring Boot REST API", "Creation d'une API REST securisee pour alimenter une application Angular.", 149.0, CourseLevel.ADVANCED, 28, "https://images.unsplash.com/photo-1515879218367-8466d910aaa4", web, teacher2);
            ensureCourse(courseRepository, "Java POO avancee", "Heritage, interfaces, generiques, collections et architecture Java.", 99.0, CourseLevel.INTERMEDIATE, 24, "https://images.unsplash.com/photo-1526379095098-d400fd0bf935", programming, teacher2);
            ensureCourse(courseRepository, "Python Data Analyse", "Nettoyage, exploration et visualisation de donnees avec Python.", 119.0, CourseLevel.BEGINNER, 24, "https://images.unsplash.com/photo-1555949963-aa79dcee981c", ai, teacher3);
            ensureCourse(courseRepository, "Machine Learning avec Python", "Regression, classification, evaluation de modeles et notebooks.", 159.0, CourseLevel.ADVANCED, 36, "https://images.unsplash.com/photo-1551288049-bebda4e38f71", ai, teacher3);
            ensureCourse(courseRepository, "Introduction a l'Intelligence Artificielle", "Concepts IA, domaines d'application et premiers modeles.", 89.0, CourseLevel.BEGINNER, 18, "https://images.unsplash.com/photo-1677442136019-21780ecad995", ai, teacher3);
            ensureCourse(courseRepository, "SQL et modelisation des bases de donnees", "MCD, MLD, jointures, vues et requetes avancees.", 95.0, CourseLevel.INTERMEDIATE, 22, "https://images.unsplash.com/photo-1544383835-bda2bc66a55d", database, teacher2);
            ensureCourse(courseRepository, "Cybersecurite fondamentale", "Menaces, chiffrement, authentification et securite web.", 135.0, CourseLevel.INTERMEDIATE, 25, "https://images.unsplash.com/photo-1550751827-4bd374c3f58b", security, teacher2);
            ensureCourse(courseRepository, "Design UI/UX avec Figma", "Maquettes, composants, prototypes et design system.", 99.0, CourseLevel.INTERMEDIATE, 18, "https://images.unsplash.com/photo-1581291518857-4e27b48ff24e", design, teacher1);
            ensureCourse(courseRepository, "Cloud Computing avec AWS", "Services AWS, deploiement, stockage, calcul et bonnes pratiques.", 169.0, CourseLevel.ADVANCED, 34, "https://images.unsplash.com/photo-1451187580459-43490279c0fa", cloud, teacher3);

            Map<String, Course> courses = courseRepository.findAll().stream()
                    .collect(Collectors.toMap(Course::getTitle, Function.identity(), (first, second) -> first));

            ensureEnrollment(enrollmentRepository, student1, courses.get("Angular pour debutants"), 85, LocalDateTime.now().minusDays(18));
            ensureEnrollment(enrollmentRepository, student1, courses.get("Spring Boot REST API"), 55, LocalDateTime.now().minusDays(12));
            ensureEnrollment(enrollmentRepository, student1, courses.get("SQL et modelisation des bases de donnees"), 100, LocalDateTime.now().minusDays(30));

            ensureEnrollment(enrollmentRepository, student2, courses.get("Angular pour debutants"), 100, LocalDateTime.now().minusDays(24));
            ensureEnrollment(enrollmentRepository, student2, courses.get("Design UI/UX avec Figma"), 70, LocalDateTime.now().minusDays(9));
            ensureEnrollment(enrollmentRepository, student2, courses.get("Developpement Front-End moderne"), 40, LocalDateTime.now().minusDays(5));

            ensureEnrollment(enrollmentRepository, student3, courses.get("Spring Boot REST API"), 35, LocalDateTime.now().minusDays(16));
            ensureEnrollment(enrollmentRepository, student3, courses.get("Java POO avancee"), 80, LocalDateTime.now().minusDays(11));
            ensureEnrollment(enrollmentRepository, student3, courses.get("Cybersecurite fondamentale"), 15, LocalDateTime.now().minusDays(3));

            ensureEnrollment(enrollmentRepository, student4, courses.get("Machine Learning avec Python"), 25, LocalDateTime.now().minusDays(7));
            ensureEnrollment(enrollmentRepository, student4, courses.get("Python Data Analyse"), 85, LocalDateTime.now().minusDays(19));
            ensureEnrollment(enrollmentRepository, student4, courses.get("Cloud Computing avec AWS"), 0, LocalDateTime.now().minusDays(1));

            ensureEnrollment(enrollmentRepository, student5, courses.get("Introduction a l'Intelligence Artificielle"), 55, LocalDateTime.now().minusDays(14));
            ensureEnrollment(enrollmentRepository, student5, courses.get("Machine Learning avec Python"), 40, LocalDateTime.now().minusDays(6));
            ensureEnrollment(enrollmentRepository, student5, courses.get("SQL et modelisation des bases de donnees"), 70, LocalDateTime.now().minusDays(21));

            ensureEnrollment(enrollmentRepository, student6, courses.get("Angular professionnel"), 65, LocalDateTime.now().minusDays(10));
            ensureEnrollment(enrollmentRepository, student6, courses.get("Cloud Computing avec AWS"), 15, LocalDateTime.now().minusDays(4));
            ensureEnrollment(enrollmentRepository, student6, courses.get("Cybersecurite fondamentale"), 100, LocalDateTime.now().minusDays(28));

            String adminEmail = System.getenv("ADMIN_EMAIL");
            if (adminEmail != null && !adminEmail.isBlank()) {
                userRepository.findByEmail(adminEmail).ifPresent(user -> {
                    if (user.getRole() != Role.ADMIN) {
                        user.setRole(Role.ADMIN);
                        userRepository.save(user);
                        System.out.println(">>> [AUTO-PROMOTION] User " + adminEmail + " has been promoted to ADMIN.");
                    }
                });
            }
        };
    }

    private User ensureUser(UserRepository userRepository, PasswordEncoder passwordEncoder, String email, String password, String firstName, String lastName, Role role) {
        return userRepository.findByEmail(email).map(user -> {
            user.setFirstName(firstName);
            user.setLastName(lastName);
            user.setRole(role);
            user.setActive(true);
            return userRepository.save(user);
        }).orElseGet(() -> userRepository.save(User.builder()
                .email(email)
                .password(passwordEncoder.encode(password))
                .firstName(firstName)
                .lastName(lastName)
                .role(role)
                .active(true)
                .createdAt(LocalDateTime.now())
                .build()));
    }

    private Category ensureCategory(CategoryRepository categoryRepository, String name, String description, String imageUrl) {
        return categoryRepository.findByName(name).map(category -> {
            category.setDescription(description);
            category.setImageUrl(imageUrl);
            return categoryRepository.save(category);
        }).orElseGet(() -> categoryRepository.save(Category.builder()
                .name(name)
                .description(description)
                .imageUrl(imageUrl)
                .build()));
    }

    private Course ensureCourse(CourseRepository courseRepository, String title, String description, Double price, CourseLevel level,
                                Integer durationHours, String imageUrl, Category category, User teacher) {
        return courseRepository.findAll().stream()
                .filter(course -> title.equals(course.getTitle()))
                .findFirst()
                .map(course -> {
                    course.setDescription(description);
                    course.setPrice(price);
                    course.setLevel(level);
                    course.setDurationHours(durationHours);
                    course.setImageUrl(imageUrl);
                    course.setCategory(category);
                    course.setTeacher(teacher);
                    course.setActive(true);
                    return courseRepository.save(course);
                })
                .orElseGet(() -> courseRepository.save(Course.builder()
                        .title(title)
                        .description(description)
                        .price(price)
                        .level(level)
                        .durationHours(durationHours)
                        .imageUrl(imageUrl)
                        .category(category)
                        .teacher(teacher)
                        .active(true)
                        .createdAt(LocalDateTime.now())
                        .build()));
    }

    private Enrollment ensureEnrollment(EnrollmentRepository enrollmentRepository, User student, Course course, Integer progress, LocalDateTime enrolledAt) {
        if (course == null) {
            throw new IllegalStateException("Course seed is missing for an enrollment.");
        }
        return enrollmentRepository.findByStudentIdAndCourseId(student.getId(), course.getId()).map(enrollment -> {
            enrollment.setProgress(progress);
            enrollment.setCertificateIssued(progress >= 100);
            enrollment.setEnrolledAt(enrolledAt);
            return enrollmentRepository.save(enrollment);
        }).orElseGet(() -> enrollmentRepository.save(Enrollment.builder()
                .student(student)
                .course(course)
                .progress(progress)
                .certificateIssued(progress >= 100)
                .enrolledAt(enrolledAt)
                .build()));
    }
}
