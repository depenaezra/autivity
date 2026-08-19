# Autivity Design System (Redesigned)

This document defines the user interface (UI) and user experience (UX) guidelines for the **Autivity** application. All new UI modifications and components must strictly adhere to these specifications to ensure a playful, consistent, tactile, and highly polished app experience.

---

## 🎨 Color Palette

### Primary Theme Colors
Themes are used dynamically (e.g., classes can choose green, orange, yellow, or blue theme). Each theme defines a `stroke` (used for border outline and background fill of badges), a `font` (for text and icon accents), and a matching `fill` background.

| Theme | Stroke (Fill/Border) | Font (Text/Icon Accent) | Background Fill (Light) |
| :--- | :--- | :--- | :--- |
| **Blue (Primary)** | `#BBE8FB` | `#62A9E6` | `#BBE8FB` |
| **Green** | `#CBFAC4` | `#179D33` | `#CBFAC4` |
| **Orange** | `#FFDBD4` | `#FF8870` | `#FFDBD4` |
| **Yellow** | `#FFF3C4` | `#FFAE02` | `#FFF3C4` |

### Neutrals
*   **Background (Light)**: `#F5F7FA`
*   **White Container Background**: `#FFFFFF`
*   **Primary Dark Text**: `#484A4B` (Main headers and titles)
*   **Subtitle / Inactive Text**: `#9CA3AF` or `#9EA0A0`
*   **Light Border / Shadow**: `#F1F1F1`
*   **Avatar Border Outline**: `#D9D9D9`
*   **Internal Divider**: `#E5E7EB` (often at `50%` opacity)

---

## 🅰️ Typography

Fonts must use the specified family names registered in `tailwind.config.js`.

| Role | Font Family | Color | Size (Mobile) | Size (Tablet) | Case/Style |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Main Titles / Screen Headers** | `font-fredoka-one` | `#484A4B` | `text-[22px]` to `text-[28px]` | `text-[32px]` to `text-[42px]` | Centered/Left-aligned |
| **Badges / Section Titles** | `font-fredoka-one` | Dynamic | `text-[11px]` to `text-sm` | `text-[14px]` to `text-lg` | UPPERCASE |
| **Buttons (Tactile)** | `font-fredoka-one` | `#62A9E6` / `#9CA3AF` | `text-base` | `text-lg` | UPPERCASE |
| **Body & Inputs** | `font-quicksand-medium` | `#4B5563` | `text-sm` to `text-base` | `text-lg` to `text-xl` | Normal |

---

## 🔘 Buttons & Interactive Selectors

All interactive buttons utilize a playful, tactile "3D click" design using a solid shadow offset rather than an ambient blurred shadow.

### 1. Tactile Custom Buttons (Standard & Selectors)
*   **Shape**: Rounded corners (`rounded-[8px]` or `rounded-xl`).
*   **Border**: `border-[2px] border-[#F1F1F1]` (inactive) or `border-[#BBE8FB]` (active blue).
*   **Background**: `#FFFFFF`
*   **Tactile Shadow**:
    ```js
    shadowColor: '#F1F1F1', // or active theme stroke like '#BBE8FB'
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 2,
    ```
*   **Font**: `font-fredoka-one text-sm` or `text-base`.
*   **Pressed State**: Scaled down slightly (`active:scale-95 transition-transform`).

### 2. Large Action/Submit Button (e.g. Save Modal Buttons)
*   **Height**: Standard auto height with padding (`py-4`).
*   **Font Color**: Active states use the dynamic font accent color (e.g. `#62A9E6` on white background with `#BBE8FB` border/shadow). Inactive states use `#D9D9D9` text with `#F1F1F1` borders.

---

## 📝 Input Fields & Forms

*   **Background**: `#F1F1F1` (light gray background fill)
*   **Shape**: Rounded corners (`rounded-xl` or `rounded-[16px]`)
*   **Height**: Compact padded block (`px-4 py-3`)
*   **Typography**: `font-quicksand-medium` with text color `#4B5563`
*   **Placeholder Color**: `#9CA3AF`
*   **Border**: Default none (outline changes depending on active focus state).

---

## 🗂️ Cards & Modals

### 1. Cards (e.g., Lesson Cards, Class Cards)
*   **Background**: `#FFFFFF`
*   **Shape**: Rounded corners (`rounded-[20px]` on Mobile | `rounded-[32px]` on Tablet).
*   **Border**: Thick border (`border-[4px] border-[#F1F1F1]`).
*   **Tactile Shadow**: Same flat solid shadow (`shadowOffset: { width: 0, height: 2 }, shadowOpacity: 1, shadowRadius: 0`).
*   **Responsiveness**: Adjust layout gaps and paddings explicitly checking `isTablet`.

### 2. Modals (e.g., BaseModal)
*   **Background**: `#FFFFFF`
*   **Shape**: Bottom-aligned drawer or container with `rounded-[32px]` corners.
*   **Border**: Thick outline `border-[4px] border-[#F1F1F1]`.
*   **Paddings**: Generous padding (`px-6 pt-2 pb-6 mx-6 mb-6`).

---

## 🔄 Interaction States & Animations

*   **Micro-interactions**: Always add `active:scale-95 transition-transform` on Pressables for responsive tactile feedback.
*   **Springs & Timings**: Use React Native Reanimated `withTiming` with custom Easing (like `Easing.out(Easing.ease)` or `Easing.quad`) for UI transitions such as press scale or modal entrance slides.
