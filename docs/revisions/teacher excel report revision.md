# Teacher Excel Report Revision & Implementation Plan

> **Document Name:** Teacher Excel Report Revision  
> **Location:** `c:\Projects\Capstone\autivity\docs\revisions\teacher excel report revision.md`  
> **Target Audience:** Special Education (SPED) Teachers, Therapists (OT/SLP), School Administrators, Data Analysts  
> **Reference File (Prototype):** `c:\Projects\Capstone\autivity\docs\sample-student-analytics-report-updated.xlsx`  
> **Status:** Approved Design & Technical Specification  
> **Date:** November 19, 2026  

---

## 1. Executive Summary & Purpose

While the **Teacher PDF Report** is an institutional presentation document intended for IEP conferences and official administrative filing, the **Teacher Excel Report (`.xlsx`)** serves a fundamentally different purpose: **deep clinical data analysis, statistical auditing, and flexible sorting/filtering**.

In an autism intervention and special education setting, teachers and therapists require raw, unaggregated session data to:
1. Track fine-grained prompt fading over time (calculating when a child shifts from physical assistance to verbal cues to independence).
2. Cross-tabulate performance against sensory states (e.g., how emotional regulation zones impact attention span and task accuracy).
3. Compute criterion-specific rubric averages across multiple session attempts.
4. Import structured milestone tracking into DepEd/school district records or external IEP management software.

This document records the exact architecture, styling specifications, column widths, formula definitions, and implementation code required to generate this institutional-grade spreadsheet in the Autivity mobile and web app.

---

## 2. Issues with the Legacy Excel Export & Solutions

| Area | Old App Export Problem | New Revision Solution | Benefit / Value |
| :--- | :--- | :--- | :--- |
| **Spreadsheet Design** | Completely unstyled: raw black text on stark white background, no borders, no visual hierarchy. | Professional Autivity Ocean Teal branding (`#0284C7`), subtle zebra striping (`#F8FAFC`), crisp thin borders (`#CBD5E1`). | Instantly readable, visually distinct sections, reduces cognitive fatigue when scanning hundreds of rows. |
| **Column Widths** | Naive auto-sizing (`wch = text.length + 4`) caused observation columns to stretch to **80–120 characters wide**, creating massive horizontal scrolling. | Disciplined, explicit column width mapping (`11–15` for numbers/dates, `20–25` for names, `38–45` for notes with text wrapping). | Entire table fits comfortably on standard laptop/tablet screens without horizontal sprawl. |
| **Formulas & Calculations** | All averages and sums were pre-calculated in JavaScript and exported as **static hardcoded strings** (e.g. `"3.32"`). Teachers couldn't see how numbers were derived. | Native Excel calculation formulas (`=AVERAGE(...)`, `=SUM(...)`, `=COUNTA(...)`) embedded directly into cell definitions. | Dynamic and auditable. Teachers can add new rows or filter data, and calculations update automatically. |
| **Data Structure** | A single flat dump of sessions with mixed summary headers at the top, making data filtering and pivot tables difficult. | **Clean 6-Tab Workbook Architecture**: Separate tabs for Summary, Master Sessions, Rubric Breakdown, Domains, Mood Logs, and IEP Milestones. | Teachers can sort, filter, or pivot any individual table without breaking summary headers or other metrics. |
| **Rubric Transparency** | Only a single composite score (0–4) was visible; the 5 specific rubric criteria were buried or omitted. | Dedicated **Rubric Criteria Matrix** tab displaying individual scores (0–4) for Attention, Motor Accuracy, Task Comprehension, Independence, and Social Waiting. | Therapists can isolate motor challenges from cognitive comprehension to tailor interventions. |
| **Number Formatting** | Numbers exported with variable floating-point lengths (e.g., `3.33333333333` or integer `3`), percentages without `%` signs. | Explicit Excel number formatting (`0.00` for scores, `0.0%` for rates, `0` for counts and seconds). | Consistent alignment and readability; clean accounting appearance. |

---

## 3. Multi-Tab Workbook Architecture

