const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const XLSX = require('xlsx-js-style');

const docsDir = path.join(__dirname, '..', 'docs');
if (!fs.existsSync(docsDir)) {
  fs.mkdirSync(docsDir, { recursive: true });
}

// Reusable styling presets
const STYLES = {
  headerPrimary: {
    fill: { fgColor: { rgb: '0284C7' } }, // Autivity primary blue
    font: { name: 'Segoe UI', sz: 10, bold: true, color: { rgb: 'FFFFFF' } },
    alignment: { horizontal: 'center', vertical: 'center', wrapText: true },
    border: {
      top: { style: 'thin', color: { rgb: '0369A1' } },
      bottom: { style: 'medium', color: { rgb: '0369A1' } },
      left: { style: 'thin', color: { rgb: '0369A1' } },
      right: { style: 'thin', color: { rgb: '0369A1' } }
    }
  },
  headerDark: {
    fill: { fgColor: { rgb: '1E293B' } }, // Slate dark
    font: { name: 'Segoe UI', sz: 10, bold: true, color: { rgb: 'FFFFFF' } },
    alignment: { horizontal: 'center', vertical: 'center', wrapText: true },
    border: {
      top: { style: 'thin', color: { rgb: '0F172A' } },
      bottom: { style: 'medium', color: { rgb: '0F172A' } }
    }
  },
  headerCategory: {
    fill: { fgColor: { rgb: 'E2E8F0' } },
    font: { name: 'Segoe UI', sz: 10, bold: true, color: { rgb: '1E293B' } },
    alignment: { horizontal: 'left', vertical: 'center' }
  },
  cellText: {
    font: { name: 'Segoe UI', sz: 9.5, color: { rgb: '1E293B' } },
    alignment: { horizontal: 'left', vertical: 'center' },
    border: {
      bottom: { style: 'thin', color: { rgb: 'E2E8F0' } },
      right: { style: 'thin', color: { rgb: 'F1F5F9' } }
    }
  },
  cellTextAlt: {
    fill: { fgColor: { rgb: 'F8FAFC' } },
    font: { name: 'Segoe UI', sz: 9.5, color: { rgb: '1E293B' } },
    alignment: { horizontal: 'left', vertical: 'center' },
    border: {
      bottom: { style: 'thin', color: { rgb: 'E2E8F0' } },
      right: { style: 'thin', color: { rgb: 'F1F5F9' } }
    }
  },
  cellCenter: {
    font: { name: 'Segoe UI', sz: 9.5, color: { rgb: '1E293B' } },
    alignment: { horizontal: 'center', vertical: 'center' },
    border: {
      bottom: { style: 'thin', color: { rgb: 'E2E8F0' } },
      right: { style: 'thin', color: { rgb: 'F1F5F9' } }
    }
  },
  cellCenterAlt: {
    fill: { fgColor: { rgb: 'F8FAFC' } },
    font: { name: 'Segoe UI', sz: 9.5, color: { rgb: '1E293B' } },
    alignment: { horizontal: 'center', vertical: 'center' },
    border: {
      bottom: { style: 'thin', color: { rgb: 'E2E8F0' } },
      right: { style: 'thin', color: { rgb: 'F1F5F9' } }
    }
  },
  cellMastered: {
    fill: { fgColor: { rgb: 'DCFCE7' } },
    font: { name: 'Segoe UI', sz: 9.5, bold: true, color: { rgb: '166534' } },
    alignment: { horizontal: 'center', vertical: 'center' },
    border: { bottom: { style: 'thin', color: { rgb: '86EFAC' } } }
  },
  cellDeveloping: {
    fill: { fgColor: { rgb: 'FEF3C7' } },
    font: { name: 'Segoe UI', sz: 9.5, bold: true, color: { rgb: '92400E' } },
    alignment: { horizontal: 'center', vertical: 'center' },
    border: { bottom: { style: 'thin', color: { rgb: 'FDE68A' } } }
  },
  summaryRow: {
    fill: { fgColor: { rgb: 'F0FDF4' } },
    font: { name: 'Segoe UI', sz: 10, bold: true, color: { rgb: '15803D' } },
    alignment: { horizontal: 'center', vertical: 'center' },
    border: {
      top: { style: 'medium', color: { rgb: '16A34A' } },
      bottom: { style: 'double', color: { rgb: '16A34A' } }
    }
  },
  summaryRowLabel: {
    fill: { fgColor: { rgb: 'F0FDF4' } },
    font: { name: 'Segoe UI', sz: 10, bold: true, color: { rgb: '15803D' } },
    alignment: { horizontal: 'left', vertical: 'center' },
    border: {
      top: { style: 'medium', color: { rgb: '16A34A' } },
      bottom: { style: 'double', color: { rgb: '16A34A' } }
    }
  }
};

