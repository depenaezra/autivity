# Main and Sub Processes

This document outlines the overall workflow of **AutiVity**, an AI-Assisted Adaptive Developmental Learning System for Learners with Autism Spectrum Disorder (ASD). The system utilizes three device-specific portals to separate instructional delivery, administrative management, and parent monitoring while maintaining a centralized learner progress database.

---

# System Workflow Overview

AutiVity utilizes three devices with different user perspectives and functions:

- **Mobile Phone** – Parent Monitoring Portal
- **Tablet** – Teacher-Assisted Learning Portal
- **Laptop/Desktop** – Teacher Management Portal

The system separates monitoring functions, learning delivery, and administrative management to ensure that each platform serves a specific purpose.

---

# Main Process

The main process represents the end-to-end workflow of the system from teacher preparation to parent progress monitoring.

```text
Teacher Login
       ↓
Create / Manage Classes
       ↓
Add Learners
       ↓
Assign Activities
       ↓
Configure Learner Settings
       ↓
Conduct Learning Session
       ↓
Activity Assessment
       ↓
Adaptive Difficulty Adjustment
       ↓
Performance Recording
       ↓
Teacher Feedback Submission
       ↓
Progress Validation
       ↓
Parent Progress Monitoring
```

---

# Workflow

## Overall System Workflow

```text
Teacher (Desktop)
       ↓
Create Class
       ↓
Add Learners
       ↓
Assign Activities
       ↓
Configure Learner Settings
       ↓
Conduct Learning Session (Tablet)
       ↓
Learner Completes Activity
       ↓
Teacher Provides Feedback
       ↓
Progress Recorded
       ↓
Teacher Reviews and Finalizes Progress
       ↓
Parent Views Progress
      (Mobile Portal)
```

---

## Parent Monitoring Portal Workflow (Mobile Phone)

```text
Open Browser
      ↓
Access Parent Portal
      ↓
Enter Learner Access Code
      ↓
Verification
      ↓
Access Granted?
    ↙          ↘
  No            Yes
  ↓              ↓
Display Error    Learner Progress Dashboard
                     ↓
      • Progress Reports
      • Activity Completion
      • Teacher Feedback
      • Development Summary
      • Session History
```

---

## Teacher-Assisted Learning Workflow (Tablet)

```text
Teacher Login
      ↓
Teacher Dashboard
      ↓
Select Class
      ↓
Select Learner
      ↓
Open Learner Profile
      ↓
Assign / Manage Activities
      ↓
Configure Learner Settings
      ↓
Start Learning Activity
      ↓
Learner Completes Activity
      ↓
Activity Assessment
      ↓
Save Performance Data
      ↓
Provide Feedback
      ↓
Session Completed
```

---

## Teacher Management Workflow (Desktop)

```text
Teacher Login
      ↓
Management Dashboard
      ↓
Manage Classes
      ↓
Manage Learners
      ↓
Manage Learning Materials
      ↓
Review Activity Results
      ↓
Validate Progress Records
      ↓
Finalize Reports
      ↓
Publish Progress
      ↓
Parent Portal Updated
```

---

# Sub Processes

## A. Parent Monitoring Portal

### Objective

Allow parents or guardians to monitor learner progress through a mobile-responsive web portal without requiring account registration.

### Main Functions

- Enter learner access code
- View learner progress
- Monitor completed activities
- View skill development reports
- Read teacher feedback and observations
- View recent learning sessions

### Workflow

```text
Receive Access Code
        ↓
Open Parent Portal
        ↓
Enter Access Code
        ↓
Verify Access Code
        ↓
Retrieve Learner Records
        ↓
Display Progress Dashboard
```

### Output

- Learner Progress Reports
- Activity Completion Status
- Teacher Feedback
- Development Summary

---

## B. Teacher Authentication

### Objective

Authenticate teachers and grant access to tablet and desktop portals.

### Workflow

```text
Enter Username and Password
           ↓
Validate Credentials
           ↓
Authentication Successful?
        ↙          ↘
      No            Yes
      ↓              ↓
Display Error    Open Dashboard
```

### Output

- Teacher Dashboard Access

---

## C. Class Management

### Objective

Allow teachers to create and manage classes.

### Functions

- Create Classes
- Edit Classes
- Add Class Descriptions
- Assign Schedules
- Archive Classes

### Workflow

```text
Create / Select Class
           ↓
Add Class Information
           ↓
Assign Schedule
           ↓
Add Learners
           ↓
Save Class
```

### Output

- Organized Class Records
- Updated Learner Lists

---

## D. Learner Profile Management

### Objective

Manage learner information and assigned developmental activities.

### Functions

- Assign Activities
- Remove Activities
- Assign Activities Individually
- Assign All Activities
- Monitor Activity Completion
- View Performance Records

### Workflow

```text
Select Class
      ↓
Select Learner
      ↓
Open Learner Profile
      ↓
Manage Activities
      ↓
Save Changes
```

### Output

- Learner Activity Plan
- Updated Learner Profile

---

## E. Learner Personalization Settings

### Objective

Customize learning activities according to the sensory and developmental needs of each learner.

### Visual Settings

- Brightness Adjustment
- Color Theme Selection
- Visual Complexity Control

Examples:

