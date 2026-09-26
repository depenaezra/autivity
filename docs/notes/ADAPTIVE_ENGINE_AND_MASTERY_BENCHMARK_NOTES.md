# Adaptive Difficulty Engine & Mastery Benchmark Notes

> **Purpose:** Reference guide for the relationship between the **80%–90% Mastery Accuracy Criterion**, the **Adaptive Difficulty Engine**, and **App-wide Consistency** for future review and panel defense preparation.

---

## 1. Core Logic of the Adaptive Difficulty Engine (Simple & Clear)

### 🎯 The Straightforward Rule
The adaptive engine operates on a direct, intuitive rule:
* **High Accuracy / Few Mistakes ($\le 2.0$ mistakes / $\ge 80\%$):** $\rightarrow$ **Increase Difficulty (Level Up / Advance Skill)**.
* **Low Accuracy / Many Mistakes ($> 2.0$ mistakes / $< 80\%$):** $\rightarrow$ **Maintain or Decrease Difficulty (Stay or Level Down / Provide Scaffolding)**.

### 🎤 How to State this Simply in Defense / Thesis Paper:
> *"AutiVity's Adaptive Difficulty Engine uses an 80% accuracy threshold based on ABA mastery criteria: when a learner achieves $\ge 80\%$ accuracy ($\le 2$ mistakes in a 10-item session), the engine advances them to the next difficulty level; when accuracy drops below 80%, the engine maintains or reduces difficulty to prevent task fatigue and learner frustration."*

### Why the 80% Threshold Works in ASD Education:
1. **Prevents Task Fatigue & Frustration:** Demanding 100% accuracy on early developmental tasks causes prompt dependency, anxiety, and task aversion in children with ASD.
2. **Allows Natural Behavioral Variance:** The 20% error margin accommodates motor slips, momentary attention shifts, or sensory distractions without penalizing the child.
3. **Keeps the Learner in the Zone of Proximal Development (ZPD):** Advancing at 80% ensures the task remains engaging rather than boring or repetitive.

### 🛡️ Recommended Engine Safeguard (When Ready to Review Engine Code):
* **Multi-Session Criterion:** Difficulty progression should ideally require meeting the $\ge 80\%$ threshold across **2 to 3 consecutive sessions** (or a rolling average) rather than a single accidental or lucky attempt.

---

## 2. Universal 3-Tier Legend Across All App Analytics & Alert Pills

To ensure complete clarity and consistency across all cards, charts, calculation modals, and alert badges, AutiVity uses **ONE Universal 3-Tier Legend**:

| Tier | Accuracy & Performance Range | KPI Card Status | Recommendation Alert Pill | Clinical / Pedagogical Meaning |
| :--- | :--- | :--- | :--- | :--- |
| 🟢 **Tier 1: Mastered** | $\ge 80\%$ Accuracy<br>$\le 2.0$ Mistakes<br>$\le 1.0$ Hint<br>Rubric Score $\ge 3.2 / 4.0$ | **`● Target Met`** | `TOP PERFORMANCE` | Skill is acquired/mastered; student is proficient and ready for next difficulty level. |
| 🟡 **Tier 2: Developing** | $65\% – 79\%$ Accuracy<br>$2.1 – 3.5$ Mistakes<br>$1.1 – 2.0$ Hints<br>Rubric Score $2.6 – 3.1 / 4.0$ | **`● Developing`** | `NEEDS ATTENTION` | Student understands the concept but requires ongoing practice and prompt fading. |
| 🔴 **Tier 3: Needs Support** | $< 65\%$ Accuracy<br>$> 3.5$ Mistakes<br>$> 2.0$ Hints<br>Rubric Score $< 2.6 / 4.0$ | **`● Needs Support`** | `NEEDS SUPPORT` | Student struggles with current task; system maintains/lowers level and prompts teacher guidance. |

---

## 3. Cooper et al. (2020) — The 4 Stages of Learning

In behavioral therapy and special education (*Cooper, Heron, & Heward, 2020, Chapters 17 & 28*), learning progress is categorized into four stages:

1. **Acquisition Stage:** Initial learning of a new skill. Instructional progression is triggered when the learner reaches **$\ge 80\%–90\%$ accuracy** ($\le 2$ errors), confirming the concept is acquired.
2. **Fluency / Proficiency Stage:** Performing the acquired skill accurately and smoothly without excessive hesitation or assistance.
3. **Maintenance Stage:** Retaining the ability to perform the skill over time after direct instructional prompting has ended.
4. **Generalization Stage:** Successfully applying the mastered skill across different activity formats, visual stimuli, and real-world settings.

---

## 4. Addressing the Richling et al. (2019) Maintenance Finding

### The Question:
> *Richling et al. (2019) in the Journal of Applied Behavior Analysis (JABA) observed that while 80% accuracy across 3 sessions is the most common mastery criterion in clinical practice, skills taught solely to an 80% criterion sometimes suffered skill decay during follow-up probes. How does AutiVity account for this?*

### AutiVity's Clinical & System Design Defense:

1. **Initial Acquisition vs. Overlearning:**
   * **80% Accuracy ($\le 2.0$ errors):** Functions as the **Initial Acquisition Criterion**—confirming basic task comprehension and granting positive reinforcement to avoid frustration.
   * **90%–100% Accuracy ($\le 1.0$ error):** Functions as **High Mastery / Overlearning**—which Fuller & Fienup (2018) and Richling et al. (2019) proved produces long-term retention. In AutiVity, $\le 1.0$ error is categorized as *Independent / High Mastery*.

2. **Built-in Maintenance Probes (Periodic Review Loops):**
   * As defined in `docs/PROCESSES.md` (Section F: *Adaptive Difficulty Process*), mastered activities are not permanently removed.
   * The adaptive learning queue periodically re-inserts previously mastered activities as warm-up or review tasks to prevent skill regression.

3. **Teacher-in-the-Loop Validation:**
   * AutiVity is an **AI-Assisted** system, not an unmonitored automated system. 
   * The adaptive engine provides recommendations and highlights performance trends, but the **special education teacher reviews multi-session analytics** before officially signing off on IEP milestone mastery.

---

## 5. Key Literature References

* **Cooper, J. O., Heron, T. E., & Heward, W. L. (2020).** *Applied Behavior Analysis* (3rd ed.). Pearson. (Ch. 17: *Prompting & Fading*; Ch. 28: *Mastery Criteria & Generalization*). ISBN: 978-0134752556.
* **Richling, S. M., Rapp, J. T., Carroll, R. A., Smith, S. W., & Slocum, S. K. (2019).** "The effects of different mastery criteria on the skill maintenance of children with developmental disabilities." *Journal of Applied Behavior Analysis (JABA)*, 52(4), 988–1002. [https://doi.org/10.1002/jaba.630](https://doi.org/10.1002/jaba.630)
* **Fuller, T. C., & Fienup, D. M. (2018).** "A systematic review of mastery criteria and maintenance." *Journal of Applied Behavior Analysis*, 51(2), 399–415. [https://doi.org/10.1002/jaba.448](https://doi.org/10.1002/jaba.448)
* **Arneliza, A., Sutadi, R., Alsa, A., & Yunanto, K. T. (2026).** "Development and Implementation of Smart ME: A Trial-by-Trial Monitoring System for Autism Therapy." *Journal of Culture and Values in Education*, 9(1), 106–124. [https://doi.org/10.46303/jcve.2026.5](https://doi.org/10.46303/jcve.2026.5)
