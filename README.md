# EduTrack

[![CI](https://github.com/KhaledZouari/edutrack/actions/workflows/ci.yml/badge.svg)](https://github.com/KhaledZouari/edutrack/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-2ea44f.svg)](LICENSE)

A role-based online course management platform for administrators, instructors,
and students.

## Features

- JWT authentication and role-based authorization
- User, course, enrollment, and lesson management
- Dedicated workflows for administrators, instructors, and students
- Input validation and centralized API error handling
- Swagger/OpenAPI documentation

## Stack

| Layer | Technology |
| --- | --- |
| Frontend | Angular, TypeScript |
| Backend | Java 21, Spring Boot, Spring Security |
| Data | PostgreSQL, H2 for local development and tests |
| Quality | Maven, JUnit, Angular build checks, GitHub Actions |

## Architecture

The frontend separates feature modules, shared components, models, route
guards, and HTTP services. The backend separates controllers, DTOs, entities,
repositories, services, security, and exception handling.

## Local setup

Prerequisites: Java 21, Node.js 22, and npm.

```bash
git clone https://github.com/KhaledZouari/edutrack.git
cd edutrack/edutrack-frontend
npm ci
npm start
```

In a second terminal:

```bash
cd edutrack/edutrack-backend
./mvnw spring-boot:run
```

On Windows, use `.\mvnw.cmd`. The frontend runs at
`http://localhost:4200`; the API and Swagger UI run under
`http://localhost:8081/api`.

## Configuration

Copy the documented values from `edutrack-backend/.env.example`. Angular
environment files contain frontend configuration; never place private
credentials in browser-exposed variables.

## Verification

```bash
cd edutrack-backend && ./mvnw verify
cd ../edutrack-frontend && npm ci && npm run build
```

CI runs these checks on pushes and pull requests targeting `main`.

## License

Distributed under the MIT License. See [LICENSE](LICENSE).