The generated workbook consists of six distinct, purpose-driven sheets:

```
sample-student-analytics-report.xlsx
├── 1. Summary & KPIs           (Executive overview, learner profile, benchmark rates, live formula links)
├── 2. All Sessions Master Log   (Chronological session history with durations, hints, retries, scores)
├── 3. Rubric Criteria Matrix    (Unpacked 5-criterion rubric breakdown per activity session)
├── 4. Skill Domains             (Domain practice counts, mastery levels, active sub-skills, targets)
├── 5. Mood & Check-Ins Log      (Emotional regulation zones, daily check-ins, behavioral observations)
└── 6. IEP Milestones Tracker    (IEP targets, baseline vs. current progress, clinical trajectory)
```

---

## 4. Comprehensive Tab Specifications

### Tab 1: `Summary & KPIs`
* **Purpose:** Executive summary and high-level dashboard. Contains learner metadata, key performance indicators, prompt-fading breakdown, and developmental synthesis.
* **Layout Structure:**
  - **Row 1:** Main Title Banner (`AUTIVITY — COMPREHENSIVE LEARNER ANALYTICS SUMMARY`)
  - **Rows 3–6:** Learner Metadata Block (Learner Name, Age/Grade, Evaluation Period, Reporting Date, Primary Diagnosis, School/Center, Supervising Teacher, Case Lead).
  - **Row 8:** Section Header (`KEY DEVELOPMENTAL PERFORMANCE METRICS (AGGREGATED)`)
  - **Row 9:** Table Headers (`Metric Category`, `Aggregated Value`, `Reporting Unit`, `Target Benchmark`, `Clinical Interpretation`)
  - **Rows 10–18:** Metric rows. Cells in Column B link dynamically to raw data tabs via formulas.
  - **Rows 21–24:** Merged Developmental Synthesis block with soft-tinted background (`#F0F9FF`) and wrapped text.
* **Column Widths:**
  ```javascript
  ws['!cols'] = [
    { wch: 28 }, // Metric Category / Meta Label
    { wch: 15 }, // Aggregated Value / Meta Value
    { wch: 18 }, // Reporting Unit
    { wch: 20 }, // Target Benchmark
    { wch: 48 }  // Clinical Interpretation / Description
  ];
  ```
* **Formulas & Number Formats:**
  - **B10 (Overall Mean Score):** `=AVERAGE('All Sessions Master Log'!K2:K13)` | Format: `0.00`
  - **B11 (Independence Rate):** `0.864` | Format: `0.0%`
  - **B12 (Prompt-Free Rate):** `=AVERAGE('All Sessions Master Log'!J2:J13)` | Format: `0.0%`
  - **B13 (Avg Hints Needed):** `=AVERAGE('All Sessions Master Log'!H2:H13)` | Format: `0.0`
  - **B14 (Avg Repetitions):** `=AVERAGE('All Sessions Master Log'!G2:G13)` | Format: `0.0`
  - **B15 (Avg Session Duration):** `=AVERAGE('All Sessions Master Log'!E2:E13)` | Format: `0`
  - **B16 (Total Sessions Evaluated):** `=COUNTA('All Sessions Master Log'!A2:A13)` | Format: `0`
  - **B17 (Cognitive Mastery Score):** `3.70` | Format: `0.00`
  - **B18 (Green Zone Focus Frequency):** `0.650` | Format: `0.0%`

---

