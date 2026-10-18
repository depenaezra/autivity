# Parent UI Alignment Plan & Notes (Temporary)

This document tracks guidelines, component mappings, and specific reminders for aligning the **Parent side UI** with the updated **Teacher side UI**.

---

## 🎯 Goal
Align parent-side screens and components (e.g., analytics, cards, headers, tactile buttons, modals) with the modern, playful, tactile design language used across the teacher interface and defined in [DESIGN_SYSTEM.md](file:///c:/Projects/Capstone/autivity/docs/DESIGN_SYSTEM.md).

---

## 📌 Items to Remember & Specific Guidelines
*(Ready for your inputs and specific notes)*

### 1. Key Screens & Components in Scope
- `app/(parent-tabs)/analytics.tsx`
- `components/parent/parent-activity-performance.tsx`
- `components/parent/parent-narrative-summary.tsx`
- `components/parent/parent-skill-performance.tsx`
- `components/parent/parent-progress-trend.tsx`
- *(Add additional screens/components as needed)*

### 2. Teacher Side Reference Patterns to Replicate
- **Card Containers**: White card backgrounds (`#FFFFFF`), `border-[2px] border-[#F1F1F1]`, tactile shadows (`shadowColor: '#F1F1F1'`, `shadowOffset: { width: 0, height: 2 }`, `elevation: 2`).
- **Typography & Headers**: `font-fredoka-one` for section labels/titles (`#484A4B`) and uppercase badge pills; `font-quicksand-medium` for descriptive/body text.
- **Color Themes**: Consistent usage of theme strokes and fills (`#BBE8FB` / `#62A9E6` for blue, `#CBFAC4` / `#179D33` for green, etc.).
- **Interactive Elements**: Tactile button styling with pressed scale transformations (`active:scale-95`).

### 3. Recommendations Section UI (Teacher Side Blueprint)
Reference file: [components/teacher/analytics/student-analytics/student-recommendations-card.tsx](file:///c:/Projects/Capstone/autivity/components/teacher/analytics/student-analytics/student-recommendations-card.tsx)

#### A. Header Row (Title + Count Badge + Hide/Show Button)
- **Container**: `flex-row items-center justify-between mb-4`
- **Left (Title & Count Badge)**:
  - Container: `flex-row items-center gap-2.5`
  - **Title**: `font-fredoka-one text-[#484A4B]` (Mobile: `text-[22px]`, Tablet: `text-[32px]`) -> `"Recommendations"`
  - **Count Badge**:
    - Pill container: `px-2.5 py-0.5 rounded-full bg-[#BBE8FB]/60`
    - Text: `font-fredoka-one text-[#62A9E6]` (Mobile: `text-[11px]`, Tablet: `text-xs`) -> `{recommendations.length}`
- **Right (Tactile Hide / Show Button)**:
  - Container / Pressable:
    - `flex-row items-center justify-center gap-1.5 bg-white border-[2px] border-[#BBE8FB] px-3 h-[34px] rounded-xl active:scale-95 transition-transform`
    - Tactile 3D shadow style:
      ```js
      borderColor: '#BBE8FB',
      shadowColor: '#BBE8FB',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 1,
      shadowRadius: 0,
      elevation: 2,
      ```
  - **Label**: `font-fredoka-one text-[11px] text-[#62A9E6] uppercase` -> `{isCardExpanded ? 'Hide' : 'Show'}`
  - **Icon**: `<Feather name={isCardExpanded ? 'chevron-up' : 'chevron-down'} size={14} color="#62A9E6" />`

---

#### B. Main Card Container
- **Animated Box**:
  - `entering={FadeInUp.duration(200)} exiting={FadeOutUp.duration(150)}`
  - Styling: `bg-white border-[4px] border-[#F1F1F1] rounded-[20px] p-4 sm:rounded-[32px] sm:p-6`
  - Tactile Shadow:
    ```js
    shadowColor: '#F1F1F1',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 2,
    ```

---

#### C. Grouped Subsections (Collapsible)
The recommendations are split into two collapsible groups:
1. **Strengths & Progress**:
   - Header icon: `Feather trending-up` color `#179D33`
   - Title: `font-fredoka-one text-[#484A4B] uppercase tracking-wider text-xs sm:text-sm`
   - Sub-badge: `bg-[#CBFAC4]/60` with text `text-[#179D33]`
   - Mini chevron toggle: Circular plate `w-6 h-6 rounded-full bg-[#F5F7FA]` with `chevron-up`/`chevron-down` in `#9CA3AF`.
2. **Focus & Action Plan**:
   - Separator: `mt-5 pt-5 border-t border-[#F1F1F1]`
   - Header icon: `Feather target` color `#62A9E6`
   - Title: `font-fredoka-one text-[#484A4B] uppercase tracking-wider text-xs sm:text-sm`
   - Sub-badge: `bg-[#BBE8FB]/60` with text `text-[#62A9E6]`
   - Mini chevron toggle: Circular plate `w-6 h-6 rounded-full bg-[#F5F7FA]`.

---

#### D. Recommendation Item Cards
Each item inside the groups:
- Container: `bg-[#F8FAFC] border-[2px] border-[#F1F1F1] rounded-2xl p-3.5 sm:p-4 overflow-hidden`
- **Clickable Header Row**:
  - Icon badge plate: `w-8 h-8 sm:w-9 sm:h-9 rounded-xl` with semantic background (e.g. `#E8F8EE` for strength, `#FFF4EC` for attention, `#EFF8FF` for suggestion).
  - Title: `font-fredoka-one text-sm sm:text-base text-[#484A4B]`
  - Semantic Tag Pill: `px-2 py-0.5 rounded-md` with matching text uppercase (`STRENGTH`, `NEEDS ATTENTION`, `SUGGESTED ACTIVITY`).
  - Item Chevron: `w-6 h-6 rounded-full bg-white border border-[#E5E7EB]/60` with `chevron-up`/`chevron-down`.
- **Collapsible Description**:
  - `mt-2.5 pt-2.5 border-t border-[#F1F1F1]`
  - Text: `font-quicksand-medium text-[#484A4B] leading-relaxed text-xs sm:text-sm`

---

### 4. Typography & Font Size Standardization Rules
To prevent text from being too small to read on mobile devices and to maintain strict consistency across both Teacher and Parent sides:

* **Strict Minimum Font Size**:
  - **No font size smaller than `text-[11px]` is allowed.**
  - **Forbidden**: `text-[8px]`, `text-[9px]`, and `text-[10px]` must NEVER be used on either side.
* **Standard Scale Mapping**:
  | UI Role | Mobile Size | Tablet (`isTablet`) Size | Font Family | Styling |
  | :--- | :--- | :--- | :--- | :--- |
  | **Screen / Section Titles** | `text-[22px]` | `text-[32px]` | `font-fredoka-one` | Primary Dark (`#484A4B`) |
  | **Card / Subsection Headers** | `text-sm` (14px) | `text-base` (16px) | `font-fredoka-one` | Primary Dark (`#484A4B`) |
  | **Badges, Status Pills & Tags** | `text-[11px]` | `text-xs` (12px) | `font-fredoka-one` | UPPERCASE, thematic colors |
  | **Button Labels (Tactile)** | `text-[11px]` or `text-xs` | `text-xs` or `text-sm` | `font-fredoka-one` | UPPERCASE |
  | **Body & Card Descriptions** | `text-xs` (12px) | `text-sm` (14px) | `font-quicksand-medium` | Leading relaxed (`#484A4B`) |
  | **Subtitles / Meta / Timestamps**| `text-[11px]` or `text-xs` | `text-xs` or `text-sm` | `font-quicksand-bold` / `medium` | Subtitle Gray (`#9CA3AF`) |

---

### 5. Developmental Domain Practice Chart (Teacher Side Blueprint)
Reference file: [components/teacher/analytics/student-analytics/student-developmental-domain-practice.tsx](file:///c:/Projects/Capstone/autivity/components/teacher/analytics/student-analytics/student-developmental-domain-practice.tsx)

#### A. Header Row (Title + Info Tooltip + Tactile Period Filter)
- **Container**: `flex-row items-center justify-between flex-wrap gap-2 mb-4`
- **Left (Title & Collapsible Info Icon)**:
  - Container: `flex-row items-center gap-2`
  - **Title**: `font-fredoka-one text-[#484A4B]` (Mobile: `text-[22px]`, Tablet: `text-[32px]`) -> `"Developmental Domain Practice"`
  - **Info Button**: `<Pressable className="active:opacity-75 p-1"><Feather name="info" size={isTablet ? 20 : 16} color="#62A9E6" /></Pressable>`
- **Right (Tactile Period Dropdown Trigger)**:
  - Container / Pressable:
    - `flex-row items-center justify-center gap-1.5 bg-white border-[2px] border-[#BBE8FB] px-3 h-[34px] rounded-xl active:scale-95 transition-transform`
    - Tactile 3D shadow: `shadowColor: '#BBE8FB', shadowOffset: { width: 0, height: 2 }, elevation: 2`
  - Content: Calendar icon (`#62A9E6`, size 13), Label `font-fredoka-one text-[#62A9E6] text-[11px] uppercase` (e.g. `"OVERALL"`, `"THIS WEEK"`), and chevron-down icon.

#### B. Educational Info Banner (Collapsible Pop-down)
- Rendered conditionally when info button is toggled:
  - Container: `bg-[#F0F9FF] border-[2px] border-[#BBE8FB] rounded-2xl p-3.5 mt-3 flex-row items-start gap-2.5`
  - Content: Icon + `font-fredoka-one text-[#62A9E6] text-xs sm:text-sm` header (`"WHAT DOES THIS SECTION MEAN?"`) + bullet points in `font-quicksand-medium text-[11px] sm:text-xs text-[#484A4B] leading-relaxed`.

#### C. Outer Container Card
- Styling: `w-full bg-white border-[4px] border-[#F1F1F1] rounded-[20px] sm:rounded-[32px] p-4 sm:p-6`
- Tactile Shadow: `shadowColor: '#F1F1F1', shadowOffset: { width: 0, height: 2 }, elevation: 2`

#### D. Master Domain Accordion Cards (Grouped by Developmental Domain)
Each domain is wrapped in an interactive accordion card:
- Container: `bg-[#F8FAFC] border-[2px] border-[#F1F1F1] rounded-2xl p-3.5 sm:p-4 overflow-hidden`
- **Clickable Header**:
  - **Left**:
    - Domain Icon Badge: `w-8 h-8 sm:w-9 sm:h-9 rounded-xl items-center justify-center` with domain-specific background (`pillBg`) and icon color (`endColor`).
    - Domain Title: `font-fredoka-one text-sm sm:text-base text-[#484A4B]`.
    - Total Practice & Score Tag: `px-2.5 py-0.5 rounded-md bg-[#F1F5F9]` with `font-fredoka-one text-[11px] sm:text-xs text-[#64748B] uppercase` -> `{total} practices • {score} avg`.
    - Priority Alerts (if applicable):
      - Lowest Practice: `bg-[#FFFBEB] border border-[#FFF3C4]` with text `font-fredoka-one text-[11px] text-[#D97706] uppercase` (`"LOWEST PRACTICE"`).
      - Lowest Score: `bg-[#FFF7ED] border border-[#FFDBD4]` with text `font-fredoka-one text-[11px] text-[#FF8870] uppercase` (`"LOWEST SCORE"`).
  - **Right**:
    - Circular Chevron Plate: `w-6 h-6 rounded-full bg-white border border-[#E5E7EB]/60` with `chevron-up`/`chevron-down` in `#9CA3AF`.

#### E. Horizontal Bar Chart & Interactive Popover (Expanded Body)
Inside each expanded domain:
- Animated container: `entering={FadeInUp.duration(200)} exiting={FadeOutUp.duration(150)} mt-3.5 pt-3.5 border-t border-[#F1F1F1] flex-col gap-4`.
- **Each Skill Row**:
  - **Category Label (Y-Axis)**: Fixed width `w-24 sm:w-36 pr-1 sm:pr-2`, `font-quicksand-bold text-xs text-[#484A4B]`, 2-line clamp.
  - **Bar Plot Canvas**:
    - Flex container: `flex-1 h-8 justify-center relative active:opacity-90`.
    - **SVG Dashed Grid Lines**: Vertical lines at `(tick / maxScale) * 100%` with `stroke="#F3F4F6"` and `strokeDasharray="4,4"`.
    - **Horizontal Bar (SVG Rect)**: Height 16px, `rx="4"`, solid domain theme color (e.g. `#62A9E6`, `#179D33`, etc.), `opacity: isSelected ? 1 : 0.88`. Minimum visible width `Math.max(2, barWidthPercent)%`.
  - **Interactive Popover Tooltip (On Tap)**:
    - Floating badge pinned above the bar at `left: ${Math.max(2, Math.min(barWidthPercent, 65))}%`, `-top-7`.
    - Styling: `bg-white border-[2px] border-[#BBE8FB] px-2.5 py-1 rounded-xl shadow-md z-30 pointer-events-none`.
    - Displays exact practice count and star average score (`★ {avgScore} / 4.0`).
- **X-Axis Scale Ticks**:
  - Horizontal border separator: `mt-5 pt-2 border-t border-[#E5E7EB]`.
  - Spaced labels matching the grid lines (`font-quicksand-bold text-[11px] text-[#9CA3AF]`).
- **Footer Tap Hint**:
  - `font-quicksand-medium text-[11px] text-[#9CA3AF] italic text-right` -> `"Tap any bar to view exact practice count"`.

---

### 6. Status Pills Standard (Milestones & Sessions Unified)
References: 
- [components/teacher/analytics/student-analytics/milestones.tsx](file:///c:/Projects/Capstone/autivity/components/teacher/analytics/student-analytics/milestones.tsx#L480-L496)
- [components/teacher/analytics/student-analytics/sessions.tsx](file:///c:/Projects/Capstone/autivity/components/teacher/analytics/student-analytics/sessions.tsx#L566-L586)

All status indicators on list items (milestones, session evaluations) follow this exact specification:
- **Shape & Container**:
  - `px-3 py-1 rounded-[8px] border-[2px] flex-row items-center gap-1 shrink-0`
- **Typography**:
  - `font-fredoka-one uppercase text-[11px] sm:text-xs`
- **Color Mapping (Theme Stroke & Fill)**:
  | Status | Background Fill | Border Stroke | Text & Icon Accent |
  | :--- | :--- | :--- | :--- |
  | **Achieved / Evaluated** | `#CBFAC4` (Green fill) | `#CBFAC4` | `#179D33` (Green accent) |
  | **In Progress** | `#FFF3C4` (Yellow fill) | `#FFF3C4` | `#FFAE02` (Yellow accent) |
  | **Pending / Needs Attention** | `#FFDBD4` (Orange fill) | `#FFDBD4` | `#FF8870` (Orange accent) |
  | **Not Started / Default** | `#F0F9FF` (Light blue fill) | `#BBE8FB` | `#62A9E6` (Blue accent) |

---

### 7. Completed Sessions Multi-Criteria Filter (Teacher Side Blueprint)
Reference file: [components/teacher/analytics/student-analytics/sessions.tsx](file:///c:/Projects/Capstone/autivity/components/teacher/analytics/student-analytics/sessions.tsx#L318-L356) and [SessionsFilterModal](file:///c:/Projects/Capstone/autivity/components/teacher/analytics/student-analytics/sessions.tsx#L700-L848)

#### A. Trigger & Reset Buttons Row
Positioned on the right side of the section header (`flex-row items-center gap-2`):
- **Tactile Filter Trigger Button**:
  - Container / Pressable:
    - `flex-row items-center justify-center gap-1.5 border-[2px] px-3 h-[34px] rounded-xl active:scale-95 transition-transform`
  - **Dynamic Theme States**:
    - **Inactive (0 active filters)**:
      - Background: `#FFFFFF`
      - Border / Shadow: `#BBE8FB`
      - Text: `font-fredoka-one text-[#62A9E6] text-[11px] uppercase` -> `ALL SESSIONS ({count})`
    - **Active (>0 active filters)**:
      - Background: `#F0F9FF`
      - Border / Shadow: `#62A9E6`
      - Text: `font-fredoka-one text-[#62A9E6] text-[11px] uppercase` -> e.g. `PENDING ({count})` or `FILTERS (2) • {count}`
  - Tactile 3D Shadow:
    ```js
    shadowColor: activeFilterCount > 0 ? '#62A9E6' : '#BBE8FB',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 2,
    ```
  - Icons: `<Feather name="filter" size={13} color="#62A9E6" />` on left, `<Feather name="chevron-down" size={13} color="#62A9E6" />` on right.
- **Tactile Reset Button (Only appears when `activeFilterCount > 0`)**:
  - Container / Pressable:
    - `h-[34px] px-3 rounded-[8px] border-[2px] border-[#FFDBD4] bg-white flex-row items-center justify-center gap-1.5 active:scale-95 transition-transform`
    - Tactile Shadow: `shadowColor: '#FFDBD4', shadowOffset: { width: 0, height: 2 }, elevation: 2`
  - Icon: `<Feather name="rotate-ccw" size={12} color="#FF3B3F" />`
  - Text: `font-fredoka-one text-[11px] text-[#FF3B3F] uppercase` -> `"RESET"`

---

#### B. Sessions Filter Modal (`BaseModal`)
Opens on trigger tap. Header title: `"Filter Sessions"`.
Contains **3 filter categories**, each with a title and a horizontal row of 3 tactile selector buttons:
1. **Section 1: Evaluation Status**:
   - Eyebrow: `font-fredoka-one text-[11px] text-[#9CA3AF] uppercase tracking-wider mb-1.5` -> `"EVALUATION STATUS"`
   - Row options:
     - `All ({total})` (icon: `layers`)
     - `Pending ({count})` (icon: `clock`)
     - `Evaluated ({count})` (icon: `check-circle`)
2. **Section 2: Activity Source**:
   - Eyebrow: `"ACTIVITY SOURCE"`
   - Row options:
     - `All ({total})` (icon: `grid`)
     - `App ({count})` (icon: `tablet`)
     - `Classroom ({count})` (icon: `book-open`)
3. **Section 3: Assistance & Milestone**:
   - Eyebrow: `"ASSISTANCE & MILESTONE"`
   - Row options:
     - `All ({total})` (icon: `list`)
     - `Independent ({count})` (icon: `award`)
     - `Assisted ({count})` (icon: `help-circle`)

#### C. Filter Modal Button Styling
Each selector button within the rows:
- `flex-1 items-center justify-center rounded-[8px] border-[2px] active:scale-95 transition-transform`
- Padding: `py-2 px-1` (`isTablet ? py-2.5 px-2`)
- **Selected State**:
  - Background: `#BBE8FB` (Theme light fill)
  - Border & Shadow: `#62A9E6` (Solid outline & 2px elevation)
- **Unselected State**:
  - Background: `#FFFFFF`
  - Border & Shadow: `#BBE8FB`
- **Inner Content**:
  - `<Feather name={icon} size={13} color="#62A9E6" />`
  - Text: `font-fredoka-one text-[#62A9E6] text-xs uppercase` (e.g. `PENDING (3)`)

---

### 8. Inline Performance / Achievement Tags Standard
Reference: [components/teacher/analytics/student-analytics/sessions.tsx](file:///c:/Projects/Capstone/autivity/components/teacher/analytics/student-analytics/sessions.tsx#L535-L545) & [components/teacher/analytics/student-analytics/student-recommendations-card.tsx](file:///c:/Projects/Capstone/autivity/components/teacher/analytics/student-analytics/student-recommendations-card.tsx#L122-L134)

For inline semantic tags such as `"TOP PERFORMANCE"`, `"STRENGTH"`, and `"INDEPENDENT"`:
- **No drop shadow or elevation** (clean, flat design).
- **Shape & Padding**: `px-2 py-0.5 rounded-md flex-row items-center gap-1`.
- **Icon**: Feather icon (e.g., `award`, `trending-up`, size 11 on mobile, 13 on tablet).
- **Colors**:
  - Green Strength / Independent: Background `#E8F8EE`, Text & Icon `#179D33`.
  - Font: `font-fredoka-one uppercase text-[11px] sm:text-xs`.

---

### 9. Activity Performance Card UI Standard
Reference file: [components/parent/parent-activity-performance.tsx](file:///c:/Projects/Capstone/autivity/components/parent/parent-activity-performance.tsx)

- **Outer Card Container**:
  - `w-full bg-white border-[4px] border-[#F1F1F1] rounded-[20px] sm:rounded-[32px] p-4 sm:p-6`
  - Tactile Shadow: `shadowColor: '#F1F1F1', shadowOffset: { width: 0, height: 2 }, elevation: 2`
- **Activity Item Rows**:
  - Unified clean neutral background: `bg-[#F8FAFC] border-[2px] border-[#F1F1F1] rounded-2xl p-3.5 sm:p-4` (avoids multi-colored tinted card backgrounds).
  - **Left**: Category color dot (`theme.dotColor`), Title (`font-fredoka-one text-sm sm:text-base text-[#484A4B]`), Activities Count Tag (`px-2 py-0.5 rounded-md bg-[#F1F5F9] border border-[#E2E8F0] font-fredoka-one text-[11px] text-[#64748B]`).
  - **Right**: Single benchmark status pill (`Mastered` / `Developing` / `Needs Support`) using standard 3-tier colors + clean percentage value (`font-fredoka-one text-sm sm:text-base text-[#484A4B]`) without redundant pill boxes.
  - **Progress Bar Track**: Height `h-3.5`, track background `#E5E7EB`, progress fill with solid category accent color (`theme.endColor`).

---

### 10. Progress Over Time Card UI Standard
Reference file: [components/parent/parent-progress-trend.tsx](file:///c:/Projects/Capstone/autivity/components/parent/parent-progress-trend.tsx)

- **Outer Card Container**:
  - `w-full bg-white border-[4px] border-[#F1F1F1] rounded-[20px] sm:rounded-[32px] p-4 sm:p-6`
  - Tactile Shadow: `shadowColor: '#F1F1F1', shadowOffset: { width: 0, height: 2 }, elevation: 2`
- **Trend & Consistency Clarification**:
  - When `trendDifference === 0`:
    - If `averageScore >= 80`: Shows check-circle icon in `#179D33` and badge text `"Mastered"` with explanation `"Consistently maintained high mastery ({averageScore}%) across {period}"`.
    - If `averageScore < 80`: Shows minus icon in `#62A9E6` and badge text `"Steady"` with explanation `"Steady performance maintained at {averageScore}% across {period}"`.
  - Replaces confusing `"No change by 0% vs start of overall period"` messaging with clear, positive mastery reinforcement.

---

### 11. Skill Performance Radar Chart UI Standard
Reference file: [components/parent/parent-skill-performance.tsx](file:///c:/Projects/Capstone/autivity/components/parent/parent-skill-performance.tsx)

- **Outer Card Container**:
  - `w-full bg-white border-[4px] border-[#F1F1F1] rounded-[20px] sm:rounded-[32px] p-4 sm:p-6 items-center`
  - Tactile Shadow: `shadowColor: '#F1F1F1', shadowOffset: { width: 0, height: 2 }, elevation: 2`
- **Radar Spoke Labels (Zero Truncation)**:
  - Generous canvas padding (`svgPadding = 54` tablet, `44` mobile) and adjusted web radius.
  - Multi-word labels (such as *"Sensory Regulation"* or *"Gross Motor Skills"*) dynamically split across 2 `<tspan>` lines rather than using character clipping (`slice(0, 12)`).
  - Clean `font-quicksand-bold text-[11px] sm:text-xs text-[#484A4B]`.
- **Domain Legend Items (Right Column)**:
  - `bg-[#F8FAFC] border-[2px] border-[#F1F1F1] rounded-2xl p-3`
  - Standardized benchmark badge (`font-fredoka-one text-[11px] uppercase`) + clean percentage typography (`font-fredoka-one text-sm sm:text-base text-[#484A4B]`).

---

### 12. User Notes & Custom Requirements
*(Tell me what specifically you want to preserve, adapt, or remember, and they will be listed here)*

---
