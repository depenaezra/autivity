# AutiVity System Assembly Line

## Overview

The Assembly Line illustrates the complete operational workflow of **AutiVity: An AI-Assisted Adaptive Developmental Learning System for Learners with Autism Spectrum Disorder (ASD)**. It demonstrates how data and processes move throughout the system—from user authentication to adaptive learning, performance monitoring, and dashboard reporting.

---

# Assembly Line Workflow

```text
START
   │
   ▼
User Opens AutiVity
   │
   ▼
Login
   │
   ▼
Authenticate Credentials
   │
   ├── Invalid Credentials
   │       │
   │       ▼
   │   Display Error Message
   │       │
   │       └───────────────┐
   │                       │
   ▼                       │
Valid Login                │
   │                       │
   ▼                       │
Determine User Role        │
(Learner / Teacher / Parent)
   │
   ├─────────────────────────────┐
   │                             │
   ▼                             ▼
Learner                  Teacher / Parent
   │                             │
   ▼                             ▼
Load Learner Profile     Open Dashboard
   │                             │
   ▼                             ▼
Retrieve Existing Assessment Data
   │
   ▼
Load Previous Learning Progress
   │
   ▼
AI Rule-Based Recommendation Engine
   │
   ▼
Recommend Learning Activity
   │
   ▼
Start Learning Session
   │
   ▼
Complete Activity
   │
   ▼
Record:
• Score
• Response Time
• Attempts
• Completion Status
   │
   ▼
Analyze Performance
   │
   ├── High Performance
   │       ▼
   │  Increase Difficulty
   │
   ├── Average Performance
   │       ▼
   │  Continue Current Level
   │
   └── Low Performance
           ▼
     Recommend Easier Activity
           │
           ▼
Provide Immediate Feedback
   │
   ▼
Award Stars / Badges
   │
   ▼
Save Learning Progress
   │
   ▼
Update Database
   │
   ▼
Generate Performance Analytics
   │
   ▼
Update Parent & Teacher Dashboard
   │
   ▼
Logout
   │
   ▼
END
```

---

# Process Description

## 1. User Login
The user enters their credentials. The system validates the username and password before granting access.

## 2. Role Identification
After successful authentication, the system determines whether the user is a Learner, Teacher, or Parent.

## 3. Learner Initialization
For learner accounts, the system retrieves the learner profile, existing assessment results entered by the teacher, preferences, and previous learning records.

## 4. AI Rule-Based Recommendation
The adaptive engine analyzes previous performance, response time, mistakes, and completed activities to recommend the most appropriate learning activity.

## 5. Learning Session
The learner completes structured developmental activities such as:
- Attention Tasks
- Emotion Recognition
- Fine Motor Activities
- Pre-Academic Skills

## 6. Performance Analysis
After each activity, the system evaluates:
- Activity Score
- Response Time
- Number of Attempts
- Completion Status

## 7. Adaptive Difficulty
Based on learner performance:
- High-performing learners advance to a higher difficulty level.
- Average-performing learners continue at the current level.
- Learners needing support receive easier or repeated activities.

## 8. Feedback and Rewards
The system immediately provides positive reinforcement through encouraging messages, stars, badges, and progress indicators.

## 9. Performance Recording
Learning data is stored in the database, including scores, response times, completed activities, and learner progress.

## 10. Dashboard Monitoring
Teachers and parents can monitor:
- Learner Progress
- Activity Completion
- Performance Trends
- Strengths and Weaknesses
- AI Recommendations

## 11. Logout
The user ends the session securely, completing the workflow.

---

# Inputs

- Username and Password
- Existing Learner Assessment
- Previous Learning Progress
- Activity Responses
- Response Time
- User Interactions

---

# System Processes

- User Authentication
- Learner Profile Retrieval
- AI Rule-Based Recommendation
- Activity Delivery
- Performance Evaluation
- Adaptive Difficulty Adjustment
- Progress Recording
- Dashboard Analytics

---

# Outputs

- Personalized Learning Activities
- Adaptive Difficulty Recommendations
- Performance Scores
- Progress Reports
- Teacher Dashboard
- Parent Dashboard
- Learning Analytics
- Rewards and Feedback
