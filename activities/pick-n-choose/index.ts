export { default as PickChoiceActivity } from './components/pick-n-choose-activity';
export * from './data';
export * from './types';
export * from './utils/assetDictionary';
export * from './utils/shuffler';

import { OBJECT_IDENTIFICATION_POOL } from './data/object-identification';

/**
 * Resolves a Pick 'n Choose activity path.
 */
export function getPickChoiceActivityByPath(path: string) {
    if (!path) return undefined;
    const clean = path.toLowerCase();

    if (
        clean.includes('pick-n-choose') ||
        clean.includes('pick') ||
        clean.includes('identification') ||
        clean.includes('word-match')
    ) {
        return {
            type: 'pick-n-choose',
            pool: OBJECT_IDENTIFICATION_POOL,
        };
    }
    return undefined;
}
