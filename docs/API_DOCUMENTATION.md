# API Documentation

This document outlines the RESTful API endpoints that will be utilized by AutiVity. These APIs support communication between the Parent Monitoring Portal, Teacher-Assisted Learning Portal, Teacher Management Portal, and the centralized backend system.

---

# Base URL

```text
https://api.autivity.com/api/v1
```

---

# Authentication Module

## Teacher Login

### Endpoint

```http
POST /auth/login
```

### Description

Authenticates teachers and generates a JWT access token.

### Request Body

```json
{
  "username": "teacher01",
  "password": "password123"
}
```

### Response

```json
{
  "token": "jwt_token",
  "teacherId": 1,
  "name": "Teacher Name"
}
```

---

## Teacher Logout

### Endpoint

```http
POST /auth/logout
```

### Description

Invalidates the active session.

---

# Parent Access Module

Parents do not create accounts.

They access learner information through a unique learner access code.

---

## Verify Learner Access Code

### Endpoint

```http
POST /parent/access
```

### Request Body

```json
{
  "accessCode": "AUTI-12345"
}
```

### Response

```json
{
  "learnerId": 1,
  "learnerName": "Josh"
}
```

---

## Retrieve Parent Dashboard

### Endpoint

```http
GET /parent/dashboard/{learnerId}
```

### Description

Retrieves learner progress information visible to parents.

### Response

```json
{
  "learnerName": "Josh",
  "progress": {},
  "feedback": [],
  "sessions": []
}
```

---

# Teacher Management Module

## Retrieve Teacher Dashboard

### Endpoint

```http
GET /teacher/dashboard
```

### Description

Loads teacher dashboard statistics.

---

## Retrieve Teacher Profile

### Endpoint

```http
GET /teacher/profile
```

---

## Update Teacher Profile

### Endpoint

```http
PUT /teacher/profile
```

---

# Class Management Module

## Create Class

### Endpoint

```http
POST /classes
```

### Request Body

```json
{
  "className": "Autism Readiness A",
  "description": "Morning Class",
  "schedule": "Monday-Friday 9:00 AM"
}
```

---

## Retrieve All Classes

### Endpoint

```http
GET /classes
```

---

## Retrieve Class Details

### Endpoint

```http
GET /classes/{classId}
```

---

## Update Class

### Endpoint

```http
PUT /classes/{classId}
```

---

## Archive Class

### Endpoint

```http
DELETE /classes/{classId}
```

---

# Learner Management Module

## Add Learner

### Endpoint

```http
POST /learners
```

### Request Body

```json
{
  "nickname": "Josh",
  "classId": 1,
  "age": 8
}
```

---

## Retrieve Learners

### Endpoint

```http
GET /learners
```

---

## Retrieve Learner Profile

### Endpoint

```http
GET /learners/{learnerId}
```

---

## Update Learner Profile

### Endpoint

```http
PUT /learners/{learnerId}
```

---

## Delete Learner

### Endpoint

```http
DELETE /learners/{learnerId}
```

---

# Learner Personalization Module

## Retrieve Learner Settings

### Endpoint

```http
GET /learners/{learnerId}/settings
```

---

## Save Learner Settings

### Endpoint

```http
PUT /learners/{learnerId}/settings
```

### Request Body

```json
{
  "brightness": 70,
  "colorScheme": "Pastel",
  "volume": 60,
  "language": "English",
  "sessionDuration": 30
}
```

---

# Activity Management Module

## Retrieve Available Activities

### Endpoint

```http
GET /activities
```

---

## Assign Activity

### Endpoint

```http
POST /learners/{learnerId}/activities
```

---

## Assign All Activities

### Endpoint

```http
POST /learners/{learnerId}/activities/all
```

---

## Remove Assigned Activity

### Endpoint

```http
DELETE /learners/{learnerId}/activities/{activityId}
```

---

## Retrieve Assigned Activities

### Endpoint

```http
GET /learners/{learnerId}/activities
```

---

# Learning Session Module

