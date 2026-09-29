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

    // 1. Pick 'n Choose Patterns
    if (
        lower.includes("pick the matching word") ||
        lower.includes("look at the picture") ||
        lower.includes("tap the word that matches") ||
        lower.includes("matches the picture") ||
        lower.includes("matching word") ||
        lower.includes("choose the correct word") ||
        lower.includes("choose the correct answer") ||
        lower.includes("what item is this")
    ) {
        return "Tingnan ang larawan at piliin ang tamang salita!";
    }

    // 2. Tracing Patterns
    if (
        lower.includes("dragging the pencil") ||
        lower.includes("trace along the dotted line") ||
        lower.includes("trace the dotted line")
    ) {
        return "Sundan ang linya gamit ang lapis!";
    }
    if (lower.startsWith("trace")) {
        if (lower.includes("line")) return "Sundan ang linya mula simula hanggang dulo!";
        if (lower.includes("shape")) return "Sundan ang hugis mula simula hanggang dulo!";
        if (lower.includes("letter")) return "Sundan ang titik mula simula hanggang dulo!";
        if (lower.includes("number")) return "Sundan ang numero mula simula hanggang dulo!";
        return "Sundan ang linya!";
    }

    // 3. Drag & Drop Matching Patterns
    if (lower.includes("matching colors") || lower.includes("matching color") || lower.includes("to the correct color")) {
        return "I-drag ang mga gamit sa kanilang katugmang kulay!";
    }
    if (lower.includes("drag the animals") || lower.includes("matching animal") || lower.includes("matching animals")) {
        return "I-drag ang mga hayop sa kanilang katugmang hugis!";
    }
    if (lower.includes("matching category") || lower.includes("matching categories") || lower.includes("category container") || lower.includes("category containers") || lower.includes("correct category")) {
        return "I-drag ang mga gamit sa kanilang tamang kategorya!";
    }
    if (lower.includes("matching shapes") || lower.includes("drag the fruits")) {
        return "I-drag ang mga prutas sa kanilang katugmang hugis!";
    }
    if (lower.includes("matching targets") || lower.includes("drag the items")) {
        return "I-drag ang mga gamit sa kanilang katugmang lalagyan!";
    }

    const colorCategoryMatch = trimmed.match(/What is the color of the (.+?)\? Drag them to the correct color!/i);
    if (colorCategoryMatch) {
        const catKey = colorCategoryMatch[1].trim().toLowerCase().replace(/\s+/g, '_');
        const catTl = CATEGORY_TRANSLATIONS[catKey]?.tl || colorCategoryMatch[1];
        return `Ano ang kulay ng mga ${catTl}? I-drag ang mga ito sa tamang kulay!`;
    }

    // 4. Sequencing Patterns
    const orderStepsMatch = trimmed.match(/order the steps \((?:1\s+(?:and|to)\s+(\d+))\)/i);
    if (orderStepsMatch) {
        return `I-drag ang mga larawan nang sunod-sunod mula 1 hanggang ${orderStepsMatch[1]}!`;
    }
    const sequenceMatch = trimmed.match(/from 1 to (\d+)/i);
    if (sequenceMatch) {
        return `I-drag ang mga larawan nang sunod-sunod mula 1 hanggang ${sequenceMatch[1]}!`;
    }
    if (lower.includes("order the steps") || lower.includes("into order") || lower.includes("in order")) {
        return "I-drag ang mga larawan nang sunod-sunod!";
    }

    // 5. Bubble Pop Patterns
    const popCountColorMatch = trimmed.match(/Pop\s+(\d+)\s+([a-zA-Z]+)\s+bubbles!/i);
    if (popCountColorMatch) {
        const count = popCountColorMatch[1];
        const colorKey = popCountColorMatch[2].trim().toLowerCase();
        const colorTl = COLOR_TRANSLATIONS[colorKey]?.tl || popCountColorMatch[2];
        return `Putukin ang ${count} na ${colorTl} na bula!`;
    }

    const popCountMatch = trimmed.match(/Pop\s+(\d+)\s+bubbles!/i);
    if (popCountMatch) {
        return `Putukin ang ${popCountMatch[1]} na bula!`;
    }

    const bubbleColorMatch = trimmed.match(/Pop the (.+?) bubbles!/i);
    if (bubbleColorMatch) {
        const colorKey = bubbleColorMatch[1].trim().toLowerCase();
        const colorTl = COLOR_TRANSLATIONS[colorKey]?.tl || bubbleColorMatch[1];
        return `Putukin ang mga ${colorTl} na bula!`;
    }
    if (lower.includes("pop") && lower.includes("bubble")) {
        return "Putukin ang mga bula!";
    }

    // 6. Turn-Taking Patterns
    if (
        trimmed === "Choose a classmate to play with." ||
        lower.includes("choose a classmate") ||
        lower.includes("choose a partner") ||
        lower.includes("select player 2") ||
        lower.includes("start playing together")
    ) {
        return "Pumili ng kapareha para magkasamang maglaro!";
    }
    if (
        trimmed === "Let us spin the wheel to see who goes first!" ||
        lower.includes("spin the wheel") ||
        lower.includes("takes the first turn") ||
        lower.includes("who goes first")
    ) {
        return "Paikutin ang roleta para malaman kung sino ang unang magte-trace!";
    }

    const firstPlayerMatch = trimmed.match(/Great!\s*(.+?)\s*goes first!/i);
    if (firstPlayerMatch) {
        return `Magaling! Si ${firstPlayerMatch[1]} ang mauuna!`;
    }
    const turnChangeMatch = trimmed.match(/Great job,?\s*(.+?)!\s*Now it(?:'s|\s+is|’s)\s*(.+?)(?:'s|’s)\s*turn!/i);
    if (turnChangeMatch) {
        return `Magaling, ${turnChangeMatch[1]}! Ngayon ay turn na ni ${turnChangeMatch[2]}!`;
    }
    const turnMatch = trimmed.match(/It's\s*(.+?)'s turn!\s*Please wait for your turn\./i);
    if (turnMatch) {
        return `Ikaw na, ${turnMatch[1]}! Hintayin muna ang susunod mong turn.`;
    }
    if (lower.includes("amazing teamwork") || lower.includes("both students finished")) {
        return "Napakagaling na pagtutulungan! Natapos ninyong dalawa ang lahat ng aktibidad! 🎉";
    }
    if (lower.includes("stay close to the dotted line") || lower.includes("stay close to the line")) {
        return "Manatili sa linya at magpatuloy nang dahan-dahan!";
    }
    if (lower.includes("drag the pencil along the dotted line") || lower.includes("drag the pencil along the line")) {
        return "I-drag ang lapis sa linya mula simula hanggang dulo!";
    }
    if (lower.includes("class id was not found")) {
        return "Hindi nahanap ang Class ID.";
    }
    if (lower.includes("could not load classmates")) {
        return "Hindi ma-load ang mga kaklase.";
    }

    // 7. Tracing & Motor Guidance Patterns
    if (lower.includes("stay on the line")) {
        return "Manatili sa linya! Magpatuloy nang dahan-dahan!";
    }
    if (lower.includes("follow the dotted path") || lower.includes("follow the dotted line") || lower.includes("follow the path")) {
        return "Malapit na! Sundan ang linya mula simula hanggang dulo!";
    }
    if (lower.includes("without lifting your finger")) {
        return "Magandang pagsubok! Subukang gumuhit nang dahan-dahan nang hindi inaangat ang daliri!";
    }
    if (lower.includes("keep your finger on the line")) {
        return "Panatilihin ang iyong daliri sa linya at sundan ang daan!";
    }
    if (lower.includes("start at the green circle")) {
        return "Pahiwatig: Magsimula sa berdeng bilog at sundan ang linya hanggang sa pulang bilog!";
    }
    if (lower.includes("look closely at the choices")) {
        return "Pahiwatig: Tingnang mabuti ang mga pagpipilian!";
    }

    // 8. Hint Patterns
    const hintWordMatch = trimmed.match(/Clue:\s*The correct word starts with\s*([A-Z])\s*and ends with\s*([A-Z])!/i);
    if (hintWordMatch) {
        return `Pahiwatig: Ang tamang salita ay nagsisimula sa titik ${hintWordMatch[1]} at nagtatapos sa titik ${hintWordMatch[2]}!`;
    }

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
    if (lower.includes("not quite in order") || lower.includes("different position")) {
        return "Hindi pa sunod-sunod! Subukang ilagay ang hakbang sa tamang posisyon. 💪";
    }
    if (lower.includes("not quite") || lower.includes("try again") || lower.includes("give it another") || lower.includes("which word matches")) {
        return "Hindi pa tama, subukan muli! 💪";
    }
    if (lower.includes("almost")) {
        return "Halos tumama na! Subukan muli! 🌟";
    }

    // 10. Step success matches
    const stepCorrectMatch = trimmed.match(/Great job!\s*Step\s*(\d+)\s*is correct!/i);
    if (stepCorrectMatch) {
        return `Magaling! Tama ang Hakbang ${stepCorrectMatch[1]}! ⭐`;
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
