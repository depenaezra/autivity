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

### 3. Back Button Standard Specification
All screen layout back buttons must strictly use the standard `<HeaderButton>` component from `components/header-button.tsx`.
*   **Icon**: `<Ionicons name="caret-back" size={isTablet ? 30 : 24} color="#62A9E6" />` wrapped in a `<View style={{ marginLeft: -3, marginTop: -1 }}>` for precise caret centering.
*   **Container**: `w-[44px] h-[44px] rounded-xl bg-white border-[2px] border-[#BBE8FB]`.
*   **Tactile Shadow**:
    ```js
    shadowColor: '#BBE8FB',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 2,
    ```
*   **Interaction**: `active:scale-95 transition-transform` and triggers `router.back()` (or custom `onBackPress`).

### 4. Modal Cancel Button Specification
Modal cancel buttons (e.g., in `BaseModal`, `AddClassModal`, `ExportFormatModal`) use the tactile neutral outline design:
*   **Background**: `#FFFFFF`
*   **Border**: `border-[2px] border-[#F1F1F1]`
*   **Corner Radius**: `rounded-[8px]`
*   **Padding**: `py-4` (vertical padding)
*   **Tactile Shadow**:
    ```js
    shadowColor: '#F1F1F1',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 2,
    ```
*   **Font & Color**: `font-fredoka-one text-[#9CA3AF] text-base uppercase`
*   **Pressed State**: `active:scale-95 transition-transform`

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

### 3. Swipe Action Menu Specification (Swipable Cards)
Any swipable list item (e.g., Student List, Lesson Materials, Notifications) must follow this exact design and animation specification (matching the Student List action menu):

*   **No Outer Box/Pill Around Actions**: Action items are rendered as bare icons with text underneath directly on the row background (no background cards, borders, or pills around individual action buttons).
*   **Component**: `Swipeable` from `react-native-gesture-handler/Swipeable` (`friction={2}`, `overshootRight={false}`).
*   **Action Menu Row**: `<View className="flex-row items-center justify-end pl-4 pr-1 bg-transparent" style={{ height: '100%' }}>`.
*   **Button Container**: `<Pressable className="flex-col items-center justify-center active:scale-95 transition-transform" style={{ width: isTablet ? 72 : 56 }}>`.
*   **Icons**: Bare SVG icon (e.g., `DeleteIcon` from `assets/images/teacher/class/icon-button-delete.svg`, `EditIcon`, `AssignIcon`, `MoveIcon`, or Ionicons size `22` / tablet `26`) wrapped in `<View className="items-center justify-center" style={{ height: isTablet ? 32 : 26 }}>`.
*   **Typography**: Bold UPPERCASE `font-fredoka-one text-center w-full px-1` (`text-[10px] mt-1.5` on Mobile | `text-[12px] mt-2` on Tablet) with `numberOfLines={1}` and `adjustsFontSizeToFit`.
*   **Colors**:
    *   **Primary / Edit / Assign / Move / Read Action**: `#62A9E6` (Blue icon & text)
    *   **Destructive / Delete Action**: `#FF3B3F` (Red icon & text)
*   **Single-Open Ref Management**: Track active open swipeable with `openSwipeableRef` and close previous card inside `onSwipeableWillOpen`.
*   **Staggered Animation Settings**:
    Actions inside `renderRightActions(progress)` use staggered springy interpolation for scale, opacity, and X-translation:
    ```js
    // Action 1 (Primary / Read / Edit)
    const action1Scale = progress.interpolate({
      inputRange: [0, 0.4, 1],
      outputRange: [0.5, 1.1, 1],
      extrapolate: 'clamp',
    });
    const action1Opacity = progress.interpolate({
      inputRange: [0, 0.3, 1],
      outputRange: [0, 0.8, 1],
      extrapolate: 'clamp',
    });
    const action1TransX = progress.interpolate({
      inputRange: [0, 1],
      outputRange: [15, 0],
      extrapolate: 'clamp',
    });

    // Action 2 (Delete / Secondary)
    const deleteScale = progress.interpolate({
      inputRange: [0.2, 0.6, 1],
      outputRange: [0.5, 1.1, 1],
      extrapolate: 'clamp',
    });
    const deleteOpacity = progress.interpolate({
      inputRange: [0.2, 0.5, 1],
      outputRange: [0, 0.8, 1],
      extrapolate: 'clamp',
    });
    const deleteTransX = progress.interpolate({
      inputRange: [0, 1],
      outputRange: [5, 0],
      extrapolate: 'clamp',
    });
    ```

---

## 🔄 Interaction States & Animations

*   **Micro-interactions**: Always add `active:scale-95 transition-transform` on Pressables for responsive tactile feedback.
*   **Springs & Timings**: Use React Native Reanimated `withTiming` with custom Easing (like `Easing.out(Easing.ease)` or `Easing.quad`) for UI transitions such as press scale or modal entrance slides.
*   **Haptics**: Always trigger `Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)` (or `Medium` for delete) on swipe action button releases.