## Start Learning Session

### Endpoint

```http
POST /sessions/start
```

### Request Body

```json
{
  "learnerId": 1,
  "activityId": 2
}
```

---

## Save Activity Response

### Endpoint

```http
POST /sessions/response
```

### Request Body

```json
{
  "sessionId": 1,
  "questionId": 1,
  "answer": "A",
  "responseTime": 3.2
}
```

---

## Complete Session

### Endpoint

```http
POST /sessions/complete
```

---

# Adaptive Learning Engine Module

## Analyze Learner Performance

### Endpoint

```http
POST /adaptive/analyze
```

### Inputs

- Previous Scores
- Response Time
- Mistakes
- Completed Activities

### Output

```json
{
  "masteryLevel": "Intermediate",
  "nextActivity": "Pre-Writing Level 2",
  "difficulty": "Increased"
}
```

---

## Retrieve Recommended Activity

### Endpoint

```http
GET /adaptive/recommendation/{learnerId}
```

---

# Progress Monitoring Module

## Save Learner Progress

### Endpoint

```http
POST /progress
```

---

## Retrieve Learner Progress

### Endpoint

```http
GET /progress/{learnerId}
```

---

## Retrieve Progress Analytics

### Endpoint

```http
GET /progress/analytics/{learnerId}
```

---

# Feedback Management Module

## Submit Feedback

### Endpoint

```http
POST /feedback
```

### Request Body

```json
{
  "learnerId": 1,
  "feedback": "Good improvement in tracing skills."
}
```

---

## Save Pending Feedback

### Endpoint

```http
POST /feedback/pending
```

---

## Retrieve Pending Feedback

### Endpoint

```http
GET /feedback/pending
```

---

## Update Feedback

### Endpoint

```http
PUT /feedback/{feedbackId}
```

---

# Learning Materials Module

## Upload Learning Material

### Endpoint

```http
POST /materials
```

---

## Retrieve Learning Materials

### Endpoint

```http
GET /materials
```

---

## Assign Material to Class

### Endpoint

```http
POST /materials/assign
```

---

## Delete Material

### Endpoint

```http
DELETE /materials/{materialId}
```

---

# Report Generation Module

## Generate Learner Report

### Endpoint

```http
GET /reports/learner/{learnerId}
```

---

## Generate Class Report

### Endpoint

```http
GET /reports/class/{classId}
```

---

## Generate Development Summary

### Endpoint

```http
GET /reports/development/{learnerId}
```

---

# Progress Validation Module

Only finalized progress records become visible to parents.

---

## Retrieve Unvalidated Progress

### Endpoint

```http
GET /validation/pending
```

---

## Validate Progress Record

### Endpoint

```http
PUT /validation/{progressId}
```

---

## Publish Progress to Parent Portal

### Endpoint

```http
POST /validation/publish/{progressId}
```

---

# Dashboard Analytics Module

## Teacher Dashboard Statistics

### Endpoint

```http
GET /dashboard/statistics
```

### Returns

- Total Classes
- Total Learners
- Completed Sessions
- Pending Feedback
- Activity Completion Rate

---

## Class Analytics

### Endpoint

```http
GET /dashboard/class/{classId}
```

---

## Learner Analytics

### Endpoint

```http
GET /dashboard/learner/{learnerId}
```

---

# File Storage Module

## Upload Image

### Endpoint

```http
POST /files/images
```

---

## Upload Learning Resource

### Endpoint

```http
POST /files/resources
```

---

## Retrieve File

### Endpoint

```http
GET /files/{fileId}
```

---

# API Security

The system uses:

- JWT Authentication
- Role-Based Access Control (RBAC)
- HTTPS Communication
- Secure Password Hashing
- Input Validation
- Audit Logging

---

# Supported Devices

| Portal | Device |
|----------|----------|
| Parent Monitoring Portal | Mobile Phone |
| Teacher-Assisted Learning Portal | Tablet |
| Teacher Management Portal | Laptop/Desktop |
