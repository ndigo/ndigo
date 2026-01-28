/**
 * @author Jeff Rose
 */
import { Entry } from '../entry';
import { AbstractBatchLayout } from '../layout';
export declare class NullLayout extends AbstractBatchLayout {
    batchSeparator: string;
    constructor();
    format(entry: Entry): string;
    formatBatch(entries: Entry[]): string;
    protected formatEntries(entries: Entry[]): string[];
}
//# sourceMappingURL=null-layout.d.ts.map