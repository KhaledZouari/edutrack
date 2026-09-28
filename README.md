# EduTrack

## Description

EduTrack est une application Angular + Spring Boot pour la gestion de cours en ligne. Elle permet de gerer les utilisateurs, les cours, les categories, les inscriptions, la progression et les dashboards selon les roles `ADMIN`, `TEACHER` et `STUDENT`.

## Technologies utilisees

- Angular 19 standalone
- Angular Material
- Reactive Forms
- HttpClient
- Spring Boot
- Spring Security JWT
- Spring Data JPA
- H2 Database

## Architecture frontend

```text
edutrack-frontend/src/app/
  core/
    guards/
      auth.guard.ts
      role.guard.ts
    models/
      auth.model.ts
      category.model.ts
      course.model.ts
      dashboard.model.ts
      enrollment.model.ts
      user.model.ts
    services/
      auth.service.ts
      category.service.ts
      course.service.ts
      dashboard.service.ts
      enrollment.service.ts
      user.service.ts
  shared/
    components/
    material/
  layouts/
    main-layout/
  features/
    auth/
    courses/
    categories/
    users/
    enrollments/
    dashboards/
```

## Architecture backend

```text
edutrack-backend/src/main/java/com/edutrack/edutrack/
  config/
  controller/
  dto/
  entity/
  enums/
  exception/
  repository/
  security/
  service/
```

Entites metier conservees : `User`, `Category`, `Course`, `Enrollment`.
Tables techniques conservees pour l'authentification : `refresh_tokens`, `password_reset_tokens`.

## Fonctionnalites principales

- Authentification par email et mot de passe.
- Gestion des roles : `ADMIN`, `TEACHER`, `STUDENT`.
- Routes protegees avec `AuthGuard` et `RoleGuard`.
- CRUD complet sur `Course` : liste, detail, ajout, modification, suppression.
- Formulaires Angular ReactiveForms pour les cours.
- Relations visibles : `Course -> Category`, `Course -> Teacher`, `Enrollment -> Student + Course`.
- Gestion des categories, utilisateurs et inscriptions.
- Dashboards separes pour admin, enseignant et etudiant.

## Endpoints finaux

```text
POST   /api/auth/login
POST   /api/auth/register
POST   /api/auth/refresh
POST   /api/auth/logout
GET    /api/users
GET    /api/categories
POST   /api/categories
GET    /api/courses
GET    /api/courses/{id}
POST   /api/courses
PUT    /api/courses/{id}
DELETE /api/courses/{id}
GET    /api/enrollments
POST   /api/enrollments
PUT    /api/enrollments/{id}/progress
GET    /api/dashboard/admin
GET    /api/dashboard/teacher
GET    /api/dashboard/student
```

## Lancer le backend

```bash
cd edutrack-backend
.\mvnw.cmd spring-boot:run -Dspring-boot.run.arguments=--server.port=8081
```

API REST :

```text
http://localhost:8081/api
```

## Lancer le frontend

```bash
cd edutrack-frontend
npm install
npm run start
```

Application Angular :

```text
http://localhost:4200
```

## Build et tests

```bash
cd edutrack-frontend
npm run build
```

```bash
cd edutrack-backend
.\mvnw.cmd test
```

## Comptes de test

| Role | Email | Mot de passe |
| --- | --- | --- |
| Admin | admin@edutrack.com | Admin123 |
| Teacher 1 | teacher@edutrack.com | Teacher123 |
| Teacher 2 | teacher2@edutrack.com | Teacher123 |
| Student 1 | student@edutrack.com | Student123 |
| Student 2 | student2@edutrack.com | Student123 |
| Student 3 | student3@edutrack.com | Student123 |

## Routes Angular principales

```text
/login
/admin/dashboard
/teacher/dashboard
/student/dashboard
/courses
/courses/add
/courses/edit/:id
/courses/details/:id
/categories
/users
/enrollments
/profile
```

## Presentation courte

EduTrack respecte l'enonce Angular : architecture modulaire, composants separes, services REST, guards, gestion des roles, CRUD complet sur les cours, formulaires reactifs, relations entre modeles et dashboards riches. Le projet est centre uniquement sur la gestion de cours en ligne.