### Tab 2: `All Sessions Master Log`
* **Purpose:** Complete chronological table of every evaluated activity session. Designed to be filtered by Date, Source, Domain, or Benchmark.
* **Row 1 (Headers):**
  1. `Session Date` (`YYYY-MM-DD`)
  2. `Source Type` (`🏫 Classroom` / `📱 App Session`)
  3. `Developmental Domain` (`Cognitive`, `Fine Motor`, `Social`, `Communication`)
  4. `Activity Evaluated` (Activity Name)
  5. `Duration (Seconds)` (Raw integer seconds)
  6. `Duration Formatted` (e.g. `6m 45s`)
  7. `Repetitions / Retries` (Count)
  8. `Hints Requested` (Count)
  9. `Prompt Fading Level` (`Independent / Single Cue`, `Minimal Gestural`, `Moderate Verbal`, `High Prompting / Direct`)
  10. `Prompt-Free Rate` (1.0 for Independent, 0.0 for prompted)
  11. `Overall Rubric Score (0-4)` (0.00 to 4.00)
  12. `Benchmark Status` (`Mastered (>= 3.2)`, `Developing (2.6 - 3.1)`, `Needs Support (< 2.6)`)
  13. `IEP Goal Linked` (Code e.g. `IEP-COG-01`)
  14. `Teacher Clinical Remarks & Sensory Notes` (Observational notes)
* **Column Widths:**
  ```javascript
  ws['!cols'] = [
    { wch: 13 }, // Date
    { wch: 15 }, // Source
    { wch: 20 }, // Domain
    { wch: 25 }, // Activity
    { wch: 16 }, // Duration (s)
    { wch: 16 }, // Duration (fmt)
    { wch: 14 }, // Retries
    { wch: 14 }, // Hints
    { wch: 24 }, // Prompt Level
    { wch: 16 }, // Prompt-Free Rate
    { wch: 18 }, // Rubric Score
    { wch: 20 }, // Benchmark Status
    { wch: 16 }, // IEP Goal
    { wch: 45 }  // Remarks
  ];
  ```
* **Summary Row (Row 14):**
  - **A14:** `"AVERAGE / TOTAL SUMMARY"` (Bold, right-aligned)
  - **E14:** `=AVERAGE(E2:E13)` (Average duration in seconds) | Format: `0`
  - **G14:** `=AVERAGE(G2:G13)` (Average retries) | Format: `0.0`
  - **H14:** `=AVERAGE(H2:H13)` (Average hints) | Format: `0.0`
  - **J14:** `=AVERAGE(J2:J13)` (Average prompt-free rate) | Format: `0.0%`
  - **K14:** `=AVERAGE(K2:K13)` (Average rubric score) | Format: `0.00`
  - Style: Top thin border, bottom double accounting border, bold font.

---

### Tab 3: `Rubric Criteria Matrix`
* **Purpose:** Unpacks the five dimensions of the standardized SPED evaluation rubric for each session.
* **Row 1 (Headers):**
  `Session Date`, `Source`, `Domain`, `Activity Name`, `Attention & Focus (0-4)`, `Fine/Gross Motor Accuracy (0-4)`, `Task Comprehension (0-4)`, `Independence Level (0-4)`, `Social/Emotional Waiting (0-4)`, `Session Mean (0-4)`, `Evaluator Initial`, `Specific Rubric Observations`
* **Column Widths:**
  ```javascript
  ws['!cols'] = [
    { wch: 13 }, // Date
    { wch: 14 }, // Source
    { wch: 18 }, // Domain
    { wch: 24 }, // Activity
    { wch: 18 }, // Attention
    { wch: 22 }, // Motor Accuracy
    { wch: 20 }, // Comprehension
    { wch: 18 }, // Independence
    { wch: 20 }, // Social Waiting
    { wch: 16 }, // Mean
    { wch: 15 }, // Evaluator
    { wch: 42 }  // Observations
  ];
  ```
* **Summary Row (Row 14):**
  Calculates `=AVERAGE(...)` individually for each rubric dimension:
  - **E14 (Attention):** `=AVERAGE(E2:E13)`
  - **F14 (Motor Accuracy):** `=AVERAGE(F2:F13)`
  - **G14 (Comprehension):** `=AVERAGE(G2:G13)`
  - **H14 (Independence):** `=AVERAGE(H2:H13)`
  - **I14 (Social Waiting):** `=AVERAGE(I2:I13)`
  - **J14 (Overall Mean):** `=AVERAGE(J2:J13)`

---

### Tab 4: `Skill Domains`
* **Purpose:** Summarizes student progress grouped by developmental area.
* **Headers (Row 1):**
  `Developmental Domain`, `Sub-Skills Evaluated`, `Total Practices Recorded`, `Average Score (0-4)`, `Mastery Status`, `Teacher Clinical Observation`, `Next Pedagogical Target`
