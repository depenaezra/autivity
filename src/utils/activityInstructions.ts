/**
 * Activity Instructions & Dialogue Translation Engine
 * Supports bilingual (English / Tagalog) rendering of student activity prompts.
 */

export type ActivityLanguage = 'en' | 'tl';

export const COLOR_TRANSLATIONS: Record<string, { en: string; tl: string }> = {
    red: { en: 'red', tl: 'pula' },
    blue: { en: 'blue', tl: 'asul' },
    green: { en: 'green', tl: 'berde' },
    yellow: { en: 'yellow', tl: 'dilaw' },
    orange: { en: 'orange', tl: 'kahel' },
    purple: { en: 'purple', tl: 'lila' },
    pink: { en: 'pink', tl: 'rosas' },
    white: { en: 'white', tl: 'puti' },
    black: { en: 'black', tl: 'itim' },
    brown: { en: 'brown', tl: 'tsokolate' },
};

export const CATEGORY_TRANSLATIONS: Record<string, { en: string; tl: string }> = {
    toys: { en: 'toys', tl: 'laruan' },
    school_supplies: { en: 'school supplies', tl: 'gamit sa paaralan' },
    clothing: { en: 'clothing', tl: 'damit' },
    household_items: { en: 'household items', tl: 'gamit sa bahay' },
    fruits: { en: 'fruits', tl: 'prutas' },
    items: { en: 'items', tl: 'gamit' },
};

export const PRAISE_MESSAGES_TL = [
    "Magaling! 🌟",
    "Napakagaling! 🎉",
    "Nagawa mo! ⭐",
    "Mahusay! 👏",
    "Kahanga-hanga! 🚀",
    "Napakahusay! 💖",
    "Natatangi ka! 🏆",
    "Ipagpatuloy mo 'yan! 💪",
];

export const PRAISE_MESSAGES_EN = [
    "Good job! 🌟",
    "Awesome! 🎉",
    "You did it! ⭐",
    "Great work! 👏",
    "Amazing! 🚀",
    "Fantastic! 💖",
    "Superb! 🏆",
    "Keep it up! 💪",
];

export const TIME_ALMOST_UP_MESSAGES_TL = [
    "Bilisan mo, malapit nang maubos ang oras! Kaya mo 'yan! ⏰",
    "Halos maubos na ang oras! Tuloy-tuloy lang, kaya mo 'yan! ⏳",
    "Kaunting oras na lang ang natitira! Ipagpatuloy mo 'yan! ⏰",
    "Isang minuto na lang! Tapusin nang buong galing! 🌟",
];

export const TIME_ALMOST_UP_MESSAGES_EN = [
    "Hurry, time is almost up! You've got this! ⏰",
    "Almost out of time! Keep going, you can do it! ⏳",
    "Just a little time left! Keep it up! ⏰",
    "Only a minute left! Finish strong! 🌟",
];

export const TIME_UP_MESSAGES_TL = [
    "Ubos na ang oras! Napakahusay ng iyong pagsisikap ngayon! 🎉",
    "Tapos na ang oras! Napakagandang trabaho sa pagsubok ng iyong makakaya! 🌟",
];

export const TIME_UP_MESSAGES_EN = [
    "Time is up! Great effort today! 🎉",
    "Time's up! Wonderful job trying your best! 🌟",
];

/**
 * Translates a given activity instruction text to Tagalog or English based on known patterns.
 */
