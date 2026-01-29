/**
 * @author Jeff Rose
 * @see {@link https://ramdajs.com/docs/}
 * @see {@link https://github.com/micromatch/to-regex-range}
 */
import { Numeric } from '../type/is-numeric.js';
type RangeToken = {
    pattern: string;
    count: number[];
    digits: number;
    value?: string;
};
export type RegExpRangeInit = {
    capture?: boolean;
    relaxZeros?: boolean;
    shorthand?: boolean;
    strictZeros?: boolean;
    wrap?: boolean;
};
type RegExpRangeState = {
    a: number;
    b: number;
    isPadded?: boolean;
    maxLen?: number;
    min: Numeric;
    max: Numeric;
    negatives?: RangeToken[];
    positives?: RangeToken[];
    result?: string;
};
declare const regExpRange: {
    (from: Numeric, to?: Numeric, init?: RegExpRangeInit): string;
    cache: Map<string, RegExpRangeState>;
    clearCache(): void;
};
export default regExpRange;
//# sourceMappingURL=reg-exp-range.d.ts.map