- Monochrome Mode
- Pastel Color Mode
- Primary Color Mode
- High Contrast Mode

### Audio Settings

- Sound Effects Volume
- Background Music Volume
- Voice Instruction Volume

### Language Settings

- English
- Filipino (Tagalog)

### Session Settings

- Activity Duration
- Break Intervals
- Session Scheduling

### Instruction Settings

- Verbal Instructions
- Visual Prompts
- Personalized Reminders

### Workflow

```text
Open Learner Settings
          ↓
Configure Visual Settings
          ↓
Configure Audio Settings
          ↓
Select Language
          ↓
Configure Session Preferences
          ↓
Save Settings
```

### Output

- Personalized Learning Environment
- Saved Learner Preferences

---

## F. Adaptive Learning Activity Module

### Objective

Deliver developmental activities that progressively increase in difficulty according to learner performance.

### Activity Categories

#### Pre-Writing Activities

- Line Tracing
- Shape Tracing
- Letter Tracing

#### Fine Motor Activities

- Drag-and-Drop Exercises
- Matching Activities

#### Emotional Recognition Activities

- Emotion Identification
- Emotion Matching

#### Attention Activities

- Focus Activities
- Sequencing Activities

### Workflow

```text
Start Activity
       ↓
Display Instructions
       ↓
Learner Interaction
       ↓
Record Responses
       ↓
Measure Response Time
       ↓
Evaluate Performance
       ↓
Provide Immediate Reinforcement
       ↓
Award Rewards
```

### Adaptive Difficulty Process

#### Inputs

- Previous Scores
- Response Time
- Mistakes
- Completed Activities

#### Process

```text
Analyze Learner Performance
        ↓
Determine Mastery Level
      ↙             ↘
Mastered?          Not Yet
    ↓                 ↓
Increase Difficulty  Reinforce Current Activity
        ↓
Recommend Next Activity
```

### Output

- Personalized Learning Path
- Recommended Activity
- Updated Difficulty Level

### Example Difficulty Progression

```text
Pre-Writing Level 1
         ↓
Pre-Writing Level 2
         ↓
Letter Formation
         ↓
Word Writing
```

### Learning Experience Features

- Friendly Animated Characters
- Reward Stickers
- Positive Reinforcement
- Child-Friendly Interface
- Sensory-Friendly Design
- Visual Rewards

---

## G. Feedback Management

### Objective

Allow teachers to record observations and recommendations after learner sessions.

### Workflow

```text
Activity Completed
        ↓
Provide Feedback?
     ↙         ↘
Immediate      Later
    ↓            ↓
Save Feedback   Add to Pending Queue
```

### Functions

- Immediate Feedback Submission
- Pending Feedback Queue
- Edit Feedback
- Complete Feedback Later

### Output

- Teacher Observations
- Session Feedback Records

---

## H. Performance Monitoring

### Objective

Store learner performance information for progress tracking and analytics.

### Workflow

```text
Save Activity Results
         ↓
Save Completion Rate
         ↓
Save Session Duration
         ↓
Save Response Time
         ↓
Update Learner Progress
         ↓
Generate Progress Analytics
```

### Recorded Data

- Activity Scores
- Completion Rates
- Session Duration
- Response Times
- Development Metrics

### Output

- Progress Records
- Performance Analytics
- Progress Charts

---

## I. Progress Validation and Reporting

### Objective

Allow teachers to review and finalize learner progress before making it visible to parents.

### Functions

- Review Learner Progress
- Update Activity Results
- Validate Session Records
- Finalize Reports
- Generate Reports

### Workflow

```text
Review Progress Records
          ↓
Validate Results
          ↓
Update Feedback
          ↓
Finalize Report
          ↓
Publish to Parent Portal
```

### Report Types

- Individual Learner Reports
- Class Performance Reports
- Progress Summaries
- Development Tracking Reports

### Output

- Finalized Progress Reports
- Parent-Accessible Progress Data

---

# UI/UX Prototyping

The following interfaces will be designed in **Figma** before development begins.

## Parent Monitoring Portal (Mobile Web)

- Parent Portal Landing Page
- Access Code Verification Page
- Learner Progress Dashboard
- Development Summary
- Teacher Feedback View
- Session History View

---

## Teacher-Assisted Learning Portal (Tablet)

- Login Screen
- Teacher Dashboard
- Class Management
- Student List View
- Learner Profile
- Activity Management
- Learning Activity Screens
- Learner Personalization Settings
- Session Feedback Interface

---

## Teacher Management Portal (Desktop)

- Login Screen
- Dashboard
- Class Management
- Student Management
- Learning Material Management
- Progress Monitoring
- Pending Feedback Management
- Report Generation
- Teacher Profile and Settings

---

# Technologies

| Component | Technology |
| :--- | :--- |
| Teacher Tablet Portal | React Native (JavaScript / TypeScript) |
| Teacher Desktop Portal | HTML5, CSS3, JavaScript, Bootstrap |
| Parent Mobile Web Portal | HTML5, CSS3, JavaScript, Bootstrap |
| Application Layer | Spring Boot (Java 21), RESTful API, JWT Authentication |
| Database | MySQL 8.x |
| UI/UX Design | Figma |
| Version Control | Git & GitHub |