export function translateInstruction(
    text: string,
    language: ActivityLanguage = 'en'
): string {
    if (!text || language === 'en') return text;

    const trimmed = text.trim();

    // 1. Exact phrase matches & common activity prompts
    const lower = trimmed.toLowerCase();

    if (trimmed === "Let's play!" || trimmed === "Let's play") {
        return "Maglaro tayo!";
    }
    if (trimmed === "What item is this? Choose the correct word!" || lower.includes("choose the correct word") || lower.includes("choose the correct answer")) {
        return "Ano ang bagay na ito? Piliin ang tamang salita!";
    }
    if (trimmed === "Drag the items to their matching targets!" || lower === "drag the items to their matching targets") {
        return "I-drag ang mga gamit sa kanilang katugmang lalagyan!";
    }
    if (trimmed === "Drag the fruits to their matching shapes!" || lower.includes("drag the fruits")) {
        return "I-drag ang mga prutas sa kanilang katugmang hugis!";
    }
    if (trimmed === "Choose a classmate to play with.") {
        return "Pumili ng kaklase na makakalaro.";
    }
    if (trimmed === "Let us spin the wheel to see who goes first!") {
        return "Paikutin natin ang roleta para malaman kung sino ang mauuna!";
    }
    if (trimmed === "Pop the bubbles!" || lower === "pop the bubbles" || lower === "pop all the bubbles!") {
        return "Putukin ang mga bula!";
    }
    if (trimmed === "Here is a hint to help you!" || lower.includes("here is a hint")) {
        return "Narito ang isang pahiwatig para tulungan ka!";
    }
    if (trimmed === "Stay on the line! Keep going smoothly!") {
        return "Manatili sa linya! Magpatuloy nang dahan-dahan!";
    }
    if (trimmed === "Almost there! Follow the dotted path from start to end!") {
        return "Malapit na! Sundan ang putol-putol na linya mula simula hanggang dulo!";
    }
    if (trimmed === "Nice try! Try tracing slowly without lifting your finger!") {
        return "Magandang pagsubok! Subukang gumuhit nang dahan-dahan nang hindi inaangat ang daliri!";
    }
    if (trimmed === "Keep your finger on the line and follow the path!") {
        return "Panatilihin ang iyong daliri sa linya at sundan ang daan!";
    }
    if (lower.includes("start at the green circle and trace along the dotted line")) {
        return "Pahiwatig: Magsimula sa berdeng bilog at sundan ang putol-putol na linya hanggang sa pulang bilog!";
    }

    // 2. Tracing Pattern Matches
    if (lower.startsWith("trace")) {
        if (lower.includes("line")) return "Sundan ang linya mula simula hanggang dulo!";
        if (lower.includes("shape")) return "Sundan ang hugis mula simula hanggang dulo!";
        if (lower.includes("letter")) return "Sundan ang titik mula simula hanggang dulo!";
        if (lower.includes("number")) return "Sundan ang numero mula simula hanggang dulo!";
        return "Sundan ang putol-putol na linya!";
    }

    // 3. Pattern: "What is the color of the {category}? Drag them to the correct color!"
    const colorCategoryMatch = trimmed.match(/What is the color of the (.+?)\? Drag them to the correct color!/i);
    if (colorCategoryMatch) {
        const catKey = colorCategoryMatch[1].trim().toLowerCase().replace(/\s+/g, '_');
        const catTl = CATEGORY_TRANSLATIONS[catKey]?.tl || colorCategoryMatch[1];
        return `Ano ang kulay ng mga ${catTl}? I-drag ang mga ito sa tamang kulay!`;
    }

    // 4. Pattern: "Pop the {color} bubbles!"
    const bubbleColorMatch = trimmed.match(/Pop the (.+?) bubbles!/i);
    if (bubbleColorMatch) {
        const colorKey = bubbleColorMatch[1].trim().toLowerCase();
        const colorTl = COLOR_TRANSLATIONS[colorKey]?.tl || bubbleColorMatch[1];
        return `Putukin ang mga ${colorTl} na bula!`;
    }

    // 5. Pattern: "Drag the pictures/cards into order from 1 to {count}!"
    const sequenceMatch = trimmed.match(/Drag the (?:pictures|cards) into order from 1 to (\d+)!/i);
    if (sequenceMatch) {
        return `I-drag ang mga larawan nang sunod-sunod mula 1 hanggang ${sequenceMatch[1]}!`;
    }
    if (lower.includes("into order") || lower.includes("in order")) {
        return "I-drag ang mga larawan nang sunod-sunod!";
    }

    // 6. Pattern: "Great! {name} goes first!"
    const firstPlayerMatch = trimmed.match(/Great!\s*(.+?)\s*goes first!/i);
    if (firstPlayerMatch) {
        return `Magaling! Si ${firstPlayerMatch[1]} ang mauuna!`;
    }

    // 7. Pattern: "It's {name}'s turn! Please wait for your turn."
    const turnMatch = trimmed.match(/It's\s*(.+?)'s turn!\s*Please wait for your turn\./i);
    if (turnMatch) {
        return `Ikaw na, ${turnMatch[1]}! Hintayin muna ang susunod mong turn.`;
    }

    // 8. Hint Patterns
    const hintStepMatch = trimmed.match(/Hint:\s*Step\s*(\d+)\s*is\s*"(.+?)"!/i);
    if (hintStepMatch) {
        return `Pahiwatig: Ang Hakbang ${hintStepMatch[1]} ay "${hintStepMatch[2]}"!`;
    }

    const hintColorMatch = trimmed.match(/Hint:\s*Look for the\s*(.+?)\s*item\./i);
    if (hintColorMatch) {
        const colorKey = hintColorMatch[1].trim().toLowerCase();
        const colorTl = COLOR_TRANSLATIONS[colorKey]?.tl || hintColorMatch[1];
        return `Pahiwatig: Hanapin ang kulay ${colorTl} na gamit.`;
    }

    // 9. Feedback / Struggle patterns
    if (lower.includes("not quite") || lower.includes("try again") || lower.includes("give it another")) {
        return "Hindi pa tama, subukan muli! 💪";
    }
    if (lower.includes("almost")) {
        return "Halos tumama na! Subukan muli! 🌟";
    }

    // 10. Praise translation lookup
    if (lower.includes("incredible job") || lower.includes("finished all 3")) {
        return "Napakagaling! Natapos mo ang lahat ng 3 gawain! 🎉";
    }
    if (lower.includes("you're a star") || lower.includes("you are a star")) {
        return "Ikaw ay isang bituin! ⭐";
    }
    if (lower.includes("superb")) {
        return "Natatangi ka! 🏆";
    }
    if (lower.includes("amazing")) {
        return "Kahanga-hanga! 🚀";
    }
    if (lower.includes("fantastic")) {
        return "Napakahusay! 💖";
    }
    if (lower.includes("awesome") || lower.includes("excellent")) {
        return "Napakagaling! 🎉";
    }
    if (lower.includes("good job") || lower.includes("great job") || lower.includes("well done") || lower.includes("great work")) {
        return "Magaling! 🌟";
    }

    return trimmed;
}

/**
 * Gets a random praise message based on language.
 */
export function getRandomPraiseMessage(language: ActivityLanguage = 'en'): string {
    const list = language === 'tl' ? PRAISE_MESSAGES_TL : PRAISE_MESSAGES_EN;
    return list[Math.floor(Math.random() * list.length)];
}

/**
 * Gets a random "time almost up" alert based on language.
 */
export function getRandomTimeAlmostUpMessage(language: ActivityLanguage = 'en'): string {
    const list = language === 'tl' ? TIME_ALMOST_UP_MESSAGES_TL : TIME_ALMOST_UP_MESSAGES_EN;
    return list[Math.floor(Math.random() * list.length)];
}

/**
 * Gets a random "time up" alert based on language.
 */
export function getRandomTimeUpMessage(language: ActivityLanguage = 'en'): string {
    const list = language === 'tl' ? TIME_UP_MESSAGES_TL : TIME_UP_MESSAGES_EN;
    return list[Math.floor(Math.random() * list.length)];
}
