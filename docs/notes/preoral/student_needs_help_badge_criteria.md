# Student "Needs Help" Badge: Criteria & Clinical Rationale

This document details the exact mathematical formulas, clinical thresholds, and pedagogical reasoning for the **`NEEDS HELP`** badge displayed on the Teacher Analytics Dashboard and Student Performance Overview in **Autivity**.

---

## 1. Trigger Conditions (Mathematical Formula)

As implemented in [`src/services/student-analytics.ts`](file:///c:/Projects/Capstone/autivity/src/services/student-analytics.ts):

$$\text{Needs Help} = (\text{Average Rubric Score} < 3.0) \quad\lor\quad (\text{Average Mistakes} \ge 3.0)$$

A student is automatically flagged with the **`NEEDS HELP`** badge if **either** of the following two triggers is met:

| Condition | Threshold | Data Source | Frequency |
| :--- | :--- | :--- | :--- |
| **Rubric Score Threshold** | **$< 3.0$ / $4.0$** ($< 75\%$ Mastery) | Teacher post-session 4-point rubric evaluations | Calculated across all completed evaluated sessions in selected timeframe |
| **Telemetry Mistake Threshold** | **$\ge 3.0$ Mistakes** per session | Raw in-game session telemetry | Average mistakes across all student sessions in selected timeframe |

*(Additionally, during a live session, an instant **Performance Alert ⚠️** notification is dispatched to the teacher if session accuracy falls below $60\%$ or total mistakes reach $\ge 5$.)*

---

## 2. Rubric Evaluation Scale (4-Point Benchmark)

Autivity employs a standardized 4-point developmental scoring system across all learning activities:

| Score | Rating / Level | Clinical Definition & Learner Behavior | Action Implication |
| :---: | :--- | :--- | :--- |
| **4.0** | **Mastered / Independent** | Performs skill with $\ge 90\%$ accuracy and full independence. Needs no verbal or physical cues. | Maintain or promote difficulty tier. |
| **3.0** | **Proficient / Developing** | Functional competency ($\ge 75\%$). Completes task with minimal, occasional verbal/visual cues. | Target benchmark level; steady progression. |
| **2.0** | **Emerging (Needs Help)** | Inconsistent accuracy ($50\% - 74\%$). Requires frequent verbal prompts, partial physical guidance, or repeated visual hints. | **Triggers "NEEDS HELP" flag.** Recommend targeted practice or subcategory tier downshift. |
| **1.0** | **Beginning / Struggling** | Low accuracy ($< 50\%$). Requires intensive 1-on-1 direct support, hand-over-hand prompting, or fails to complete independently. | **Triggers "NEEDS HELP" flag.** High-priority intervention; teacher review of IEP goals. |

---

## 3. Pedagogical & Clinical Rationale ("Why?")

### A. Why $3.0$ ($75\%$) for Rubric Score?
* In Special Education (SPED) and Occupational Therapy (OT) developmental frameworks, **$75\% - 80\%$** represents the clinical threshold for functional mastery.
* A score strictly below $3.0$ indicates that the child cannot reliably perform the target skill without external prompting. Flagging this state allows teachers to intervene before the learner develops learned helplessness or frustration.

### B. Why $\ge 3$ Mistakes for Telemetry?
* Autivity's interactive activity sets (Tracing, Counting, Matching, Sequencing, Bubble Pop) include built-in **two-tier scaffolding** (Level 1 audio-visual clue $\rightarrow$ Level 2 visual guide highlight).
* Making **3 or more mistakes** in a single session signals that the child was unable to self-correct despite Level 1 and Level 2 in-game scaffolding. This indicates that the current task difficulty exceeds their current developmental zone of proximal development (ZPD).

---

## 4. UI Representation

In [`components/teacher/analytics/student-performance-section.tsx`](file:///c:/Projects/Capstone/autivity/components/teacher/analytics/student-performance-section.tsx):

* **Badge Style:** Salmon coral pill badge (`bg-[#FFDBD4]` with border `border-[#FF8870]`).
* **Border Highlight:** Student card border changes from neutral `#D9D9D9` to coral `#FF8870`.
* **Teacher Action:** Tapping the student card opens the deep-dive analytics view, displaying session history, developmental domain exposure, accuracy breakdown, and rule-based recommendation cards.
