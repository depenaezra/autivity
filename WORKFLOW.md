# Development Workflow

This project follows an iterative Agile-inspired development process. Development begins with planning and UI/UX prototyping, followed by application layer development, frontend implementation for both mobile and web platforms, system integration, testing, and deployment. Git and GitHub are utilized for version control, collaborative development, and source code management.

---

## Development Workflow

| Phase | Objective | Technology / Tools | Assigned Members |
| :--- | :--- | :--- | :--- |
| **Planning & UI/UX Design** | Gather system requirements, design the overall user experience, create low-fidelity wireframes, high-fidelity prototypes, user flows, and design components for both the learner mobile application and teacher/parent web portal. | Figma | Ezra, Shekainah, Amber, Regie |
| **Database Design** | Design the relational database schema, entity relationships, constraints, and data structures required for learner information, activities, progress tracking, assessments, and analytics. | MySQL Workbench, MySQL 8.x | Regie, Ezra |
| **Application Layer Development** | Develop the backend application including RESTful APIs, authentication, business logic, adaptive learning engine, activity management, performance analytics, and database integration. | Spring Boot 3.x, Java 21, RESTful API, JWT, MySQL | Ezra, Regie |
| **Mobile Development** | Develop the learner mobile application, implement adaptive learning activities, authentication, profile management, session control, and integrate all backend services. | React Native, JavaScript / TypeScript | Shekainah, Ezra |
| **Web Development** | Develop the teacher and parent web portal including learner monitoring dashboards, activity management, reports, analytics, and administrative functions. | HTML5, CSS3, JavaScript, Bootstrap | Amber, Ezra |
| **System Integration** | Connect the mobile application, web portal, backend services, adaptive learning engine, and database into a unified system. | RESTful API, Git, GitHub | Ezra, Shekainah, Amber, Regie |
| **Testing & Quality Assurance** | Perform functional testing, integration testing, usability testing, debugging, performance validation, and prepare the system for deployment. | GitHub, Postman, Browser DevTools, Android Emulator | Ezra, Shekainah, Amber, Regie |
| **Documentation & Deployment** | Finalize technical documentation, user manuals, diagrams, deployment configuration, and prepare the system for final presentation. | GitHub, Markdown, Figma | Ezra, Shekainah, Amber, Regie |

---

# Team Contributions

| Member | Primary Responsibility |
| :--- | :--- |
| **Ezra Depeña** | Project Lead, System Architecture, Backend Development, RESTful API Development, Mobile Development Support, Teacher Web Portal Development, System Integration, Performance Analytics |
| **Shekainah Sandy Aquino** | Learner Mobile Application Development, Activity Integration, UI Implementation, Testing |
| **Amber Gwen Balboa** | Teacher & Parent Web Portal Development, Dashboard Development, UI/UX Design, Testing |
| **Regie** | Database Design, Backend Support, API Support, Database Management, System Testing |

---

# Technology Stack

## Frontend

### Learner Mobile Application
- React Native
- JavaScript / TypeScript

### Teacher & Parent Web Portal
- HTML5
- CSS3
- JavaScript
- Bootstrap

---

## Application Layer

- Spring Boot 3.x
- Java 21 (LTS)
- RESTful API
- JWT Authentication

---

## Database

- MySQL 8.x
- Shared Relational Database

---

## Design & Collaboration

- Figma
- Git
- GitHub
- Postman

---

# System Architecture

```text
                    ┌────────────────────────────────────┐
                    │        Learner Mobile App          │
                    │         React Native               │
                    └────────────────────────────────────┘
                                 │
                                 │
                                 │ HTTPS / JSON
                                 │
                    ┌────────────────────────────────────┐
                    │     Teacher & Parent Web Portal    │
                    │ HTML • CSS • JavaScript • Bootstrap│
                    └────────────────────────────────────┘
                                 │
                                 │
                      RESTful API with JWT Authentication
                                 │
          ┌──────────────────────▼────────────────────────┐
          │          Spring Boot Application Layer        │
          │-----------------------------------------------│
          │ • Authentication Module                       │
          │ • Learner Management                          │
          │ • Activity Management                         │
          │ • Adaptive Learning Engine                    │
          │ • Performance Analytics                       │
          │ • Dashboard Services                          │
          │ • RESTful API Controllers                     │
          │ • Business Logic                              │
          └──────────────────────┬────────────────────────┘
                                 │
                                 │
                    ┌────────────▼────────────┐
                    │     MySQL Database      │
                    │-------------------------│
                    │ • Users                │
                    │ • Learner Profiles     │
                    │ • Activities           │
                    │ • Progress Records     │
                    │ • Assessments          │
                    │ • Analytics            │
                    └────────────────────────┘
```
