# Main and Sub Process

This document outlines the overall workflow of **AutiVity**, describing how each system module interacts to provide an adaptive learning experience for learners with Autism Spectrum Disorder (ASD).

---

# Main Process

The main process represents the end-to-end workflow of the system from user authentication to progress monitoring.

```text
User Login
    ↓
User Authentication
    ↓
Role Selection
    ↓
Learner Profile Retrieval
    ↓
AI-Based Activity Recommendation
    ↓
Learning Session
    ↓
Activity Assessment
    ↓
Adaptive Difficulty Adjustment
    ↓
Performance Recording
    ↓
Teacher / Parent Dashboard
    ↓
Logout
```

---

# Sub Processes

## A. User Login

**Objective:** Authenticate users and grant access based on their assigned roles.

### Workflow

```text
Enter Username & Password
        ↓
Validate Credentials
        ↓
Authentication Successful?
      ↙             ↘
    No               Yes
    ↓                 ↓
Display Error   Redirect to User Dashboard
```

---

## B. Learner Initialization

**Objective:** Prepare learner-specific information before starting a learning session.

### Workflow

```text
Retrieve Learner Profile
        ↓
Retrieve Developmental Assessment
        ↓
Load Learner Preferences
        ↓
Load Previous Progress
        ↓
Initialize Learning Session
```

---

## C. Adaptive Learning Engine

**Objective:** Recommend personalized learning activities based on learner performance.

### Inputs

- Previous Scores
- Response Time
- Mistakes
- Completed Activities

### Process

```text
Analyze Learner Performance
        ↓
Determine Mastery Level
      ↙             ↘
Mastered?          Not Yet
    ↓                 ↓
Increase Difficulty  Repeat / Reinforce Activity
        ↓
Recommend Next Activity
```

### Output

- Personalized Learning Path
- Recommended Activity
- Updated Difficulty Level

---

## D. Learning Activity

**Objective:** Deliver interactive developmental activities and evaluate learner responses.

### Workflow

```text
Display Instructions
        ↓
Display Activity
        ↓
Record Learner Answers
        ↓
Measure Response Time
        ↓
Provide Immediate Feedback
        ↓
Award Stars / Badges
```

---

## E. Performance Monitoring

**Objective:** Store learner performance for progress tracking and analytics.

### Workflow

```text
Save Activity Score
        ↓
Save Completion Rate
        ↓
Save Session Duration
        ↓
Save Response Time
        ↓
Generate Progress Charts
```

---

## F. Parent / Teacher Dashboard

**Objective:** Allow teachers and parents to monitor learner performance.

### Features

- View Learner Progress
- View Strengths
- View Areas for Improvement
- View Recommended Activities
- Export Progress Reports

---

# UI/UX Prototyping

The following interfaces will be designed in **Figma** before development begins.

## Learner Mobile Application

- Login Screen
- Learner Dashboard
- Activity Selection
- Attention Activity
- Matching Activity
- Emotion Recognition Activity
- Fine Motor Activity
- Rewards Screen
- Progress Screen

## Teacher Web Portal

- Login Screen
- Teacher Dashboard
- Learner Monitoring
- Progress Reports
- Performance Analytics

## Parent Web Portal

- Login Screen
- Parent Dashboard
- Learner Progress
- Activity Recommendations
- Progress Reports

---

# Technologies

| Component | Technology |
| :--- | :--- |
| Mobile Application | React Native (JavaScript / TypeScript) |
| Web Application | HTML5, CSS3, JavaScript, Bootstrap |
| Application Layer | Spring Boot (Java 21), RESTful API, JWT Authentication |
| Database | MySQL 8.x |
| UI/UX Design | Figma |
| Version Control | Git & GitHub |
