/**
 * @author Jeff Rose
 */
import { Comparator } from './comparable';
/**
 * * This is currently not in use. It's an initial draft of making more robust support for quality factors,
 * * which are often used in media types and http headers. -JBR
 */
export type QualityFactorParameter = `;q=${0.1 | 0.2 | 0.3 | 0.4 | 0.5 | 0.6 | 0.7 | 0.8 | 0.9 | '1.0'}`;
export interface Qualifiable {
    readonly qualityFactor: number;
}
export declare const parseQualityFactor: (...args: unknown[]) => unknown;
/**
 * @class module:core~QualityFactorComparator
 * @implements module:core.Comparator
 */
declare class QualityFactorComparator implements Comparator<Qualifiable> {
    compare(q1: Qualifiable, q2: Qualifiable): number;
}
export declare const qualityFactorComparator: QualityFactorComparator;
export {};
//# sourceMappingURL=quality-factor.d.ts.map