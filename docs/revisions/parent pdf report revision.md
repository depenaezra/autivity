# Parent PDF Report Revision & Implementation Plan

> **Document Name:** Parent PDF Report Revision  
> **Location:** `c:\Projects\Capstone\autivity\docs\revisions\parent pdf report revision.md`  
> **Target Audience:** Parents & Guardians of Neurodiverse Learners, SPED Teachers, Case Managers  
> **Status:** Proposed Implementation Plan  
> **Date:** November 19, 2026  

---

## 1. Executive Summary

This document outlines the complete revision plan for the **Child Learning Journey & Progress Report (Parent PDF Export)** in the Autivity application.

Currently, the parent report export in [`src/services/exportReport.ts`](file:///c:/Projects/Capstone/autivity/src/services/exportReport.ts#L541-L749) replicates the teacher-oriented card dump: it prints disconnected metric boxes and loops through every session by printing **identical 5-row rubric criteria tables** (`Looking at Objects`, `Concentrating`, `Performing Task`, `Following Instructions`, `Completed Work`). This format is clinical, dense, repetitive, and fails to give parents the warm, affirming, and actionable insights they need.

The updated **Parent PDF Report** transforms this into an empowering, beautifully structured **2-page family progress bulletin** that:
1. **Celebrates child growth** with a warm narrative, encouraging badges, and plain-English summaries.
2. **Preserves the visual graphs** parents love (Learning Score Over Time with a 14-day outlook + Skills Practiced exposure bars), labeled in simple everyday terms.
3. **Replaces repetitive rubric boxes** with a **Merged Activity & Teacher Notes Log Table**, pairing the chronological session list with the teacher's personal observations.
4. **Features an evidence-based "At-Home Practice" section** derived from the child’s lowest-scoring domain, active IEP milestones, and emotional check-in trends.
5. **Introduces a smart Timeframe Export Dialog** with quick presets (*Today, This Week, This Month, All Time*) and a **custom start/end date picker** so that reports reflect any selected date window.
6. **Maintains balanced 2-page pagination** with zero awkward gaps or whitespace.

---

## 2. Summary of Changes in the Parent Prototype

The working prototype generated in `docs/` ([`sample-parent-analytics-report.pdf`](file:///c:/Projects/Capstone/autivity/docs/sample-parent-analytics-report.pdf) and [`sample-parent-analytics-report.html`](file:///c:/Projects/Capstone/autivity/docs/sample-parent-analytics-report.html)) established the following improvements:

| Section | Old App Parent Export | New Parent Report Revision | Parent Value / Clinical Purpose |
| :--- | :--- | :--- | :--- |
| **Document Tone** | Clinical & diagnostic (like a medical chart) | **Warm, celebratory, affirming** (*"Child Learning Journey"*) | Reduces parental anxiety; highlights strengths and daily wins |
| **Progress Narrative** | Disconnected growth/focus pills | **"Celebrating Liam's Progress this Month!"** (cohesive paragraph) | Easy-to-read overview without needing to decode charts |
| **Key Highlights** | Dense accuracy percentages and seconds | **4 Family-Friendly Badges:**<br>• *86.4% Mastery (Great Job! ⭐)*<br>• *68% Did It On His Own 🚀*<br>• *~7 mins Focus Time ⏱️*<br>• *24 Activities Completed 🏆* | Immediate snapshot of effort, attention span, and independence |
| **Score Trend Chart** | SVG line chart with "3.2 Benchmark Tier" label | Same SVG line chart, labeled **"Goal Line"** + *"▲ +34% Improvement!"* and a positive 2-week outlook | Visual proof of progress over time |
| **Skills Practiced Chart** | Technical domain names (*Cognitive Domain*, *Adaptive*) | Friendly categories with icons:<br>• 🧩 *Thinking & Sorting Skills*<br>• 🖐️ *Hands & Movement Skills*<br>• 💬 *Sharing & Communication*<br>• 🧘 *Calming & Daily Routines* | Parents immediately understand what their child actually did |
| **Feelings & Emotions** | Raw zone counts and hint formulas | **"How Liam Felt During Daily Check-Ins"**:<br>• 🟢 *Calm & Happy (13 days — Optimal)*<br>• 🟡 *Energetic (4 days — Calming toy helped)*<br>• 🔵 *Tired (3 days — Kept tasks shorter)* | Helps parents understand how mood impacts school learning |
| **Teacher Notes & Sessions** | **Endless repeating 5-criteria rubric cards** for each feedback item | **Merged Activity & Teacher Notes Table**:<br>Chronological table showing Date, Activity, Source (`Class` vs `App`), Result (`⭐⭐⭐⭐ Mastered`), and inline Teacher Remark | Parents see the exact activity list AND the teacher's personal comment in one scannable table |
| **Home Practice** | Generic recommendation text | **"🏡 Fun Activities to Try Together at Home"** (3 concrete, everyday play ideas) | Practical activities parents can easily weave into daily life |
| **Footer** | Generic timestamp | **Warm Partnership Sign-Off** (*"Prepared with care for Elena Garcia & Liam — Thank you for being our partner in learning! 💙"*) | Strengthens school-family collaborative trust |

---

## 3. Key Design Decisions & Core Requirements

### A. The Merged Activity & Teacher Notes Table
* **The Problem:** Parents want to see the list of activities their child completed, but they also want to read the teacher's personal notes. Having separate quote cards and a separate session table bloats the document onto 3 or 4 pages.
* **The Solution:** A unified, clean table on Page 2:
  * Columns:
    1. **Date** (`Nov 19`, `Nov 18`, `Nov 17`, etc.)
    2. **Activity & Domain** (e.g. *Turn-Taking Circle Game — Sharing & Social*)
    3. **Where** (Badge: `🏫 CLASS` or `📱 APP`)
    4. **Result** (Friendly star rating: `⭐⭐⭐⭐ Mastered` or `⭐⭐⭐ Growing`)
    5. **Teacher Note / Observation** (The teacher's exact qualitative note in warm italics)
* **Handling High Session Counts (30–50+ Sessions):**
  * When a timeframe contains dozens of sessions, the report displays the **top 6 to 8 most recent sessions with teacher feedback**.
  * A discreet note is printed below the table:
    > *"Showing Liam's latest 6 activity logs with teacher notes. To review all 24 session logs, please open the Feedback tab in your Autivity Parent App."*
  * When filtered by shorter ranges (*This Week* or a custom 5-day range), all sessions in that window fit naturally.

---

### B. The Basis of "At-Home Activities" (The SPED Activity Engine)
The home activities are **not generated by a generic live AI API (like ChatGPT/Gemini)**. Instead, they are generated using a **deterministic, rule-based SPED activity mapping library** built inside [`parentAnalyticsEngine.ts`](file:///c:/Projects/Capstone/autivity/src/services/parentAnalyticsEngine.ts):

```
┌────────────────────────────────────────────────────────────────────────┐
│             HOW "AT-HOME ACTIVITIES" ARE SELECTED                      │
├────────────────────────────────────────────────────────────────────────┤
│ 1. Child's Focus / Lowest-Scoring Domain:                              │
│    • Checks evaluation averages across master domains.                 │
│    • Example: Social & Sharing is 3.10 vs. Cognitive 3.55.             │
│    • Selects a home activity targeting delayed gratification/sharing.  │
│                                                                        │
│ 2. Active IEP Goals & Developmental Milestones:                        │
│    • Checks database milestones (e.g. "Pincer grasp on jacket button").│
│    • Selects a matching household fine-motor or adaptive activity      │
│      (e.g., sorting laundry socks, buttoning practice).                │
│                                                                        │
│ 3. Emotional Regulation Check-In Trends:                               │
│    • Checks check-in distribution: if Yellow Zone (Energetic/Anxious)   │
│      is frequent after recess, selects a transition routine tip        │
│      (e.g., "3-minute visual warning countdown before bedtime").       │
└────────────────────────────────────────────────────────────────────────┘
```

#### Pre-Written Household Activity Library:
| Focus Domain in School | Real-Life Household Activity Generated for Parent | Why It Helps |
| :--- | :--- | :--- |
| **Cognitive & Sorting** | **"Laundry Match-Up":** Let the child sort clean socks into pairs or group spoons and forks during dinner prep. | Reinforces 2-attribute visual categorization without screen time. |
| **Social & Turn-Taking** | **"My Turn, Your Turn":** Pass snack tokens or blocks back and forth with a friendly 5-second countdown. | Teaches joint attention and patience in a low-pressure home setting. |
| **Fine Motor Skills** | **"Pinch & Drop":** Dropping large coins into a piggy bank or rolling playdough balls with thumb and index fingers. | Strengthens pincer grasp used for handwriting and eating utensils. |
| **Sensory Transitions** | **"Visual 3-Minute Warning":** Giving a consistent 3-minute heads-up timer before shutting off TV or heading to bed. | Prevents anxious emotional spikes during routine changes. |

*Why this approach is best for Autivity:*
1. **Clinically Safe:** Pre-approved by SPED guidelines; zero risk of AI hallucinating overwhelming activities.
2. **100% Offline & Instant:** Compiles immediately on the parent's device without network dependence.
3. **Zero Cost:** No recurring third-party API fees.

---

### C. Timeframe Export Dialog for Parents
Currently, tapping the download button in [`app/(parent-tabs)/analytics.tsx`](file:///c:/Projects/Capstone/autivity/app/(parent-tabs)/analytics.tsx#L201-L225) immediately exports a PDF using the active screen filter.

Parents must be able to choose their desired timeframe before exporting:
1. **Timeframe Mode Selector:**
   * **Quick Presets:**
     - *Today*
     - *This Week (Last 7 Days)*
     - *Last Week*
     - *This Month (Last 30 Days)*
     - *All Time / School Year*
   * **Custom Date Range:**
     - Start Date button & End Date button (using `@react-native-community/datetimepicker`).
     - Validation: Start Date must be prior to or equal to End Date.
2. **Export Format:**
   - PDF Document (.pdf) — primary option.
3. **Dynamic Header & Calculation:**
   - The PDF header updates to show the selected dates: *"Timeframe: Oct 20 – Nov 19, 2026"*.
   - All session counts, score trends, and check-ins strictly reflect that window.

---

### D. Layout & Pagination Balance
* Body print margin: `12mm 14mm 14mm 14mm`.
* Single clean page break between Page 1 and Page 2:
  - **Page 1:** Header + Learner Info + Celebration Narrative + 4 Core Badges + Learning Trend Chart + Skills Practiced Chart.
  - **Page 2:** Page 2 Header + Daily Feelings (3 cards) + Merged Activity & Teacher Notes Table + At-Home Activities Card + Warm Partnership Footer.
* Both pages are completely balanced on A4 portrait with **zero awkward whitespace**.

---

## 4. Technical Architecture & File Map

```
Parent taps [Download / Export PDF] in Parent Analytics or Home Screen
                               │
                               ▼
┌────────────────────────────────────────────────────────┐
│             ParentExportModal.tsx                      │
│                                                        │
│  Select Reporting Timeframe:                           │
│  [ Quick Presets (This Month ▼) ]  [ Custom Date Range]│
│                                                        │
│  [ CANCEL ]                    [ DOWNLOAD PDF REPORT ] │
└──────────────────────────────┬─────────────────────────┘
                               │
                               ▼ Passes { studentId, dateRange, activityType }
┌────────────────────────────────────────────────────────┐
│           src/services/exportReport.ts                 │
│                                                        │
│  exportChildReportPdf(data, stats, timeframeLabel)     │
│  buildReportHtml(...)                                  │
│                                                        │
│  1. Filter sessions & check-ins to exact date bounds   │
│  2. Compute 4 friendly highlight badges                │
│  3. Generate Learning Score SVG with "Goal Line"       │
│  4. Generate Skills Practiced SVG bars                 │
│  5. Build Feelings & Emotion Check-in cards            │
│  6. Build Merged Activity & Teacher Notes Table        │
│  7. Generate evidence-based "At-Home Practice" items   │
│  8. Compile via Print.printToFileAsync({ html })       │
│  9. Open native Sharing sheet                          │
└────────────────────────────────────────────────────────┘
```

---

## 5. Step-by-Step Implementation Plan

### Phase 1: Build the Parent Export Modal Component
* **File to Create:** `components/parent/parent-export-modal.tsx`
* **Tasks:**
  1. Create a clean, accessible modal adhering to `docs/DESIGN_SYSTEM.md` (`Fredoka-One` titles, `Quicksand` body text, pastel colors).
  2. Implement Timeframe Selector:
     - Segmented control / Tabs: **"Quick Presets"** vs. **"Custom Dates"**.
     - Dropdown / radio options for Quick Presets (`today`, `week`, `last_week`, `month`, `overall`).
     - Start Date & End Date pickers using `@react-native-community/datetimepicker`.
  3. Include "Download PDF Report" action button with loading spinner state.
  4. Wire modal into `app/(parent-tabs)/analytics.tsx` and `app/(parent-tabs)/index.tsx`.

---

### Phase 2: Date Filtering & Data Preparation
* **Files to Modify:**
  - `src/services/parentDashboard.ts`
  - `app/(parent-tabs)/analytics.tsx`
* **Tasks:**
  1. Ensure the export handler accepts `{ startDate: Date, endDate: Date, label: string }`.
  2. Filter `data.sessions` and check-ins strictly between `startDate` and `endDate`.
  3. Recompute `stats.overallPerformance`, `stats.totalSessions`, and `stats.avgSessionSeconds` based on the filtered session subset.

---

### Phase 3: Revamp `buildReportHtml` in `exportReport.ts`
* **File to Modify:** `src/services/exportReport.ts` (Lines 541–750)
* **Tasks:**
  1. **Replace Old Card Dump:** Remove the loop that prints repeating 5-row rubric tables (`RUBRIC_CRITERIA`).
  2. **Page 1 Layout:**
     - Title: *"AUTIVITY | Child Learning Journey & Progress"*.
     - Child Info: Name, Grade, Teacher, Timeframe.
     - Celebration Box: Warm narrative paragraph.
     - 4 Highlight Badges: Mastery (%), Independence (%), Focus Time (mins), Total Activities.
     - Trend Chart SVG: Updated with *"Goal Line"* and positive outlook.
     - Skills Practiced SVG: Friendly domain names (Thinking & Sorting, Hands & Movement, Sharing, Calming).
  3. **Page 2 Layout:**
     - Clean Page Break (`.page-break`).
     - Daily Feelings Grid: 3 friendly cards (Calm & Happy, Energetic, Tired).
     - Merged Activity & Teacher Notes Table: 6–8 recent sessions with Date, Activity, Domain, Source badge, Result stars, and inline Teacher Note.
     - "Fun Activities to Try Together at Home" Card: 3 tailored activities generated from the child's focus domain and check-in patterns.
     - Warm Partnership Footer.
  4. **CSS & Print Rules:** Apply `@page { size: A4 portrait; margin: 12mm 14mm 14mm 14mm; }` and `page-break-inside: avoid;`.

---

### Phase 4: Bilingual Support (English & Filipino / Tagalog)
* **File to Modify:** `src/services/exportReport.ts` & `src/services/parentAnalyticsEngine.ts`
* **Tasks:**
  1. Detect the user's active language preference (`language === 'tl'` vs `'en'`).
  2. Provide natural Filipino translations for parent report elements:
     - *"Child Learning Journey & Progress"* ➔ *"Paglalakbay sa Pagkatuto at Pag-unlad ng Bata"*
     - *"Celebrating Liam's Progress this Month!"* ➔ *"Ipagdiwang ang Pag-unlad ni Liam ngayong Buwan!"*
     - *"Did It On His Own"* ➔ *"Nagawa Nang Mag-isa"*
     - *"How Liam Felt at School"* ➔ *"Pakiramdam ni Liam sa Paaralan"*
     - *"Fun Activities to Try Together at Home"* ➔ *"Mga Masasayang Gawain sa Bahay"*

---

### Phase 5: Verification & Quality Assurance

| Test Case | Condition | Expected Result |
| :--- | :--- | :--- |
| **Preset Filter (This Week)** | Select "This Week", click Export | PDF reflects only past 7 days; sessions and trend line calculate accurately. |
| **Custom Date Range** | Pick custom start/end (e.g., Nov 01 to Nov 15) | Date range displays in header; only sessions in that window appear in the table. |
| **High Session Volume** | Child has 40 sessions in period | Table displays the top 8 sessions with teacher notes cleanly; discreet notice points to app for full history. |
| **Empty Range** | Range with 0 sessions | Shows friendly empty state (*"No activities logged in this timeframe"*); no layout breaks or crashes. |
| **2-Page Pagination** | Print or open PDF | Exactly 2 pages on standard A4; zero awkward whitespace on Page 2. |
| **Device Testing** | Android tablet and smartphone | Export modal and date picker open smoothly; sharing sheet opens reliably. |

---

## 6. Document Reference & Approvals

* **Specification Document:** [`c:\Projects\Capstone\autivity\docs\revisions\parent pdf report revision.md`](file:///c:/Projects/Capstone/autivity/docs/revisions/parent%20pdf%20report%20revision.md)
* **Companion Teacher Specification:** [`c:\Projects\Capstone\autivity\docs\revisions\teacher pdf report revision.md`](file:///c:/Projects/Capstone/autivity/docs/revisions/teacher%20pdf%20report%20revision.md)
* **Rendered Prototype Sample:** [`c:\Projects\Capstone\autivity\docs\sample-parent-analytics-report.pdf`](file:///c:/Projects/Capstone/autivity/docs/sample-parent-analytics-report.pdf)

Once approved, implementation will proceed alongside the Teacher PDF report revision!