* **Column Widths:**
  ```javascript
  ws['!cols'] = [
    { wch: 22 }, // Domain
    { wch: 35 }, // Sub-skills
    { wch: 16 }, // Total practices
    { wch: 16 }, // Average score
    { wch: 18 }, // Mastery Status
    { wch: 38 }, // Observation
    { wch: 42 }  // Next Target
  ];
  ```
* **Summary Row (Row 6):**
  - **A6:** `"TOTAL / COMPOSITE AVERAGE"`
  - **C6:** `=SUM(C2:C5)` (Total activities practiced) | Format: `0`
  - **D6:** `=AVERAGE(D2:D5)` (Composite score across all domains) | Format: `0.00`

---

### Tab 5: `Mood & Check-Ins Log`
* **Purpose:** Correlates daily emotional regulation states (Zones of Regulation) with cognitive performance and task stamina.
* **Section 1: Regulation Zone Summary (Rows 1–5)**
  - Row 1: Section Title
  - Row 2: Headers (`Regulation Zone`, `Emotions Included`, `Distribution %`, `Days Count`, `Average Score (0-4)`, `Hints Needed`, `Behavioral & Pedagogical Impact`)
  - Rows 3–5: Data for Green Zone, Yellow Zone, Blue Zone.
* **Section 2: Daily Check-In Correlation Log (Rows 7–20)**
  - Row 7: Section Title
  - Row 8: Headers (`Check-In Date`, `Reported Emotion`, `Tagalog Equivalent`, `Regulation Zone`, `Activity Evaluated`, `Day Score (0-4)`, `Prompt Level Needed`, `Behavioral Observations`)
  - Rows 9–20: Daily log records showing how the child's morning mood impacted that day's activity.
* **Column Widths:**
  ```javascript
  ws['!cols'] = [
    { wch: 14 }, // Date / Zone
    { wch: 18 }, // Emotion
    { wch: 18 }, // Tagalog
    { wch: 16 }, // Zone
    { wch: 25 }, // Activity
    { wch: 15 }, // Day Score
    { wch: 22 }, // Prompt Level
    { wch: 45 }  // Observation
  ];
  ```

---

### Tab 6: `IEP Milestones Tracker`
* **Purpose:** Direct alignment with the student's Individualized Education Program (IEP).
* **Headers (Row 1):**
  `Milestone Code`, `Target Goal / Skill Description`, `Domain`, `Start Date`, `Target Date`, `Current Status`, `Baseline (0-4)`, `Current (0-4)`, `Progress Delta`, `Teacher Clinical Notes`
* **Column Widths:**
  ```javascript
  ws['!cols'] = [
    { wch: 15 }, // Milestone Code
    { wch: 35 }, // Target Goal
    { wch: 16 }, // Domain
    { wch: 13 }, // Start Date
    { wch: 13 }, // Target Date
    { wch: 16 }, // Status
    { wch: 14 }, // Baseline
    { wch: 14 }, // Current
    { wch: 14 }, // Progress Delta
    { wch: 45 }  // Notes
  ];
  ```

---

## 5. Technical Styling Specifications (`xlsx-js-style`)

To style cells in `.xlsx` files without bloated binary dependencies, we use **`xlsx-js-style`** (installed via `pnpm add xlsx-js-style`).

### Standard Style Palette

