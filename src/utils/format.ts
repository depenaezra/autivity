/**
 * Formats a tracing/activity path into a human-readable title.
 * Example: "activity/tracing/lines/horizontal" -> "Horizontal Lines"
 * Example: "activity/tracing/lines/diagonal-down" -> "Diagonal Down Lines"
 * Example: "activity/tracing/shapes/circle" -> "Circle Shape"
 * Example: "activity/tracing/letters/a" -> "Letter A"
 */
export const formatActivityTitle = (path: string): string => {
    if (!path) return 'Unknown Activity';

    const formatWords = (value: string) => value
        .split(/[-_]/)
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
    const withSet = (value: string) => {
        const match = value.match(/^(.*?)[-_](\d+)$/);
        return match ? `${formatWords(match[1])} (Set ${match[2]})` : formatWords(value);
    };
    
    // Remove optional prefixes
    const clean = path.replace(/^activity\/tracing\//, "");
    const parts = clean.split("/");
    
    if (parts.length >= 2) {
        const cat = parts[0].toLowerCase();
        const item = parts[1];
        
        // Split by hyphen/underscore, capitalize each word, and join with a space
        const formattedItem = withSet(item);
            
        if (cat.startsWith('line')) return `${formattedItem} Lines`;
        if (cat.startsWith('shape')) return `${formattedItem} Shape`;
        if (cat.startsWith('letter')) return `Letter ${formattedItem}`;
        if (cat.startsWith('number')) return `Number ${formattedItem}`;
    }
    
    // Fallback: capitalize each word of the last part of the path
    const lastPart = parts[parts.length - 1] || path;
    if (/^\d+$/.test(lastPart) && parts.length > 1) {
        return `${withSet(parts[parts.length - 2])} (Set ${lastPart})`;
    }
    return withSet(lastPart);
};
