/**
 * @author Jeff Rose
 */

import { isNumber, isString } from '@blue/util/types';
import { Comparator, numberComparator } from './comparable';

/**
 * * This is currently not in use. It's an initial draft of making more robust support for quality factors,
 * * which are often used in media types and http headers. -JBR
 */

export type QualityFactorParameter = `;q=${0.1 | 0.2 | 0.3 | 0.4 | 0.5 | 0.6 | 0.7 | 0.8 | 0.9 | '1.0'}`;

export interface Qualifiable {
    readonly qualityFactor: number;
}

const { isNaN } = Number;

export const parseQualityFactor = (value: unknown): number => {
    if (isString(value)) {
        const parsed = parseFloat(value);
        return isNaN(parsed) ? 1 : parsed;
    }
    if (isNumber(value)) {
        return value;
    }
    return 1;
};

/**
 * @implements module:core.Comparator
 */
class QualityFactorComparator implements Comparator<Qualifiable> {
    compare(q1: Qualifiable, q2: Qualifiable): number {
        const quality1 = parseQualityFactor(q1.qualityFactor) as number,
            quality2 = parseQualityFactor(q2.qualityFactor) as number;
        return numberComparator.compare(quality2, quality1);
    }
}

export const qualityFactorComparator = new QualityFactorComparator();
