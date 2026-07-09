# Development Workflow

This project follows an iterative Agile-inspired development process. Development begins with requirements gathering and UI/UX prototyping, followed by database design, backend development, tablet and web portal development, system integration, testing, and deployment. Git and GitHub are utilized for version control, collaborative development, and source code management.

---

## Development Workflow

```text
Requirements Gathering
          ↓
UI/UX Design and Prototyping
          ↓
Database Design
          ↓
Backend Development
          ↓
Teacher Tablet Portal Development
          ↓
Teacher Desktop Portal Development
          ↓
Parent Mobile Web Portal Development
          ↓
System Integration
          ↓
Testing and Quality Assurance
          ↓
Documentation
          ↓
Deployment
```

---

## Workflow Description

### 1. Requirements Gathering

The development process begins with gathering requirements from stakeholders, including SNED teachers, parents or guardians, and autism learning specialists. Functional and non-functional requirements are identified, analyzed, and documented to ensure that the system addresses the educational and developmental needs of learners with Autism Spectrum Disorder (ASD).

### 2. UI/UX Design and Prototyping

System interfaces are designed using Figma, including:

- Parent Monitoring Portal (Mobile Web)
- Teacher-Assisted Learning Portal (Tablet)
- Teacher Management Portal (Desktop)

Wireframes, user flows, mockups, and interactive prototypes are created prior to development to ensure usability and accessibility.

### 3. Database Design

The database structure is designed to support:

- Teacher Accounts
- Classes
- Learner Profiles
- Learning Activities
- Progress Records
- Feedback Records
- Learning Materials
- Reports and Analytics

Entity relationships, constraints, and normalization are established to ensure efficient data management and integrity.

### 4. Backend Development

The application layer is developed using Spring Boot and RESTful APIs.

Core modules include:

- Authentication Module
- Class Management Module
- Learner Management Module
- Activity Management Module
- Adaptive Learning Engine
- Feedback Management Module
- Progress Monitoring Module
- Reporting Module

These services handle business logic, data processing, and communication between all system portals.

### 5. Teacher Tablet Portal Development

The tablet portal is developed to support teacher-assisted learning sessions.

Major features include:

- Class Management
- Learner Profiles
- Activity Assignment
- Learning Activity Delivery
- Learner Personalization Settings
- Session Feedback

The portal serves as the primary platform used by teachers during instructional sessions with ASD learners.

### 6. Teacher Desktop Portal Development

The desktop portal is developed for administrative and monitoring functions.

Major features include:

- Dashboard
- Class Management
- Progress Validation
- Feedback Management
- Learning Material Management
- Report Generation

The portal provides teachers with advanced management and reporting capabilities.

### 7. Parent Mobile Web Portal Development

The parent portal is developed as a mobile-responsive website.

Major features include:

- Access Code Verification
- Progress Monitoring
- Activity Completion Tracking
- Teacher Feedback Viewing
- Development Summary Reports
- Session History Monitoring

Parents may access learner progress using a unique learner access code without requiring account registration.

### 8. System Integration

All portals, backend services, and the database are integrated into a unified system.

Integration includes:

- RESTful API Communication
- Shared Database Access
- Progress Synchronization
- Authentication Services

This phase ensures seamless communication among the tablet portal, desktop portal, parent portal, backend services, and database.

### 9. Testing and Quality Assurance

Testing activities include:

- Functional Testing
- Integration Testing
- User Acceptance Testing
- Usability Testing
- Performance Testing
- Bug Fixing and Validation

Testing ensures that all modules operate correctly and satisfy stakeholder requirements.

### 10. Documentation

Project documentation is finalized, including:

- Technical Documentation
- User Manuals
- System Diagrams
- Testing Reports
- Deployment Guides

All project deliverables are compiled and reviewed prior to deployment.

### 11. Deployment

The completed system is deployed to the selected hosting environment and prepared for implementation, evaluation, and demonstration.

---

## Overall Development Flow

```text
Planning
   ↓
UI/UX Design
   ↓
Database Design
   ↓
Backend Development
   ↓
Teacher Tablet Portal Development
   ↓
Teacher Desktop Portal Development
   ↓
Parent Mobile Web Portal Development
   ↓
System Integration
   ↓
Testing
   ↓
Documentation
   ↓
Deployment
```

---

## Development Workflow Table

