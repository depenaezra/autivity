# Autivity: In-Session Adaptive Difficulty Engine & Scaffolding Flowchart

This document contains the standalone Mermaid flowchart and architecture breakdown for the **In-Session Adaptive Difficulty Loop** implemented in `components/set-manager.tsx`.

---

## 1. Mermaid Flowchart Code

```mermaid
flowchart TD
    A[Start Session] --> B{Historical Baseline?}
    B -- Prior 0 Mistakes --> C[Start at Difficulty Tier +1]
    B -- Prior 1 Mistake --> D[Start at Same Difficulty Tier]
    B -- Prior >= 2 Mistakes --> E[Start at Difficulty Tier -1]
    B -- No History --> F[Start at Lowest Tier]
    
    C & D & E & F --> G[Student Plays Activity 1]
    G --> H{Mistakes in Activity 1?}
    
    H -- 0 Mistakes --> I[Upshift Difficulty +1]
    H -- 1 Mistake --> J[Maintain Current Tier]
    H -- >= 2 Mistakes --> K[Bailout: Downgrade Tier -1]
    
    I & J & K --> L[Student Plays Activity 2]
    L --> M{Mistakes in Activity 2?}
    
    M -- 0 Mistakes --> N[Upshift Difficulty +1]
    M -- 1 Mistake --> O[Maintain Current Tier]
    M -- >= 2 Mistakes --> P[Bailout: Downgrade Tier -1]
    
    N & O & P --> Q[Student Plays Activity 3]
    Q --> R[Complete 3-Activity Set]
    R --> S[Grant 15 Stars + Confetti Celebration]
```

---

## 2. Key Defense Explanations for PowerPoint Slides

### Phase 1: Baseline Calibration (Pre-Session)
* Before Activity 1 launches, the system queries `getStudentHistoricalBaseline` from `src/services/sessions.ts`.
* Dynamically calibrates starting difficulty to match the learner's demonstrated mastery rather than forcing them through repetitive easy levels.

### Phase 2: Real-Time In-Session Adaptation (Between Activities)
* Evaluated dynamically in `handleCheckPress` in `components/set-manager.tsx`:
  * **0 Mistakes**: Upshifts tier by **+1** (promotes mastery & challenge).
  * **1 Mistake**: Maintains current tier (**0**) (provides reinforcement).
  * **$\ge 2$ Mistakes**: Triggers **Frustration Bailout (-1 Tier)**.

### Phase 3: The 2-Mistake Frustration Bailout (Clinical Rationale)
* Repeated negative feedback induces high anxiety and cortisol spikes in neurodivergent learners, causing autistic shutdown or meltdown.
* By actively downgrading difficulty upon detecting $\ge 2$ mistakes, Autivity guarantees the learner concludes their 3-activity learning set with success, earning their **15 stars** and maintaining motivation.
