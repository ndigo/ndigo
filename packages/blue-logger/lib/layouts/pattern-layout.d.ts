/**
 * @author Jeff Rose
 */
import { Entry } from '../entry';
import { AbstractLayout } from '../layout';
export declare class PatternLayout extends AbstractLayout {
    readonly pattern: string;
    newline: string;
    categorySeparator: string;
    constructor(pattern: string);
    format({ category, level, message, timestamp }: Entry): string;
}
//# sourceMappingURL=pattern-layout.d.ts.map