| Phase | Objective | Technology / Tools | Assigned Members |
| :--- | :--- | :--- | :--- |
| **Planning & UI/UX Design** | Gather system requirements, design the overall user experience, create low-fidelity wireframes, high-fidelity prototypes, user flows, and design components for the Parent Monitoring Portal, Teacher-Assisted Learning Portal, and Teacher Management Portal. | Figma | Ezra, Shekainah, Amber, Regie |
| **Database Design** | Design the relational database schema, entity relationships, constraints, and data structures required for teacher accounts, classes, learner profiles, activities, progress tracking, feedback records, learning materials, and analytics. | MySQL Workbench, MySQL 8.x | Regie, Ezra |
| **Application Layer Development** | Develop the backend application including RESTful APIs, authentication, business logic, adaptive learning engine, activity management, feedback management, performance analytics, reporting services, and database integration. | Spring Boot 3.x, Java 21, RESTful API, JWT, MySQL | Ezra, Regie |
| **Teacher Tablet Portal Development** | Develop the teacher-assisted learning portal used during learning sessions, including class management, learner profiles, activity assignment, learner personalization settings, activity delivery, progress recording, and feedback submission. | React Native, JavaScript / TypeScript | Shekainah, Ezra |
| **Teacher Desktop Portal Development** | Develop the teacher management portal including dashboard management, class administration, progress validation, report generation, feedback management, learning material management, and performance monitoring. | HTML5, CSS3, JavaScript, Bootstrap | Amber, Ezra |
| **Parent Mobile Web Portal Development** | Develop the mobile-responsive parent portal that allows parents to monitor learner progress, completed activities, teacher feedback, developmental summaries, and session history through a unique learner access code. | HTML5, CSS3, JavaScript, Bootstrap | Amber, Ezra |
| **System Integration** | Connect the teacher tablet portal, teacher desktop portal, parent mobile web portal, backend services, adaptive learning engine, and database into a unified system. | RESTful API, Git, GitHub | Ezra, Shekainah, Amber, Regie |
| **Testing & Quality Assurance** | Perform functional testing, integration testing, usability testing, debugging, performance validation, and prepare the system for deployment. | GitHub, Postman, Browser DevTools, Android Emulator | Ezra, Shekainah, Amber, Regie |
| **Documentation & Deployment** | Finalize technical documentation, user manuals, diagrams, deployment configuration, and prepare the system for final presentation. | GitHub, Markdown, Figma | Ezra, Shekainah, Amber, Regie |

---

# Team Contributions

| Member | Primary Responsibility |
| :--- | :--- |
| **Ezra Depeña** | Project Lead, System Architecture, Backend Development, RESTful API Development, Teacher Portal Development Support, System Integration, Adaptive Learning Engine, Performance Analytics |
| **Shekainah Sandy Aquino** | Teacher Tablet Portal Development, Activity Integration, Learner Personalization Features, UI Implementation, Testing |
| **Amber Gwen Balboa** | Teacher Desktop Portal Development, Parent Mobile Web Portal Development, Dashboard Development, UI/UX Design, Testing |
| **Regie** | Database Design, Backend Support, API Support, Database Management, System Testing |

---

# Technology Stack

## Frontend

### Teacher Tablet Portal
- React Native
- JavaScript / TypeScript

### Teacher Desktop Portal
- HTML5
- CSS3
- JavaScript
- Bootstrap

### Parent Mobile Web Portal
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
 ┌───────────────────────────┐
 │ Parent Mobile Web Portal  │
 │      (Web Browser)        │
 └──────────────┬────────────┘
                │
                │ HTTPS / JSON
                │
 ┌──────────────▼────────────┐
 │ Teacher Desktop Portal    │
 │ HTML • CSS • JavaScript   │
 │        Bootstrap          │
 └──────────────┬────────────┘
                │
                │ HTTPS / JSON
                │
 ┌──────────────▼────────────┐
 │ Teacher Tablet Portal     │
 │       React Native        │
 └──────────────┬────────────┘
                │
                │ RESTful API with JWT Authentication
                │
 ┌──────────────▼─────────────────────────┐
 │      Spring Boot Application Layer     │
 │-----------------------------------------│
 │ • Authentication Module                │
 │ • Class Management                     │
 │ • Learner Management                   │
 │ • Activity Management                  │
 │ • Adaptive Learning Engine             │
 │ • Feedback Management                  │
 │ • Performance Analytics                │
 │ • Reporting Services                   │
 │ • RESTful API Controllers              │
 │ • Business Logic                       │
 └──────────────┬─────────────────────────┘
                │
                │
 ┌──────────────▼────────────┐
 │      MySQL Database       │
 │---------------------------│
 │ • Teacher Accounts        │
 │ • Classes                 │
 │ • Learner Profiles        │
 │ • Activities              │
 │ • Progress Records        │
 │ • Feedback Records        │
 │ • Learning Materials      │
 │ • Reports & Analytics     │
 └───────────────────────────┘
```