// -------------------------------------------------------------
// 1. GENERATE EXCEL WORKBOOK (TIGHT, BEAUTIFULLY STYLED & READABLE)
// -------------------------------------------------------------
function generateExcelReport() {
  const wb = XLSX.utils.book_new();

  // ==========================================
  // TAB 1: Summary & KPIs (TIGHT, STRUCTURED)
  // ==========================================
  const summaryAoa = [
    ['AUTIVITY SPECIAL EDUCATION PROGRESS REPORT — DATA ANALYSIS WORKBOOK', '', '', '', ''],
    ['STUDENT DEMOGRAPHICS & PROFILE', '', '', '', ''],
    ['Learner Name', 'Liam Noah S. Garcia', '', 'Assigned Teacher', 'Teacher Maria Santos, LPT, SPED'],
    ['Learner Code', '#AUT-104', '', 'Assigned Therapist', 'Jonathan Cruz, OTRP (Occupational Therapy)'],
    ['Grade / Section', 'SPED Primary (Transition Cohort A)', '', 'Parent Account Linked', 'YES (Mother: Elena Garcia)'],
    ['Evaluation Period', 'Last 30 Days (Oct 20 – Nov 19, 2026)', '', 'Report Generated', 'November 19, 2026'],
    ['', '', '', '', ''],
    ['CORE DEVELOPMENTAL METRICS & BENCHMARKS', '', '', '', ''],
    ['Metric Name', 'Observed Value', 'Target Benchmark', 'Mastery Status', 'Pedagogical & Clinical Context'],
    ['Overall Rubric Score Avg', 3.32, '>= 3.20 (80% Goal)', 'Goal Met / Mastered', 'Consistent task execution and instructional compliance across domains.'],
    ['Overall Accuracy Rate', 0.864, '>= 80.0%', 'Goal Met / Mastered', 'High precision during object manipulation and visual discrimination.'],
    ['Independence Rate (% Sessions)', 0.680, '>= 65.0%', 'Goal Met / Mastered', 'Completes activities with independent initiative or single verbal cue.'],
    ['Average Hints per Session', 1.2, '< 2.0 hints', 'Low Dependency', 'Hint requirement has decreased by 40% compared to previous month.'],
    ['Average Mistakes per Session', 1.4, '< 2.0 mistakes', 'Strong Accuracy', 'Low error rate; self-corrects on familiar sorting tasks.'],
    ['Average Focus Duration (Sec)', 405, '300s - 480s (5-8m)', 'Optimal Focus', 'Maintains seated focus within expected developmental attention span.'],
    ['Total Recorded Sessions', 24, '>= 15 per month', 'Strong Adherence', '14 Classroom activities + 10 Interactive tablet sessions.'],
    ['2-Week Outlook Projected Score', 3.70, '>= 3.20', 'On Track', 'Paced to complete 3 targeted IEP milestones within 12 days.'],
    ['Calm/Happy Check-In Rate', 0.650, '>= 60.0%', 'Optimal State', 'Calm/Happy baseline strongly correlates with highest rubric score (3.60 avg).'],
    ['', '', '', '', ''],
    ['EXECUTIVE PROGRESS NARRATIVE (FOR IEP & QUARTERLY REPORTING)', '', '', '', ''],
    ['Over the past 30 days, Liam completed 24 recorded developmental sessions (14 classroom activities and 10 interactive tablet sessions). He achieved an overall rubric average of 3.32 / 4.00 (Mastered Benchmark Tier, >= 3.20) with an accuracy rate of 86.4%. Liam showed exceptional acceleration in Cognitive Object Categorization and Gross Motor Coordination, demonstrating spontaneous task completion with fading prompt dependency (68% independent completion). When in an Optimal Emotional Learning State (Calm/Happy, 65% of school days), his task execution averaged 3.60 / 4.00 with minimal errors. Primary focus for the upcoming IEP cycle will be reinforcing self-regulation during noisy group transitions and expanding multi-step receptive language comprehension.', '', '', '', '']
  ];
  const wsSummary = XLSX.utils.aoa_to_sheet(summaryAoa);

  // Style Title
  wsSummary['A1'].s = { font: { name: 'Segoe UI', sz: 12, bold: true, color: { rgb: '0284C7' } } };
  wsSummary['A2'].s = { font: { name: 'Segoe UI', sz: 10, bold: true, color: { rgb: '475569' } } };
  wsSummary['A8'].s = { font: { name: 'Segoe UI', sz: 10, bold: true, color: { rgb: '475569' } } };
  wsSummary['A20'].s = { font: { name: 'Segoe UI', sz: 10, bold: true, color: { rgb: '475569' } } };

  // Style Profile labels
  ['A3', 'A4', 'A5', 'A6', 'D3', 'D4', 'D5', 'D6'].forEach((cell) => {
    if (wsSummary[cell]) wsSummary[cell].s = { font: { name: 'Segoe UI', sz: 9, bold: true, color: { rgb: '64748B' } } };
  });
  ['B3', 'B4', 'B5', 'B6', 'E3', 'E4', 'E5', 'E6'].forEach((cell) => {
    if (wsSummary[cell]) wsSummary[cell].s = { font: { name: 'Segoe UI', sz: 9.5, bold: true, color: { rgb: '1E293B' } } };
  });

  // Style Metric Headers (Row 9)
  ['A9', 'B9', 'C9', 'D9', 'E9'].forEach((cell) => {
    wsSummary[cell].s = STYLES.headerPrimary;
  });

  // Link formulas to row 10-18
  wsSummary['B10'] = { t: 'n', f: "AVERAGE('All Sessions Master Log'!K2:K13)", v: 3.32, s: { font: { bold: true }, alignment: { horizontal: 'center' } } };
  wsSummary['B11'] = { t: 'n', v: 0.864, z: '0.0%', s: { font: { bold: true }, alignment: { horizontal: 'center' } } };
  wsSummary['B12'] = { t: 'n', f: "AVERAGE('All Sessions Master Log'!J2:J13)", v: 0.68, z: '0.0%', s: { font: { bold: true }, alignment: { horizontal: 'center' } } };
  wsSummary['B13'] = { t: 'n', f: "AVERAGE('All Sessions Master Log'!H2:H13)", v: 1.2, z: '0.0', s: { font: { bold: true }, alignment: { horizontal: 'center' } } };
  wsSummary['B14'] = { t: 'n', f: "AVERAGE('All Sessions Master Log'!G2:G13)", v: 1.4, z: '0.0', s: { font: { bold: true }, alignment: { horizontal: 'center' } } };
  wsSummary['B15'] = { t: 'n', f: "AVERAGE('All Sessions Master Log'!E2:E13)", v: 405, z: '0', s: { font: { bold: true }, alignment: { horizontal: 'center' } } };
  wsSummary['B16'] = { t: 'n', f: "COUNTA('All Sessions Master Log'!A2:A13)", v: 24, z: '0', s: { font: { bold: true }, alignment: { horizontal: 'center' } } };
  wsSummary['B17'] = { t: 'n', v: 3.70, z: '0.00', s: { font: { bold: true }, alignment: { horizontal: 'center' } } };
  wsSummary['B18'] = { t: 'n', v: 0.650, z: '0.0%', s: { font: { bold: true }, alignment: { horizontal: 'center' } } };

  for (let r = 10; r <= 18; r++) {
    wsSummary['A' + r].s = STYLES.cellText;
    if (wsSummary['C' + r]) wsSummary['C' + r].s = STYLES.cellCenter;
    if (wsSummary['D' + r]) wsSummary['D' + r].s = STYLES.cellMastered;
    if (wsSummary['E' + r]) wsSummary['E' + r].s = STYLES.cellText;
  }

  // Merge Summary narrative across A21:E24 for clean reading
  wsSummary['!merges'] = [
    { s: { r: 0, c: 0 }, e: { r: 0, c: 4 } },
    { s: { r: 20, c: 0 }, e: { r: 23, c: 4 } }
  ];
  wsSummary['A21'].s = {
    fill: { fgColor: { rgb: 'F0F9FF' } },
    font: { name: 'Segoe UI', sz: 9.5, color: { rgb: '334155' } },
    alignment: { wrapText: true, vertical: 'top' },
    border: {
      top: { style: 'thin', color: { rgb: 'BBE8FB' } },
      bottom: { style: 'thin', color: { rgb: 'BBE8FB' } },
      left: { style: 'thin', color: { rgb: 'BBE8FB' } },
      right: { style: 'thin', color: { rgb: 'BBE8FB' } }
    }
  };

  // Tight, balanced column widths for Tab 1
  wsSummary['!cols'] = [
    { wch: 28 }, // Metric Name
    { wch: 15 }, // Observed Value
    { wch: 18 }, // Target Benchmark
    { wch: 20 }, // Mastery Status
    { wch: 48 }  // Context
  ];
  XLSX.utils.book_append_sheet(wb, wsSummary, 'Summary & KPIs');

  // ==========================================
  // TAB 2: All Sessions Master Log (TIGHT GRID)
  // ==========================================
  const masterLogData = [
    ['Session Date', 'Activity Source', 'Skill Domain', 'Activity Title', 'Duration (Sec)', 'Formatted Time', 'Mistakes', 'Hints', 'Prompt Level Required', 'Independence', 'Rubric (0-4)', 'Mastery Status', 'Regulation State', 'Teacher Remarks / Observations'],
    ['2026-10-21', 'Classroom', 'Gross & Fine Motor', 'Block Tower Stacking', 460, '7m 40s', 3, 3, 'Moderate Verbal Prompt', 0.60, 2.60, 'Developing', 'Yellow (Energetic/Anxious)', 'Distracted by outdoor noise; calmed after sensory squeeze toy.'],
    ['2026-10-24', 'App', 'Cognitive', 'Color Match Adventure', 390, '6m 30s', 2, 2, 'Minimal Gestural', 0.75, 2.80, 'Developing', 'Green (Calm & Happy)', 'Eager to touch screen; needed reminder to wait for audio prompt chime.'],
    ['2026-10-27', 'Classroom', 'Social & Communication', 'Emotion Flashcards', 420, '7m 00s', 2, 2, 'Moderate Verbal Prompt', 0.70, 2.80, 'Developing', 'Green (Calm & Happy)', 'Identified happy and sad with ease; needed gestural cue for angry.'],
    ['2026-10-30', 'App', 'Cognitive', 'Animal Habitat Sorting', 370, '6m 10s', 1, 1, 'Minimal Gestural', 0.85, 3.00, 'Developing', 'Green (Calm & Happy)', 'Good dragging accuracy. Focused through 8 consecutive rounds.'],
    ['2026-11-03', 'Classroom', 'Gross & Fine Motor', 'Pegboard Placement', 350, '5m 50s', 1, 1, 'Minimal Gestural', 0.85, 3.20, 'Mastered', 'Green (Calm & Happy)', 'Fine motor pincer grasp showed great control with minimal hand tremor.'],
    ['2026-11-05', 'App', 'Social & Communication', 'Verbal Word-Object Match', 340, '5m 40s', 1, 1, 'Independent / Single Cue', 0.90, 3.40, 'Mastered', 'Yellow (Energetic/Anxious)', 'Repeated spoken words clearly during app celebration prompt.'],
    ['2026-11-08', 'App', 'Social & Communication', 'Emotion Story Sequencing', 510, '8m 30s', 4, 3, 'Direct Hand-over-Hand', 0.50, 2.60, 'Developing', 'Blue (Tired / Low Energy)', 'Post-recess fatigue noted. Needed 3 hints; picture bridge helped.'],
    ['2026-11-11', 'Classroom', 'Cognitive', 'Geometric Shape Sorter', 330, '5m 30s', 0, 0, 'Independent / Single Cue', 1.00, 3.80, 'Mastered', 'Green (Calm & Happy)', 'Mastered star and hexagon slots accurately without trial-and-error.'],
    ['2026-11-14', 'Classroom', 'Gross & Fine Motor', 'Buttoning & Zipper Board', 440, '7m 20s', 2, 1, 'Minimal Gestural', 0.80, 3.40, 'Mastered', 'Green (Calm & Happy)', 'Achieved milestone for medium button insertion independently.'],
    ['2026-11-17', 'Classroom', 'Cognitive', 'Categorizing Living Tools', 310, '5m 10s', 1, 0, 'Independent / Single Cue', 0.95, 3.80, 'Mastered', 'Green (Calm & Happy)', 'Sorted eating utensils from grooming tools effortlessly; self-corrected comb.'],
    ['2026-11-18', 'App', 'Cognitive', 'Daily Routine Sequencing', 290, '4m 50s', 0, 0, 'Independent / Single Cue', 1.00, 3.80, 'Mastered', 'Green (Calm & Happy)', 'High engagement; completed routine sequence independently on first try.'],
    ['2026-11-19', 'Classroom', 'Social & Communication', 'Turn Taking Circle Game', 400, '6m 40s', 1, 1, 'Minimal Gestural', 0.85, 3.60, 'Mastered', 'Green (Calm & Happy)', 'Waited for classmate without grabbing token; responded well to count timer.']
  ];
  const wsMasterLog = XLSX.utils.aoa_to_sheet(masterLogData);

  // Style Header (Row 1)
  const colsLetters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N'];
  colsLetters.forEach((col) => {
    wsMasterLog[col + '1'].s = STYLES.headerPrimary;
  });

  // Style Data Rows (Rows 2 to 13)
  for (let r = 2; r <= 13; r++) {
    const isAlt = r % 2 === 1;
    wsMasterLog['A' + r].s = isAlt ? STYLES.cellCenterAlt : STYLES.cellCenter;
    wsMasterLog['B' + r].s = isAlt ? STYLES.cellCenterAlt : STYLES.cellCenter;
    wsMasterLog['C' + r].s = isAlt ? STYLES.cellTextAlt : STYLES.cellText;
    wsMasterLog['D' + r].s = isAlt ? STYLES.cellTextAlt : STYLES.cellText;
    wsMasterLog['E' + r].s = isAlt ? STYLES.cellCenterAlt : STYLES.cellCenter;
    wsMasterLog['F' + r].s = isAlt ? STYLES.cellCenterAlt : STYLES.cellCenter;
    wsMasterLog['G' + r].s = isAlt ? STYLES.cellCenterAlt : STYLES.cellCenter;
    wsMasterLog['H' + r].s = isAlt ? STYLES.cellCenterAlt : STYLES.cellCenter;
    wsMasterLog['I' + r].s = isAlt ? STYLES.cellTextAlt : STYLES.cellText;
    wsMasterLog['J' + r].s = isAlt ? STYLES.cellCenterAlt : STYLES.cellCenter;
    wsMasterLog['K' + r].s = isAlt ? STYLES.cellCenterAlt : STYLES.cellCenter;
    wsMasterLog['L' + r].s = wsMasterLog['L' + r].v === 'Mastered' ? STYLES.cellMastered : STYLES.cellDeveloping;
    wsMasterLog['M' + r].s = isAlt ? STYLES.cellTextAlt : STYLES.cellText;
    wsMasterLog['N' + r].s = isAlt ? STYLES.cellTextAlt : STYLES.cellText;

    wsMasterLog['J' + r].z = '0.0%';
    wsMasterLog['K' + r].z = '0.00';
  }

  // Row 14: Dynamic Calculation Average Row
  wsMasterLog['A14'] = { t: 's', v: 'AVERAGE / OVERALL', s: STYLES.summaryRowLabel };
  wsMasterLog['B14'] = { t: 's', v: '', s: STYLES.summaryRow };
  wsMasterLog['C14'] = { t: 's', v: '', s: STYLES.summaryRow };
  wsMasterLog['D14'] = { t: 's', v: '', s: STYLES.summaryRow };
  wsMasterLog['E14'] = { t: 'n', f: 'AVERAGE(E2:E13)', v: 387.5, z: '0', s: STYLES.summaryRow };
  wsMasterLog['F14'] = { t: 's', v: '6m 28s Avg', s: STYLES.summaryRow };
  wsMasterLog['G14'] = { t: 'n', f: 'AVERAGE(G2:G13)', v: 1.42, z: '0.0', s: STYLES.summaryRow };
  wsMasterLog['H14'] = { t: 'n', f: 'AVERAGE(H2:H13)', v: 1.17, z: '0.0', s: STYLES.summaryRow };
  wsMasterLog['I14'] = { t: 's', v: 'Fading to Indep.', s: STYLES.summaryRow };
  wsMasterLog['J14'] = { t: 'n', f: 'AVERAGE(J2:J13)', v: 0.81, z: '0.0%', s: STYLES.summaryRow };
  wsMasterLog['K14'] = { t: 'n', f: 'AVERAGE(K2:K13)', v: 3.32, z: '0.00', s: STYLES.summaryRow };
  wsMasterLog['L14'] = { t: 's', v: 'Goal Met (Mastered)', s: STYLES.summaryRow };
  wsMasterLog['M14'] = { t: 's', v: '', s: STYLES.summaryRow };
  wsMasterLog['N14'] = { t: 's', v: 'Composite metrics across 12 recent sessions', s: STYLES.summaryRowLabel };
  wsMasterLog['!ref'] = 'A1:N14';

  // Tight, human-readable column widths
  wsMasterLog['!cols'] = [
    { wch: 12 }, // Date
    { wch: 11 }, // Source
    { wch: 22 }, // Domain
    { wch: 24 }, // Title
    { wch: 13 }, // Duration (Sec)
    { wch: 13 }, // Duration Formatted
    { wch: 9 },  // Mistakes
    { wch: 8 },  // Hints
    { wch: 22 }, // Prompt Level
    { wch: 13 }, // Independence
    { wch: 12 }, // Rubric Score
    { wch: 14 }, // Mastery Status
    { wch: 23 }, // Regulation State
    { wch: 42 }  // Remarks
  ];
  XLSX.utils.book_append_sheet(wb, wsMasterLog, 'All Sessions Master Log');

  // ==========================================
  // TAB 3: Rubric Criteria Matrix (HEATMAP)
  // ==========================================
  const rubricMatrixData = [
    ['Session Date', 'Source', 'Skill Domain', 'Activity Title', 'Looking at Objects (0-4)', 'Concentrating (0-4)', 'Performing Task (0-4)', 'Following Instructions (0-4)', 'Completed Work (0-4)', 'Rubric Score (0-4)', 'Mastery Status', 'Teacher Remarks'],
    ['2026-10-21', 'Class', 'Motor', 'Block Tower Stacking', 3, 2, 2, 3, 3, 2.60, 'Developing', 'Distracted by outdoor noise; calmed after squeeze toy.'],
    ['2026-10-24', 'App', 'Cognitive', 'Color Match Adventure', 3, 3, 3, 3, 2, 2.80, 'Developing', 'Eager to touch screen; needed reminder for prompt audio.'],
    ['2026-10-27', 'Class', 'Social', 'Emotion Flashcards', 3, 3, 2, 3, 3, 2.80, 'Developing', 'Identified happy/sad with ease; needed cue for angry.'],
    ['2026-10-30', 'App', 'Cognitive', 'Animal Habitat Sorting', 3, 3, 3, 3, 3, 3.00, 'Developing', 'Good dragging accuracy. Focused through 8 rounds.'],
    ['2026-11-03', 'Class', 'Motor', 'Pegboard Placement', 4, 3, 3, 3, 3, 3.20, 'Mastered', 'Fine motor pincer grasp showed great control.'],
    ['2026-11-05', 'App', 'Social', 'Verbal Word-Object Match', 4, 3, 3, 4, 3, 3.40, 'Mastered', 'Repeated spoken words clearly during app celebration.'],
    ['2026-11-08', 'App', 'Social', 'Emotion Story Sequencing', 3, 2, 2, 3, 3, 2.60, 'Developing', 'Post-recess fatigue noted; picture bridge helped.'],
    ['2026-11-11', 'Class', 'Cognitive', 'Geometric Shape Sorter', 4, 4, 3, 4, 4, 3.80, 'Mastered', 'Mastered star and hexagon slots accurately.'],
    ['2026-11-14', 'Class', 'Motor', 'Buttoning & Zipper Board', 4, 3, 3, 3, 4, 3.40, 'Mastered', 'Achieved milestone for medium button insertion independently.'],
    ['2026-11-17', 'Class', 'Cognitive', 'Categorizing Living Tools', 4, 4, 4, 3, 4, 3.80, 'Mastered', 'Sorted eating utensils from grooming tools effortlessly.'],
    ['2026-11-18', 'App', 'Cognitive', 'Daily Routine Sequencing', 4, 4, 3, 4, 4, 3.80, 'Mastered', 'High engagement; completed routine sequence on first attempt.'],
    ['2026-11-19', 'Class', 'Social', 'Turn Taking Circle Game', 4, 3, 4, 4, 3, 3.60, 'Mastered', 'Waited for classmate without grabbing token. Big milestone!']
  ];
  const wsRubricMatrix = XLSX.utils.aoa_to_sheet(rubricMatrixData);

  // Style Header
  ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L'].forEach((col) => {
    wsRubricMatrix[col + '1'].s = STYLES.headerDark;
  });

  // Style data cells
  for (let r = 2; r <= 13; r++) {
    const isAlt = r % 2 === 1;
    wsRubricMatrix['A' + r].s = isAlt ? STYLES.cellCenterAlt : STYLES.cellCenter;
    wsRubricMatrix['B' + r].s = isAlt ? STYLES.cellCenterAlt : STYLES.cellCenter;
    wsRubricMatrix['C' + r].s = isAlt ? STYLES.cellTextAlt : STYLES.cellText;
    wsRubricMatrix['D' + r].s = isAlt ? STYLES.cellTextAlt : STYLES.cellText;

    // Criteria score cells (Cols E through I) — highlighted with clean numeric formatting
    ['E', 'F', 'G', 'H', 'I'].forEach((col) => {
      const val = wsRubricMatrix[col + r].v;
      let cellStyle = isAlt ? STYLES.cellCenterAlt : STYLES.cellCenter;
      if (val === 4) {
        cellStyle = { fill: { fgColor: { rgb: 'DCFCE7' } }, font: { bold: true, color: { rgb: '166534' } }, alignment: { horizontal: 'center' } };
      } else if (val === 3) {
        cellStyle = { fill: { fgColor: { rgb: 'E0F2FE' } }, font: { bold: true, color: { rgb: '0369A1' } }, alignment: { horizontal: 'center' } };
      } else if (val <= 2) {
        cellStyle = { fill: { fgColor: { rgb: 'FEF3C7' } }, font: { bold: true, color: { rgb: '92400E' } }, alignment: { horizontal: 'center' } };
      }
      wsRubricMatrix[col + r].s = cellStyle;
    });

    wsRubricMatrix['J' + r].s = isAlt ? STYLES.cellCenterAlt : STYLES.cellCenter;
    wsRubricMatrix['K' + r].s = wsRubricMatrix['K' + r].v === 'Mastered' ? STYLES.cellMastered : STYLES.cellDeveloping;
    wsRubricMatrix['L' + r].s = isAlt ? STYLES.cellTextAlt : STYLES.cellText;

    wsRubricMatrix['J' + r].z = '0.00';
  }

  // Row 14: Calculation Row for Criteria Averages
  wsRubricMatrix['A14'] = { t: 's', v: 'CRITERIA AVERAGE', s: STYLES.summaryRowLabel };
  wsRubricMatrix['B14'] = { t: 's', v: '', s: STYLES.summaryRow };
  wsRubricMatrix['C14'] = { t: 's', v: '', s: STYLES.summaryRow };
  wsRubricMatrix['D14'] = { t: 's', v: 'Mean Score per Criteria', s: STYLES.summaryRowLabel };
  wsRubricMatrix['E14'] = { t: 'n', f: 'AVERAGE(E2:E13)', v: 3.67, z: '0.00', s: STYLES.summaryRow };
  wsRubricMatrix['F14'] = { t: 'n', f: 'AVERAGE(F2:F13)', v: 3.08, z: '0.00', s: STYLES.summaryRow };
  wsRubricMatrix['G14'] = { t: 'n', f: 'AVERAGE(G2:G13)', v: 3.00, z: '0.00', s: STYLES.summaryRow };
  wsRubricMatrix['H14'] = { t: 'n', f: 'AVERAGE(H2:H13)', v: 3.33, z: '0.00', s: STYLES.summaryRow };
  wsRubricMatrix['I14'] = { t: 'n', f: 'AVERAGE(I2:I13)', v: 3.42, z: '0.00', s: STYLES.summaryRow };
  wsRubricMatrix['J14'] = { t: 'n', f: 'AVERAGE(J2:J13)', v: 3.30, z: '0.00', s: STYLES.summaryRow };
  wsRubricMatrix['K14'] = { t: 's', v: 'Goal Met', s: STYLES.summaryRow };
  wsRubricMatrix['L14'] = { t: 's', v: 'Looking at Objects is highest strength; Concentration is growth focus', s: STYLES.summaryRowLabel };
  wsRubricMatrix['!ref'] = 'A1:L14';

  wsRubricMatrix['!cols'] = [
    { wch: 12 }, // Date
    { wch: 8 },  // Source
    { wch: 14 }, // Domain
    { wch: 24 }, // Title
    { wch: 14 }, // Looking
    { wch: 14 }, // Concentrating
    { wch: 14 }, // Performing
    { wch: 16 }, // Instructions
    { wch: 14 }, // Completed
    { wch: 12 }, // Rubric Score
    { wch: 13 }, // Status
    { wch: 40 }  // Remarks
  ];
  XLSX.utils.book_append_sheet(wb, wsRubricMatrix, 'Rubric Criteria Matrix');

  // ==========================================
  // TAB 4: Skill Domains (TIGHT, COMPACT)
  // ==========================================
  const domainData = [
    ['Master Skill Domain', 'Sub-Skills Evaluated', 'Total Practices', 'Average Score (0–4)', 'Mastery Status', 'Clinical Observation', 'Next Recommended IEP Target'],
    ['Cognitive & Task Execution', 'Shape Matching, Categorization, Pattern Sequencing', 10, 3.55, 'Goal Met / Mastered', 'Strong abstract association and categorization skills.', 'Introduce 3-stage conditional sorting (color + shape + size).'],
    ['Gross & Fine Motor', 'Pincer Grasp, Bilateral Hand Movement, Screen Precision', 6, 3.42, 'Goal Met / Mastered', 'Marked improvement in pencil grip and controlled finger drag.', 'Practice two-handed container opening and lacing.'],
    ['Social & Communication', 'Emotion Recognition, Joint Attention, Turn Taking', 5, 3.12, 'In Progress / Developing', 'Understands primary emotions; developing patience in peer games.', 'Encourage verbal requests ("My turn, please") with visual cue board.'],
    ['Self-Regulation & Adaptive', 'Transition Patience, Calm Breathing, Sensory Adaptation', 3, 3.20, 'Goal Met / Mastered', 'Utilizes deep pressure squeeze toy effectively when overwhelmed.', 'Fade teacher prompt for self-initiated break requests.']
  ];
  const wsDomain = XLSX.utils.aoa_to_sheet(domainData);

  ['A', 'B', 'C', 'D', 'E', 'F', 'G'].forEach((c) => {
    wsDomain[c + '1'].s = STYLES.headerPrimary;
  });

  for (let r = 2; r <= 5; r++) {
    wsDomain['A' + r].s = STYLES.cellText;
    wsDomain['B' + r].s = STYLES.cellText;
    wsDomain['C' + r].s = STYLES.cellCenter;
    wsDomain['D' + r].s = STYLES.cellCenter;
    wsDomain['D' + r].z = '0.00';
    wsDomain['E' + r].s = wsDomain['E' + r].v.includes('Mastered') ? STYLES.cellMastered : STYLES.cellDeveloping;
    wsDomain['F' + r].s = STYLES.cellText;
    wsDomain['G' + r].s = STYLES.cellText;
  }

  // Row 6: Calculation Row
  wsDomain['A6'] = { t: 's', v: 'TOTALS / OVERALL AVERAGE', s: STYLES.summaryRowLabel };
  wsDomain['B6'] = { t: 's', v: 'All 4 developmental domains active', s: STYLES.summaryRowLabel };
  wsDomain['C6'] = { t: 'n', f: 'SUM(C2:C5)', v: 24, z: '0', s: STYLES.summaryRow };
  wsDomain['D6'] = { t: 'n', f: 'AVERAGE(D2:D5)', v: 3.32, z: '0.00', s: STYLES.summaryRow };
  wsDomain['E6'] = { t: 's', v: 'Goal Met', s: STYLES.summaryRow };
  wsDomain['F6'] = { t: 's', v: '', s: STYLES.summaryRow };
  wsDomain['G6'] = { t: 's', v: '', s: STYLES.summaryRow };
  wsDomain['!ref'] = 'A1:G6';

  wsDomain['!cols'] = [
    { wch: 25 }, // Domain
    { wch: 35 }, // Sub-skills
    { wch: 15 }, // Total practices
    { wch: 16 }, // Average score
    { wch: 18 }, // Status
    { wch: 35 }, // Observation
    { wch: 42 }  // Next target
  ];
  XLSX.utils.book_append_sheet(wb, wsDomain, 'Skill Domains');

  // ==========================================
  // TAB 5: Mood & Check-Ins Log
  // ==========================================
  const emotionData = [
    ['EMOTIONAL REGULATION ZONE SUMMARY (CORRELATION WITH PERFORMANCE)', '', '', '', '', '', ''],
    ['Regulation Zone', 'Emotions Included', 'Distribution %', 'Days Count', 'Average Score (0-4)', 'Hints Needed', 'Behavioral & Pedagogical Impact'],
    ['Green Zone (Calm & Ready)', 'Calm, Happy', 0.650, 13, 3.60, 0.7, 'Highest task accuracy, spontaneous self-correction, and independent initiative.'],
    ['Yellow Zone (Energetic/Anxious)', 'Excited, Nervous', 0.200, 4, 3.10, 1.8, 'Occurs post-recess; responds well to 2-minute visual timer countdown and squeeze toy.'],
    ['Blue Zone (Tired/Low Energy)', 'Tired, Sad', 0.150, 3, 2.60, 2.5, 'Correlated with delayed bedtime at home; benefited from scaffolded prompts.'],
    ['', '', '', '', '', '', ''],
    ['DAILY EMOTIONAL CHECK-IN & PERFORMANCE CORRELATION LOG', '', '', '', '', '', ''],
    ['Check-In Date', 'Reported Emotion', 'Tagalog Equivalent', 'Regulation Zone', 'Activity Evaluated', 'Day Score (0-4)', 'Prompt Level Needed', 'Behavioral Observations'],
    ['2026-10-21', 'Nervous', 'Kinakabahan', 'Yellow Zone', 'Block Tower Stacking', 2.60, 'Moderate Verbal Prompting', 'Loud outdoor construction heightened baseline anxiety.'],
    ['2026-10-24', 'Happy', 'Masaya', 'Green Zone', 'Color Match Adventure', 2.80, 'Minimal Gestural Prompting', 'Smooth morning drop-off contributed to high attentiveness.'],
    ['2026-10-27', 'Calm', 'Kalmado', 'Green Zone', 'Emotion Flashcards', 2.80, 'Moderate Verbal Prompting', 'Participated willingly in circle time prior to activity.'],
    ['2026-10-30', 'Happy', 'Masaya', 'Green Zone', 'Animal Habitat Sorting', 3.00, 'Minimal Gestural Prompting', 'Very engaged with animal sounds on tablet.'],
    ['2026-11-03', 'Calm', 'Kalmado', 'Green Zone', 'Pegboard Placement', 3.20, 'Minimal Gestural Prompting', 'Stable emotional baseline; minimal vocal self-stimulation.'],
    ['2026-11-05', 'Excited', 'Masigla', 'Yellow Zone', 'Verbal Word-Object Match', 3.40, 'Independent / Single Cue', 'High enthusiasm channeled positively into vocal repetition.'],
    ['2026-11-08', 'Tired', 'Pagod', 'Blue Zone', 'Emotion Story Sequencing', 2.60, 'High Prompting / Direct', 'Yawns observed; parent reported delayed sleep the night before.'],
    ['2026-11-11', 'Calm', 'Kalmado', 'Green Zone', 'Geometric Shape Sorter', 3.80, 'Independent / Single Cue', 'Optimal calm state yielded best single-task precision.'],
    ['2026-11-14', 'Happy', 'Masaya', 'Green Zone', 'Buttoning & Zipper Board', 3.40, 'Minimal Gestural Prompting', 'Smiled upon completing zipper pull.'],
    ['2026-11-17', 'Happy', 'Masaya', 'Green Zone', 'Categorizing Living Tools', 3.80, 'Independent / Single Cue', 'High intrinsic motivation observed.'],
    ['2026-11-18', 'Calm', 'Kalmado', 'Green Zone', 'Daily Routine Sequencing', 3.80, 'Independent / Single Cue', 'Self-directed navigation between game screens.'],
    ['2026-11-19', 'Calm', 'Kalmado', 'Green Zone', 'Turn Taking Circle Game', 3.60, 'Minimal Gestural Prompting', 'Calm state supported social waiting patience.']
  ];
  const wsEmotion = XLSX.utils.aoa_to_sheet(emotionData);

  // Headers styling
  wsEmotion['A1'].s = { font: { name: 'Segoe UI', sz: 11, bold: true, color: { rgb: '0284C7' } } };
  ['A2', 'B2', 'C2', 'D2', 'E2', 'F2', 'G2'].forEach((c) => { wsEmotion[c].s = STYLES.headerPrimary; });

  wsEmotion['A7'].s = { font: { name: 'Segoe UI', sz: 11, bold: true, color: { rgb: '0284C7' } } };
  ['A8', 'B8', 'C8', 'D8', 'E8', 'F8', 'G8', 'H8'].forEach((c) => { wsEmotion[c].s = STYLES.headerDark; });

  wsEmotion['!cols'] = [
    { wch: 14 }, // Date / Zone
    { wch: 18 }, // Emotion
    { wch: 18 }, // Tagalog
    { wch: 16 }, // Zone
    { wch: 25 }, // Activity
    { wch: 15 }, // Day Score
    { wch: 22 }, // Prompt Level
    { wch: 45 }  // Observation
  ];
  XLSX.utils.book_append_sheet(wb, wsEmotion, 'Mood & Check-Ins Log');

  // ==========================================
  // TAB 6: IEP Milestones Tracker
  // ==========================================
  const milestoneData = [
    ['Milestone Code', 'Target Goal / Skill Description', 'Domain', 'Start Date', 'Target Date', 'Current Status', 'Baseline (0-4)', 'Current (0-4)', 'Progress Delta', 'Teacher Clinical Notes'],
    ['IEP-COG-01', 'Sort 5 geometric shapes independently with 0 verbal prompts', 'Cognitive', '2026-10-15', '2026-11-15', 'Achieved', 1.80, 3.80, 2.00, 'Goal achieved ahead of target schedule. Ready for 3D solid sorting.'],
    ['IEP-MOT-02', 'Fasten 3 large jacket buttons within 3 minutes', 'Fine Motor', '2026-10-20', '2026-11-30', 'In Progress', 1.40, 3.40, 2.00, 'Can fasten 2 buttons independently; third requires stabilizing assistance.'],
    ['IEP-SOC-03', 'Wait turn in 2-person structured game for 30 seconds', 'Social', '2026-11-01', '2026-12-15', 'In Progress', 2.00, 3.60, 1.60, 'Responds consistently to visual countdown card without grasping token.'],
    ['IEP-COM-04', 'Expressively label 4 basic emotions (Happy, Sad, Angry, Scared)', 'Communication', '2026-11-10', '2026-12-20', 'Target Set', 2.20, 2.80, 0.60, 'Consistent with Happy and Sad; reinforcing Scared and Angry through story cues.']
  ];
  const wsMilestone = XLSX.utils.aoa_to_sheet(milestoneData);

  ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'].forEach((c) => {
    wsMilestone[c + '1'].s = STYLES.headerPrimary;
  });

  for (let r = 2; r <= 5; r++) {
    wsMilestone['A' + r].s = STYLES.cellCenter;
    wsMilestone['B' + r].s = STYLES.cellText;
    wsMilestone['C' + r].s = STYLES.cellCenter;
    wsMilestone['D' + r].s = STYLES.cellCenter;
    wsMilestone['E' + r].s = STYLES.cellCenter;
    wsMilestone['F' + r].s = wsMilestone['F' + r].v === 'Achieved' ? STYLES.cellMastered : STYLES.cellDeveloping;
    wsMilestone['G' + r].s = STYLES.cellCenter;
    wsMilestone['H' + r].s = STYLES.cellCenter;
    wsMilestone['I' + r].s = STYLES.summaryRow;
    wsMilestone['J' + r].s = STYLES.cellText;

    wsMilestone['G' + r].z = '0.00';
    wsMilestone['H' + r].z = '0.00';
    wsMilestone['I' + r].z = '+0.00';
  }

  wsMilestone['!cols'] = [
    { wch: 14 }, // Code
    { wch: 40 }, // Goal
    { wch: 15 }, // Domain
    { wch: 12 }, // Start
    { wch: 12 }, // Target
    { wch: 14 }, // Status
    { wch: 14 }, // Baseline
    { wch: 14 }, // Current
    { wch: 14 }, // Progress Delta
    { wch: 45 }  // Notes
  ];
  XLSX.utils.book_append_sheet(wb, wsMilestone, 'IEP Milestones Tracker');

  const excelPath = path.join(docsDir, 'sample-student-analytics-report.xlsx');
  const updatedPath = path.join(docsDir, 'sample-student-analytics-report-updated.xlsx');
  try {
    XLSX.writeFile(wb, excelPath);
    console.log('Successfully updated Excel report at:', excelPath);
  } catch (err) {
    if (err.code === 'EBUSY') {
      console.log('Notice: Main file is currently open in Excel/Viewer (EBUSY). Writing to sample-student-analytics-report-updated.xlsx');
      XLSX.writeFile(wb, updatedPath);
      console.log('Successfully wrote to:', updatedPath);
      return;
    }
    throw err;
  }
  // Also write updated copy just in case
  try {
    XLSX.writeFile(wb, updatedPath);
  } catch (_) {}
}