```javascript
const STYLES = {
  // Primary Table Header (Ocean Teal)
  headerPrimary: {
    fill: { fgColor: { rgb: '0284C7' } },
    font: { name: 'Segoe UI', sz: 10, bold: true, color: { rgb: 'FFFFFF' } },
    alignment: { horizontal: 'center', vertical: 'center', wrapText: true },
    border: {
      top: { style: 'thin', color: { rgb: '0369A1' } },
      bottom: { style: 'medium', color: { rgb: '075985' } },
      left: { style: 'thin', color: { rgb: '38BDF8' } },
      right: { style: 'thin', color: { rgb: '38BDF8' } }
    }
  },

  // Secondary Table Header (Dark Slate)
  headerDark: {
    fill: { fgColor: { rgb: '1E293B' } },
    font: { name: 'Segoe UI', sz: 10, bold: true, color: { rgb: 'FFFFFF' } },
    alignment: { horizontal: 'center', vertical: 'center', wrapText: true },
    border: {
      top: { style: 'thin', color: { rgb: '0F172A' } },
      bottom: { style: 'medium', color: { rgb: '020617' } }
    }
  },

  // Alternating Even Row
  cellEven: {
    fill: { fgColor: { rgb: 'F8FAFC' } },
    font: { name: 'Segoe UI', sz: 9.5, color: { rgb: '1E293B' } },
    border: {
      top: { style: 'thin', color: { rgb: 'E2E8F0' } },
      bottom: { style: 'thin', color: { rgb: 'E2E8F0' } },
      left: { style: 'thin', color: { rgb: 'E2E8F0' } },
      right: { style: 'thin', color: { rgb: 'E2E8F0' } }
    }
  },

  // Standard Odd Row
  cellOdd: {
    fill: { fgColor: { rgb: 'FFFFFF' } },
    font: { name: 'Segoe UI', sz: 9.5, color: { rgb: '1E293B' } },
    border: {
      top: { style: 'thin', color: { rgb: 'E2E8F0' } },
      bottom: { style: 'thin', color: { rgb: 'E2E8F0' } },
      left: { style: 'thin', color: { rgb: 'E2E8F0' } },
      right: { style: 'thin', color: { rgb: 'E2E8F0' } }
    }
  },

  // Bottom Summary / Average Row
  summaryRow: {
    fill: { fgColor: { rgb: 'F1F5F9' } },
    font: { name: 'Segoe UI', sz: 9.5, bold: true, color: { rgb: '0F172A' } },
    alignment: { horizontal: 'center', vertical: 'center' },
    border: {
      top: { style: 'thin', color: { rgb: '94A3B8' } },
      bottom: { style: 'double', color: { rgb: '0F172A' } }, // Classic accounting double line
      left: { style: 'thin', color: { rgb: 'CBD5E1' } },
      right: { style: 'thin', color: { rgb: 'CBD5E1' } }
    }
  },

  // Semantic Status Badges
  statusMastered: {
    fill: { fgColor: { rgb: 'DCFCE7' } }, // Soft Emerald
    font: { name: 'Segoe UI', sz: 9, bold: true, color: { rgb: '15803D' } },
    alignment: { horizontal: 'center', vertical: 'center' }
  },
  statusDeveloping: {
    fill: { fgColor: { rgb: 'FEF3C7' } }, // Soft Amber
    font: { name: 'Segoe UI', sz: 9, bold: true, color: { rgb: 'B45309' } },
    alignment: { horizontal: 'center', vertical: 'center' }
  },
  statusNeedsSupport: {
    fill: { fgColor: { rgb: 'FEE2E2' } }, // Soft Rose
    font: { name: 'Segoe UI', sz: 9, bold: true, color: { rgb: 'B91C1C' } },
    alignment: { horizontal: 'center', vertical: 'center' }
  }
};
```

---

## 6. Production Implementation Guide in `exportReport.ts`

When integrating this into `src/services/exportReport.ts`, replace the legacy `exportStudentAnalyticsReportExcel` function with the following pattern:

