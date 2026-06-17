# Development Workflow

This project follows an iterative development process, beginning with interface prototyping in Figma, followed by backend development, frontend implementation, system integration, and testing. Git and GitHub are used for version control and collaborative development.

## Development Workflow

| Phase                             | Objective                                                                                                                   | Technology / Tools                             | Assigned Members              |
| :-------------------------------- | :-------------------------------------------------------------------------------------------------------------------------- | :--------------------------------------------- | :---------------------------- |
| **Planning & UI/UX Design**       | Define system requirements and design the user interface for both the learner mobile application and teacher web portal.    | Figma                                          | Ezra, Shekainah, Amber, Regie |
| **Application Layer Development** | Develop the backend application, including RESTful APIs, business logic, authentication, and integration with the database. | Spring Boot (Java 21), RESTful API, JWT, MySQL | Ezra, Regie                   |
| **Mobile Development**            | Develop the learner mobile application and connect it to the backend services through RESTful APIs.                         | React Native, JavaScript / TypeScript          | Shekainah, Ezra               |
| **Web Development**               | Develop the teacher web portal and integrate it with the backend services.                                                  | HTML5, CSS3, JavaScript, Bootstrap             | Amber, Ezra                   |
| **Integration & Testing**         | Integrate all system components, perform functional testing, resolve issues, and prepare the system for deployment.         | Git, GitHub, RESTful API                       | Ezra, Shekainah, Amber, Regie |

## Team Contributions

| Member                     | Primary Responsibility                                                               |
| :------------------------- | :----------------------------------------------------------------------------------- |
| **Ezra Depeña**            | Project Lead, System Architecture, Application Layer Development, System Integration |
| **Shekainah Sandy Aquino** | React Native Mobile Application Development                                          |
| **Amber Gwen Balboa**      | Teacher Web Application Development                                                  |
| **Regie**                  | Backend Support, Database Management, Testing                                        |

## Technology Stack

### Frontend

* **Mobile:** React Native (JavaScript / TypeScript)
* **Web:** HTML5, CSS3, JavaScript, Bootstrap

### Application Layer

* Spring Boot 3.x
* Java 21 (LTS)
* RESTful API
* JWT Authentication

### Database

* MySQL 8.x (Shared Database)

### Design & Collaboration

* Figma
* Git
* GitHub

## System Architecture

```text
                 Frontend
 ┌────────────────────────────────────────┐
 │ React Native (Learner Mobile App)      │
 │ HTML, CSS, JavaScript (Teacher Portal) │
 └──────────────────┬─────────────────────┘
                    │
              HTTPS / JSON
                    │
        RESTful API with JWT
                    │
 ┌──────────────────▼─────────────────────┐
 │        Spring Boot Application         │
 │ • Controllers                          │
 │ • Services                             │
 │ • Business Logic                       │
 │ • Authentication                       │
 │ • Adaptive Learning Engine             │
 └──────────────────┬─────────────────────┘
                    │
 ┌──────────────────▼─────────────────────┐
 │         MySQL Shared Database          │
 └────────────────────────────────────────┘
```