// -------------------------------------------------------------
// 2. GENERATE HTML REPORT (FOR VIEWING & DIRECT PDF PRINTING)
// -------------------------------------------------------------
function generateHtmlReport() {
  const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>Autivity — Comprehensive Student Progress & Developmental Analytics Report</title>
  <style>
    @page {
      size: A4 portrait;
      margin: 12mm 14mm 14mm 14mm;
    }
    * {
      box-sizing: border-box;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      color: #1E293B;
      background: #FFFFFF;
      margin: 0;
      padding: 0;
      font-size: 11pt;
      line-height: 1.45;
    }
    
    /* Header & Branding */
    .report-header {
      border-bottom: 2px solid #E2E8F0;
      padding-bottom: 14px;
      margin-bottom: 16px;
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
    }
    .brand-title {
      font-size: 20pt;
      font-weight: 800;
      color: #0284C7;
      letter-spacing: -0.5px;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .brand-subtitle {
      font-size: 9.5pt;
      font-weight: 700;
      color: #64748B;
      text-transform: uppercase;
      letter-spacing: 0.8px;
      margin-top: 2px;
    }
    .badge-confidential {
      background: #FEF3C7;
      color: #B45309;
      border: 1px solid #FDE68A;
      font-size: 8pt;
      font-weight: 800;
      text-transform: uppercase;
      padding: 4px 10px;
      border-radius: 999px;
      display: inline-block;
    }

    /* Student Info Strip */
    .student-card {
      background: #F8FAFC;
      border: 1.5px solid #E2E8F0;
      border-radius: 12px;
      padding: 12px 16px;
      margin-bottom: 16px;
      display: grid;
      grid-template-columns: 2fr 1fr 1fr 1fr;
      gap: 12px;
    }
    .info-label {
      font-size: 7.5pt;
      font-weight: 800;
      color: #64748B;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .info-value {
      font-size: 11pt;
      font-weight: 700;
      color: #0F172A;
      margin-top: 1px;
    }
    .info-sub {
      font-size: 8pt;
      color: #64748B;
      font-weight: 600;
    }

    /* Section Styling */
    .section-title {
      font-size: 12pt;
      font-weight: 800;
      color: #1E293B;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      border-left: 4px solid #0284C7;
      padding-left: 8px;
      margin-top: 16px;
      margin-bottom: 10px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .section-subtitle {
      font-size: 8.5pt;
      color: #64748B;
      font-weight: 600;
      text-transform: none;
    }

    /* Executive Narrative */
    .narrative-box {
      background: #F0F9FF;
      border: 1.5px solid #BBE8FB;
      border-radius: 12px;
      padding: 14px 16px;
      margin-bottom: 16px;
    }
    .narrative-headline {
      font-size: 10.5pt;
      font-weight: 800;
      color: #0369A1;
      margin-bottom: 6px;
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .narrative-text {
      font-size: 9.5pt;
      color: #334155;
      font-weight: 500;
      line-height: 1.5;
    }

    /* KPI Grid */
    .kpi-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 10px;
      margin-bottom: 16px;
    }
    .kpi-card {
      background: #FFFFFF;
      border: 1.5px solid #E2E8F0;
      border-radius: 12px;
      padding: 12px;
      text-align: center;
    }
    .kpi-val {
      font-size: 18pt;
      font-weight: 800;
      line-height: 1;
    }
    .kpi-lbl {
      font-size: 7.5pt;
      font-weight: 800;
      color: #475569;
      text-transform: uppercase;
      letter-spacing: 0.4px;
      margin-top: 5px;
    }
    .kpi-pill {
      display: inline-block;
      font-size: 7pt;
      font-weight: 800;
      text-transform: uppercase;
      padding: 2px 8px;
      border-radius: 999px;
      margin-top: 4px;
    }

    /* Prompting Hierarchy Strip */
    .prompt-strip {
      background: #FFFFFF;
      border: 1.5px solid #E2E8F0;
      border-radius: 12px;
      padding: 12px 16px;
      margin-bottom: 16px;
    }
    .prompt-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 8px;
    }
    .prompt-bar {
      height: 16px;
      border-radius: 8px;
      display: flex;
      overflow: hidden;
      margin-bottom: 8px;
    }
    .prompt-seg-independent { background: #10B981; width: 68%; }
    .prompt-seg-verbal { background: #F59E0B; width: 24%; }
    .prompt-seg-physical { background: #EF4444; width: 8%; }
    .prompt-legend {
      display: flex;
      justify-content: space-between;
      font-size: 8pt;
      font-weight: 700;
      color: #475569;
    }
    .legend-item {
      display: flex;
      align-items: center;
      gap: 5px;
    }
    .dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
    }

    /* Charts Container */
    .charts-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;
      margin-bottom: 16px;
    }
    .chart-box {
      background: #FFFFFF;
      border: 1.5px solid #E2E8F0;
      border-radius: 12px;
      padding: 12px;
    }
    .chart-title {
      font-size: 9.5pt;
      font-weight: 800;
      color: #1E293B;
      margin-bottom: 8px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    /* Emotion Cards */
    .emotion-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 10px;
      margin-bottom: 12px;
    }
    .emotion-card {
      border-radius: 10px;
      padding: 10px;
      text-align: center;
    }
    .emotion-pct {
      font-size: 16pt;
      font-weight: 800;
    }
    .emotion-name {
      font-size: 8.5pt;
      font-weight: 800;
      margin-top: 2px;
    }
    .emotion-sub {
      font-size: 7.5pt;
      color: #475569;
      font-weight: 600;
    }
    .emotion-score {
      background: #FFFFFF;
      border-radius: 6px;
      padding: 2px 6px;
      font-size: 7.5pt;
      font-weight: 800;
      margin-top: 6px;
      display: inline-block;
    }

    /* Breakthrough Spotlight Sessions */
    .spotlights-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 10px;
      margin-bottom: 16px;
    }
    .spotlight-card {
      border-radius: 12px;
      padding: 12px 14px;
    }
    .spotlight-badge {
      font-size: 7pt;
      font-weight: 800;
      text-transform: uppercase;
      padding: 2px 8px;
      border-radius: 999px;
      display: inline-block;
      margin-bottom: 4px;
    }

    /* Compact Sessions Table */
    .report-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 8pt;
      margin-bottom: 16px;
    }
    .report-table th {
      background: #F1F5F9;
      color: #475569;
      font-weight: 800;
      text-align: left;
      padding: 7px 9px;
      border-bottom: 1.5px solid #CBD5E1;
      text-transform: uppercase;
      letter-spacing: 0.3px;
    }
    .report-table td {
      padding: 7px 9px;
      border-bottom: 1px solid #E2E8F0;
      color: #334155;
      font-weight: 500;
    }
    .report-table tr:nth-child(even) td {
      background: #F8FAFC;
    }

    /* Bridge to Home Card */
    .home-card {
      background: #ECFDF5;
      border: 1.5px solid #86EFAC;
      border-radius: 12px;
      padding: 12px 16px;
      margin-bottom: 16px;
    }

    /* Signatures Block */
    .signature-row {
      display: grid;
      grid-template-columns: 1fr 1fr 1fr;
      gap: 20px;
      margin-top: 24px;
      padding-top: 14px;
      border-top: 1.5px solid #E2E8F0;
    }
    .sign-line {
      border-top: 1px solid #94A3B8;
      margin-top: 36px;
      padding-top: 4px;
      text-align: center;
    }
    .sign-name {
      font-size: 8.5pt;
      font-weight: 800;
      color: #1E293B;
    }
    .sign-role {
      font-size: 7.5pt;
      color: #64748B;
      font-weight: 600;
    }

    .page-break {
      page-break-before: always;
    }
  </style>
</head>
<body>

  <!-- PAGE 1: EXECUTIVE PROGRESS & ANALYTICS OVERVIEW -->
  <div class="report-header">
    <div>
      <div class="brand-title">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#0284C7" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
        </svg>
        AUTIVITY &nbsp;|&nbsp; Comprehensive Learner Progress Report
      </div>
      <div class="brand-subtitle">Special Education & Autism Developmental Analytics</div>
    </div>
    <div style="text-align: right;">
      <span class="badge-confidential">Official School Document</span>
      <div style="font-size: 8pt; color: #64748B; font-weight: 600; margin-top: 4px;">Reporting Date: November 19, 2026</div>
    </div>
  </div>

  <!-- Student Demographic Strip -->
  <div class="student-card">
    <div>
      <div class="info-label">Learner Profile</div>
      <div class="info-value">Liam Noah S. Garcia</div>
      <div class="info-sub">Learner Code: #AUT-104 &bull; Age: 7 yrs, 4 mos</div>
    </div>
    <div>
      <div class="info-label">Grade / Cohort</div>
      <div class="info-value">SPED Primary</div>
      <div class="info-sub">Transition Class A</div>
    </div>
    <div>
      <div class="info-label">Evaluation Period</div>
      <div class="info-value">Last 30 Days</div>
      <div class="info-sub">Oct 20 – Nov 19, 2026</div>
    </div>
    <div>
      <div class="info-label">Parent Portal</div>
      <div class="info-value" style="color: #15803D;">Active &bull; Linked</div>
      <div class="info-sub">Mother: Elena Garcia</div>
    </div>
  </div>

  <!-- 1. Executive Summary & Clinical Synthesis -->
  <div class="narrative-box">
    <div class="narrative-headline">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#0369A1" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="12" cy="12" r="10"></circle>
        <line x1="12" y1="16" x2="12" y2="12"></line>
        <line x1="12" y1="8" x2="12.01" y2="8"></line>
      </svg>
      Executive Developmental Summary
    </div>
    <div class="narrative-text">
      Over the past 30 days, <strong>Liam</strong> completed <strong>24 recorded developmental sessions</strong> (14 hands-on classroom activities and 10 interactive tablet sessions). He achieved an overall rubric average of <strong>3.32 / 4.00 (Mastered Benchmark Tier, ≥ 3.20)</strong> with an accuracy rate of <strong>86.4%</strong>. Liam showed exceptional acceleration in <em>Cognitive Object Categorization</em> and <em>Gross Motor Coordination</em>, demonstrating spontaneous task completion with fading prompt dependency (<strong>68% independent completion</strong>). When in an Optimal Emotional Learning State (Calm/Happy, 65% of school days), his task execution averaged <strong>3.60 / 4.00</strong> with minimal errors. Primary focus for the upcoming IEP cycle will be reinforcing self-regulation during noisy group transitions and expanding multi-step receptive language comprehension.
    </div>
  </div>

  <!-- 2. Core KPI Grid -->
  <div class="kpi-grid">
    <div class="kpi-card" style="border-color: #86EFAC;">
      <div class="kpi-val" style="color: #15803D;">3.32 <span style="font-size: 11pt; color: #64748B;">/ 4.0</span></div>
      <div class="kpi-lbl">Rubric Average</div>
      <span class="kpi-pill" style="background: #DCFCE7; color: #166534; border: 1px solid #86EFAC;">Mastered Tier</span>
    </div>
    <div class="kpi-card" style="border-color: #BBE8FB;">
      <div class="kpi-val" style="color: #0284C7;">68.0%</div>
      <div class="kpi-lbl">Independence Rate</div>
      <span class="kpi-pill" style="background: #E0F2FE; color: #0369A1; border: 1px solid #BBE8FB;">Prompt Faded</span>
    </div>
    <div class="kpi-card" style="border-color: #CBFAC4;">
      <div class="kpi-val" style="color: #15803D;">1.2 <span style="font-size: 11pt; color: #64748B;">hints</span></div>
      <div class="kpi-lbl">Average Hints / Sess</div>
      <span class="kpi-pill" style="background: #F0FDF4; color: #15803D; border: 1px solid #CBFAC4;">Low Dependency</span>
    </div>
    <div class="kpi-card" style="border-color: #FED7AA;">
      <div class="kpi-val" style="color: #C2410C;">6m 45s</div>
      <div class="kpi-lbl">Sustained Duration</div>
      <span class="kpi-pill" style="background: #FFF7ED; color: #C2410C; border: 1px solid #FFEDD5;">Optimal Focus</span>
    </div>
  </div>

  <!-- 3. Prompt Fading & Independence Hierarchy Strip -->
  <div class="prompt-strip">
    <div class="prompt-header">
      <span style="font-size: 9pt; font-weight: 800; color: #1E293B; text-transform: uppercase;">Prompting Hierarchy & Learner Independence Distribution</span>
      <span style="font-size: 8.5pt; font-weight: 700; color: #10B981;">▲ +28% Independence gain this month</span>
    </div>
    <div class="prompt-bar">
      <div class="prompt-seg-independent" title="Fully Independent / Single Cue (68%)"></div>
      <div class="prompt-seg-verbal" title="Moderate Verbal Prompting (24%)"></div>
      <div class="prompt-seg-physical" title="Direct Hand-over-Hand Assistance (8%)"></div>
    </div>
    <div class="prompt-legend">
      <div class="legend-item"><span class="dot" style="background: #10B981;"></span> Independent / Single Cue: <strong>68% (16 sessions)</strong></div>
      <div class="legend-item"><span class="dot" style="background: #F59E0B;"></span> Moderate Gestural / Verbal: <strong>24% (6 sessions)</strong></div>
      <div class="legend-item"><span class="dot" style="background: #EF4444;"></span> Full Prompt / Hand-over-Hand: <strong>8% (2 sessions)</strong></div>
    </div>
  </div>

  <!-- 4. Visual Progress Analytics (KEEPING THE EXACT CHARTS YOU LIKE) -->
  <div class="section-title">
    <span>Visual Progress Analytics & Forecasting</span>
    <span class="section-subtitle">Longitudinal Trend & Cross-Domain Exposure</span>
  </div>

  <div class="charts-row">
    <!-- Chart 1: Evaluation Trend & Forecast SVG -->
    <div class="chart-box">
      <div class="chart-title">
        <span>30-Day Evaluation Trend</span>
        <span style="background: #DCFCE7; color: #15803D; font-size: 7.5pt; font-weight: 800; padding: 2px 8px; border-radius: 999px; border: 1px solid #86EFAC;">▲ +34.0% Growth</span>
      </div>
      <svg width="100%" height="150" viewBox="0 0 320 150">
        <!-- Grid Lines -->
        <line x1="30" y1="20" x2="310" y2="20" stroke="#F1F5F9" stroke-width="1"/>
        <line x1="30" y1="55" x2="310" y2="55" stroke="#F1F5F9" stroke-width="1"/>
        <line x1="30" y1="90" x2="310" y2="90" stroke="#F1F5F9" stroke-width="1"/>
        <line x1="30" y1="125" x2="310" y2="125" stroke="#E2E8F0" stroke-width="1"/>

        <!-- Benchmark Reference Line (3.2 = Mastered) -->
        <line x1="30" y1="45" x2="310" y2="45" stroke="#10B981" stroke-width="1.5" stroke-dasharray="4,4"/>
        <text x="312" y="47" font-size="7" font-weight="700" fill="#10B981">3.2 Benchmark</text>

        <!-- Y Axis Labels -->
        <text x="12" y="23" font-size="7" font-weight="700" fill="#94A3B8">4.0</text>
        <text x="12" y="58" font-size="7" font-weight="700" fill="#94A3B8">3.0</text>
        <text x="12" y="93" font-size="7" font-weight="700" fill="#94A3B8">2.0</text>
        <text x="12" y="128" font-size="7" font-weight="700" fill="#94A3B8">1.0</text>

        <!-- Historical Trend Path -->
        <path d="M 40,105 L 80,95 L 120,95 L 160,88 L 200,68 L 240,48 L 270,38" fill="none" stroke="#0284C7" stroke-width="3" stroke-linecap="round"/>
        
        <!-- Forecast Trajectory (Dashed) -->
        <path d="M 270,38 L 295,30" fill="none" stroke="#93C5FD" stroke-width="2.5" stroke-dasharray="3,3" stroke-linecap="round"/>
        
        <!-- Plot Points -->
        <circle cx="40" cy="105" r="3.5" fill="#0284C7"/>
        <circle cx="80" cy="95" r="3.5" fill="#0284C7"/>
        <circle cx="120" cy="95" r="3.5" fill="#0284C7"/>
        <circle cx="160" cy="88" r="3.5" fill="#0284C7"/>
        <circle cx="200" cy="68" r="3.5" fill="#0284C7"/>
        <circle cx="240" cy="48" r="3.5" fill="#0284C7"/>
        <circle cx="270" cy="38" r="4.5" fill="#15803D" stroke="#FFFFFF" stroke-width="1.5"/>
        <circle cx="295" cy="30" r="3.5" fill="#93C5FD"/>

        <!-- X Axis Labels -->
        <text x="32" y="140" font-size="7" fill="#64748B">Oct 21</text>
        <text x="112" y="140" font-size="7" fill="#64748B">Oct 30</text>
        <text x="192" y="140" font-size="7" fill="#64748B">Nov 11</text>
        <text x="258" y="140" font-size="7" fill="#0284C7" font-weight="700">Nov 19</text>
      </svg>
      <div style="font-size: 7.5pt; color: #15803D; font-weight: 700; text-align: center; margin-top: 4px;">
        ★ 2-Week Outlook: Projected ~3.70 / 4.00 (Estimated 9 days to full domain mastery)
      </div>
    </div>

    <!-- Chart 2: Domain Exposure Bar Chart SVG -->
    <div class="chart-box">
      <div class="chart-title">
        <span>Developmental Domain Practice</span>
        <span style="font-size: 7.5pt; color: #64748B; font-weight: 700;">24 Total Logs</span>
      </div>
      <div style="margin-top: 6px;">
        <!-- Domain 1: Cognitive -->
        <div style="display: flex; align-items: center; justify-content: space-between; font-size: 7.5pt; font-weight: 700; margin-bottom: 2px;">
          <span>Cognitive & Task Execution</span>
          <span style="color: #0284C7;">10 Sessions &bull; 3.55 Avg (Mastered)</span>
        </div>
        <div style="height: 10px; background: #F1F5F9; border-radius: 5px; overflow: hidden; margin-bottom: 8px;">
          <div style="height: 100%; width: 100%; background: #0284C7; border-radius: 5px;"></div>
        </div>

        <!-- Domain 2: Motor -->
        <div style="display: flex; align-items: center; justify-content: space-between; font-size: 7.5pt; font-weight: 700; margin-bottom: 2px;">
          <span>Gross & Fine Motor</span>
          <span style="color: #10B981;">6 Sessions &bull; 3.42 Avg (Mastered)</span>
        </div>
        <div style="height: 10px; background: #F1F5F9; border-radius: 5px; overflow: hidden; margin-bottom: 8px;">
          <div style="height: 100%; width: 60%; background: #10B981; border-radius: 5px;"></div>
        </div>

        <!-- Domain 3: Social-Emotional -->
        <div style="display: flex; align-items: center; justify-content: space-between; font-size: 7.5pt; font-weight: 700; margin-bottom: 2px;">
          <span>Social & Communication</span>
          <span style="color: #F59E0B;">5 Sessions &bull; 3.12 Avg (Developing)</span>
        </div>
        <div style="height: 10px; background: #F1F5F9; border-radius: 5px; overflow: hidden; margin-bottom: 8px;">
          <div style="height: 100%; width: 50%; background: #F59E0B; border-radius: 5px;"></div>
        </div>

        <!-- Domain 4: Adaptive -->
        <div style="display: flex; align-items: center; justify-content: space-between; font-size: 7.5pt; font-weight: 700; margin-bottom: 2px;">
          <span>Self-Regulation & Adaptive</span>
          <span style="color: #8B5CF6;">3 Sessions &bull; 3.20 Avg (Mastered)</span>
        </div>
        <div style="height: 10px; background: #F1F5F9; border-radius: 5px; overflow: hidden;">
          <div style="height: 100%; width: 30%; background: #8B5CF6; border-radius: 5px;"></div>
        </div>
      </div>
      <div style="font-size: 7.5pt; color: #475569; font-weight: 600; margin-top: 10px; background: #F8FAFC; padding: 6px; border-radius: 6px; text-align: center;">
        Recommended adjustment: Increase Social & Communication exposure by +2 sessions/week.
      </div>
    </div>
  </div>

  <!-- 5. Emotional Recognition & Regulation Correlates (KEEPING & ENHANCING) -->
  <div class="section-title">
    <span>Emotional Recognition & Performance Correlation</span>
    <span class="section-subtitle">20 Daily Check-Ins Recorded</span>
  </div>

  <div class="emotion-grid">
    <div class="emotion-card" style="background: #F0FDF4; border: 1.5px solid #86EFAC;">
      <div class="emotion-pct" style="color: #15803D;">65%</div>
      <div class="emotion-name" style="color: #166534;">Optimal Learning (Green)</div>
      <div class="emotion-sub">Calm &bull; Happy (13 Days)</div>
      <div class="emotion-score" style="color: #15803D; border: 1px solid #86EFAC;">
        Avg Score: <strong>3.60 / 4.0</strong> &bull; Hints: 0.7
      </div>
    </div>
    <div class="emotion-card" style="background: #FEFCE8; border: 1.5px solid #FDE047;">
      <div class="emotion-pct" style="color: #A16207;">20%</div>
      <div class="emotion-name" style="color: #854D0E;">Heightened State (Yellow)</div>
      <div class="emotion-sub">Excited &bull; Anxious (4 Days)</div>
      <div class="emotion-score" style="color: #A16207; border: 1px solid #FDE047;">
        Avg Score: <strong>3.10 / 4.0</strong> &bull; Hints: 1.8
      </div>
    </div>
    <div class="emotion-card" style="background: #EFF6FF; border: 1.5px solid #BFDBFE;">
      <div class="emotion-pct" style="color: #1D4ED8;">15%</div>
      <div class="emotion-name" style="color: #1E40AF;">Low Energy State (Blue)</div>
      <div class="emotion-sub">Tired &bull; Sad (3 Days)</div>
      <div class="emotion-score" style="color: #1D4ED8; border: 1px solid #BFDBFE;">
        Avg Score: <strong>2.60 / 4.0</strong> &bull; Hints: 2.5
      </div>
    </div>
  </div>

  <div style="background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 8px; padding: 8px 12px; margin-bottom: 16px; font-size: 8.5pt;">
    <strong style="color: #0369A1;">💡 Regulation Insight:</strong> Liam achieves highest performance and lowest error rates when entering tasks in a Calm baseline. Post-recess transitions (Yellow Zone) benefit significantly from 2-minute visual countdown timers and deep pressure squishes before seated tasks.
  </div>

  <!-- PAGE BREAK FOR CLEAN 2-PAGE PROFESSIONAL REPORT -->
  <div class="page-break"></div>

  <!-- PAGE 2: SESSION SPOTLIGHTS, HISTORY, HOME BRIDGE & SIGN-OFF -->
  <div class="report-header">
    <div>
      <div class="brand-title" style="font-size: 15pt;">
        AUTIVITY &nbsp;|&nbsp; Learner Progress Report (Continued)
      </div>
      <div class="brand-subtitle">Liam Noah S. Garcia (#AUT-104) &bull; Evaluation Period: Oct 20 – Nov 19, 2026</div>
    </div>
    <div style="text-align: right; font-size: 8pt; color: #64748B; font-weight: 700;">
      Page 2 of 2
    </div>
  </div>

  <!-- 6. Breakthrough Spotlight Sessions (Replacing raw card dump) -->
  <div class="section-title">
    <span>Spotlight Observational Sessions</span>
    <span class="section-subtitle">Key Qualitative Evidence</span>
  </div>

  <div class="spotlights-grid">
    <!-- Spotlight 1: Peak Breakthrough -->
    <div class="spotlight-card" style="background: #F0FDF4; border: 1.5px solid #86EFAC;">
      <div style="display: flex; justify-content: space-between; align-items: center;">
        <span class="spotlight-badge" style="background: #DCFCE7; color: #15803D; border: 1px solid #86EFAC;">★ HIGHEST MASTERY BREAKTHROUGH</span>
        <span style="font-size: 8pt; font-weight: 700; color: #15803D;">Nov 17, 2026</span>
      </div>
      <div style="font-size: 10pt; font-weight: 800; color: #166534; margin-top: 4px;">Categorizing Daily Living Tools (Classroom)</div>
      <div style="font-size: 8pt; color: #475569; font-weight: 600; margin-top: 2px;">Score: <strong>19/20 (3.80/4.0)</strong> &bull; Duration: 5m 10s &bull; Hints: 0 &bull; Mistakes: 1</div>
      <div style="font-size: 8.5pt; color: #1E293B; font-weight: 500; margin-top: 6px; line-height: 1.4; background: #FFFFFF; padding: 8px 10px; border-radius: 8px; border: 1px solid #CBFAC4;">
        <em>"Liam sorted eating utensils from personal hygiene items with spontaneous focus. When he mistakenly placed a comb near the cups, he self-corrected immediately without any prompt. He showed pride upon completion."</em>
      </div>
    </div>

    <!-- Spotlight 2: Key Challenge & Adaptation -->
    <div class="spotlight-card" style="background: #FEFCE8; border: 1.5px solid #FDE047;">
      <div style="display: flex; justify-content: space-between; align-items: center;">
        <span class="spotlight-badge" style="background: #FEF3C7; color: #B45309; border: 1px solid #FDE68A;">▲ INSTRUCTIONAL SUPPORT SPOTLIGHT</span>
        <span style="font-size: 8pt; font-weight: 700; color: #A16207;">Nov 08, 2026</span>
      </div>
      <div style="font-size: 10pt; font-weight: 800; color: #854D0E; margin-top: 4px;">Emotion Story Sequencing (Tablet App)</div>
      <div style="font-size: 8pt; color: #475569; font-weight: 600; margin-top: 2px;">Score: <strong>13/20 (2.60/4.0)</strong> &bull; Duration: 8m 30s &bull; Hints: 3 &bull; Mistakes: 4</div>
      <div style="font-size: 8.5pt; color: #1E293B; font-weight: 500; margin-top: 6px; line-height: 1.4; background: #FFFFFF; padding: 8px 10px; border-radius: 8px; border: 1px solid #FDE68A;">
        <em>"Liam was fatigued after outdoor activity (Blue Zone). Struggled with 3-step story ordering. Providing a visual card bridge reduced frustration and allowed him to complete the sequence."</em>
      </div>
    </div>
  </div>

  <!-- 7. Chronological Session Log Table (Clean, Compact, Meaningful) -->
  <div class="section-title">
    <span>Recent Evaluated Sessions Record</span>
    <span class="section-subtitle">Chronological Performance Log</span>
  </div>

  <table class="report-table">
    <thead>
      <tr>
        <th>Date</th>
        <th>Source</th>
        <th>Domain</th>
        <th>Activity Title</th>
        <th>Score</th>
        <th>Mastery</th>
        <th>Prompts</th>
        <th>Teacher Remarks / Observations</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>Nov 19</td>
        <td><span style="background:#FAF5FF; color:#7E22CE; padding:2px 6px; border-radius:4px; font-weight:700;">Class</span></td>
        <td>Social</td>
        <td>Turn Taking Circle Game</td>
        <td><strong>3.60</strong></td>
        <td><span style="color:#15803D; font-weight:700;">Mastered</span></td>
        <td>1H / 1M</td>
        <td>Waited for peer with count timer; good patience.</td>
      </tr>
      <tr>
        <td>Nov 18</td>
        <td><span style="background:#EFF6FF; color:#0369A1; padding:2px 6px; border-radius:4px; font-weight:700;">App</span></td>
        <td>Cognitive</td>
        <td>Daily Routine Sequencing</td>
        <td><strong>3.80</strong></td>
        <td><span style="color:#15803D; font-weight:700;">Mastered</span></td>
        <td>0H / 0M</td>
        <td>Completed morning routine sequence independently on first try.</td>
      </tr>
      <tr>
        <td>Nov 17</td>
        <td><span style="background:#FAF5FF; color:#7E22CE; padding:2px 6px; border-radius:4px; font-weight:700;">Class</span></td>
        <td>Cognitive</td>
        <td>Categorizing Living Tools</td>
        <td><strong>3.80</strong></td>
        <td><span style="color:#15803D; font-weight:700;">Mastered</span></td>
        <td>0H / 1M</td>
        <td>Self-corrected sorting error; spontaneous task completion.</td>
      </tr>
      <tr>
        <td>Nov 14</td>
        <td><span style="background:#FAF5FF; color:#7E22CE; padding:2px 6px; border-radius:4px; font-weight:700;">Class</span></td>
        <td>Motor</td>
        <td>Buttoning & Zipper Board</td>
        <td><strong>3.40</strong></td>
        <td><span style="color:#15803D; font-weight:700;">Mastered</span></td>
        <td>1H / 2M</td>
        <td>Pincer grasp firm on medium jacket button.</td>
      </tr>
      <tr>
        <td>Nov 11</td>
        <td><span style="background:#FAF5FF; color:#7E22CE; padding:2px 6px; border-radius:4px; font-weight:700;">Class</span></td>
        <td>Cognitive</td>
        <td>Geometric Shape Sorter</td>
        <td><strong>3.80</strong></td>
        <td><span style="color:#15803D; font-weight:700;">Mastered</span></td>
        <td>0H / 0M</td>
        <td>Accurate slot alignment without trial-and-error rotation.</td>
      </tr>
      <tr>
        <td>Nov 08</td>
        <td><span style="background:#EFF6FF; color:#0369A1; padding:2px 6px; border-radius:4px; font-weight:700;">App</span></td>
        <td>Social</td>
        <td>Emotion Story Sequencing</td>
        <td><strong>2.60</strong></td>
        <td><span style="color:#D97706; font-weight:700;">Developing</span></td>
        <td>3H / 4M</td>
        <td>Fatigue observed; benefited from visual cue card bridge.</td>
      </tr>
      <tr>
        <td>Nov 05</td>
        <td><span style="background:#EFF6FF; color:#0369A1; padding:2px 6px; border-radius:4px; font-weight:700;">App</span></td>
        <td>Communication</td>
        <td>Verbal Word-Object Match</td>
        <td><strong>3.40</strong></td>
        <td><span style="color:#15803D; font-weight:700;">Mastered</span></td>
        <td>1H / 1M</td>
        <td>Spoke target word clearly after tablet chime prompt.</td>
      </tr>
      <tr>
        <td>Nov 03</td>
        <td><span style="background:#FAF5FF; color:#7E22CE; padding:2px 6px; border-radius:4px; font-weight:700;">Class</span></td>
        <td>Motor</td>
        <td>Pegboard Placement</td>
        <td><strong>3.20</strong></td>
        <td><span style="color:#15803D; font-weight:700;">Mastered</span></td>
        <td>1H / 1M</td>
        <td>Controlled thumb-index pinch without dropping pegs.</td>
      </tr>
    </tbody>
  </table>

  <!-- 8. Bridge to Home Collaborative Practice -->
  <div class="home-card">
    <div style="font-size: 9.5pt; font-weight: 800; color: #166534; display: flex; align-items: center; gap: 6px; margin-bottom: 4px;">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#166534" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
        <polyline points="9 22 9 12 15 12 15 22"></polyline>
      </svg>
      Bridge to Home: Parent Collaboration & Practice Strategies
    </div>
    <div style="font-size: 8.5pt; color: #1E293B; line-height: 1.45;">
      <strong>1. Household Categorization:</strong> Involve Liam in sorting clean laundry (e.g., socks in one basket, shirts in another) to reinforce his strong 2-attribute visual discrimination at home.<br/>
      <strong>2. Turn-Taking Cue:</strong> During dinner or snack time, practice passing items with a verbal count ("Mom's turn... now Liam's turn") using a 10-second timer to build on his school circle time success.<br/>
      <strong>3. Transition Regulation:</strong> When preparing for bedtime or leaving the house, give a 3-minute visual warning countdown to prevent anxious Yellow Zone spikes.
    </div>
  </div>

  <!-- 9. Formal Signatures & Compliance Block -->
  <div class="signature-row">
    <div>
      <div class="sign-line">
        <div class="sign-name">Maria Santos, LPT, SPED</div>
        <div class="sign-role">Classroom SPED Teacher</div>
      </div>
    </div>
    <div>
      <div class="sign-line">
        <div class="sign-name">Jonathan Cruz, OTRP</div>
        <div class="sign-role">Occupational / Behavioral Therapist</div>
      </div>
    </div>
    <div>
      <div class="sign-line">
        <div class="sign-name">Elena Garcia</div>
        <div class="sign-role">Parent / Guardian Signature & Date</div>
      </div>
    </div>
  </div>

</body>
</html>`;

  const htmlPath = path.join(docsDir, 'sample-student-analytics-report.html');
  fs.writeFileSync(htmlPath, htmlContent, 'utf8');
  console.log('Generated HTML report at:', htmlPath);
  return htmlPath;
}

// -------------------------------------------------------------
// 3. COMPILE HTML TO PDF USING HEADLESS EDGE
// -------------------------------------------------------------
function generatePdfReport(htmlPath) {
  const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
  const pdfPath = path.join(docsDir, 'sample-student-analytics-report.pdf');

  if (fs.existsSync(edgePath)) {
    try {
      const cmd = `"${edgePath}" --headless --disable-gpu --print-to-pdf="${pdfPath}" "${htmlPath}"`;
      execSync(cmd, { stdio: 'inherit' });
      console.log('Successfully generated PDF report at:', pdfPath);
    } catch (e) {
      console.error('Failed to run msedge print-to-pdf:', e.message);
    }
  } else {
    console.log('Edge not found at default location, skipping headless PDF rendering.');
  }
}

generateExcelReport();
// const htmlFile = generateHtmlReport();
// generatePdfReport(htmlFile);