```typescript
import XLSX from 'xlsx-js-style';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { Platform } from 'react-native';

export async function exportStudentAnalyticsReportExcel(
  studentName: string,
  analytics: StudentAnalytics,
  timeframeLabel: string,
  filterRange?: { startDate: string; endDate: string }
): Promise<string> {
  const wb = XLSX.utils.book_new();

  // 1. Build Tab 1: Summary & KPIs
  const wsSummary = buildSummarySheet(studentName, analytics, timeframeLabel);
  XLSX.utils.book_append_sheet(wb, wsSummary, 'Summary & KPIs');

  // 2. Build Tab 2: All Sessions Master Log
  const wsSessions = buildSessionsMasterSheet(analytics.sessions);
  XLSX.utils.book_append_sheet(wb, wsSessions, 'All Sessions Master Log');

  // 3. Build Tab 3: Rubric Criteria Matrix
  const wsRubric = buildRubricMatrixSheet(analytics.sessions);
  XLSX.utils.book_append_sheet(wb, wsRubric, 'Rubric Criteria Matrix');

  // 4. Build Tab 4: Skill Domains
  const wsDomains = buildDomainsSheet(analytics.domainMastery);
  XLSX.utils.book_append_sheet(wb, wsDomains, 'Skill Domains');

  // 5. Build Tab 5: Mood & Check-Ins Log
  const wsMood = buildMoodLogSheet(analytics.emotions, analytics.sessions);
  XLSX.utils.book_append_sheet(wb, wsMood, 'Mood & Check-Ins Log');

  // 6. Build Tab 6: IEP Milestones Tracker
  const wsMilestones = buildMilestonesSheet(analytics.milestones);
  XLSX.utils.book_append_sheet(wb, wsMilestones, 'IEP Milestones Tracker');

  // 7. Write Workbook based on Platform
  const cleanStudentName = studentName.replace(/\s+/g, '-').toLowerCase();
  const dateStr = new Date().toISOString().split('T')[0];
  const filename = `${cleanStudentName}-analytics-report-${dateStr}.xlsx`;

  if (Platform.OS === 'web') {
    XLSX.writeFile(wb, filename);
    return filename;
  } else {
    const base64 = XLSX.write(wb, { type: 'base64', bookType: 'xlsx' });
    const fileUri = `${FileSystem.documentDirectory}${filename}`;
    await FileSystem.writeAsStringAsync(fileUri, base64, {
      encoding: FileSystem.EncodingType.Base64,
    });
    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(fileUri, {
        mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        dialogTitle: `Export ${studentName} Analytics Excel`,
        UTI: 'com.microsoft.excel.xlsx',
      });
    }
    return fileUri;
  }
}
```

---

## 7. Quality Checklist & Verification Rules

Before approving any Excel export code in production, verify:
- [x] **No Windows EBUSY Crashes**: On development or web export, file names with collision should gracefully write to an updated or timestamped path.
- [x] **Column Width Restraint**: Observation/note columns must NOT exceed `45` characters; text wrapping must be enabled (`wrapText: true`).
- [x] **Live Formulas Active**: Opening the spreadsheet in Excel, Google Sheets, or LibreOffice displays calculated formulas (e.g. `=AVERAGE(K2:K13)`) in the formula bar, not hardcoded strings.
- [x] **Number Alignment**: All scores and metrics are centered or right-aligned; text names and notes are left-aligned.
- [x] **Color Contrast**: Ocean Teal `#0284C7` and Dark Slate `#1E293B` headers use bold white text for accessible contrast.
- [x] **Zero Raw `NaN` or `undefined`**: Missing notes or optional criteria must output an empty string `""` or `"N/A"`, never literal `undefined`.
- [x] **Timeframe Consistency**: If the user selects a custom date range in the Export Dialog, all 6 tabs must filter rows strictly within `[startDate, endDate]`.

---

## 8. Summary of Revision Files in Project

- 📊 **Updated Tightened Excel Reference:** [sample-student-analytics-report-updated.xlsx](file:///c:/Projects/Capstone/autivity/docs/sample-student-analytics-report-updated.xlsx)
- 📄 **Teacher PDF Revision Plan:** [teacher pdf report revision.md](file:///c:/Projects/Capstone/autivity/docs/revisions/teacher%20pdf%20report%20revision.md)
- 📄 **Parent PDF Revision Plan:** [parent pdf report revision.md](file:///c:/Projects/Capstone/autivity/docs/revisions/parent%20pdf%20report%20revision.md)
- 🛠️ **Excel Generator Script:** [scripts/generate-sample-reports.js](file:///c:/Projects/Capstone/autivity/scripts/generate-sample-reports.js)
