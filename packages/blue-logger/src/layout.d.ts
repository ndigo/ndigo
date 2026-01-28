/**
 * @author Jeff Rose
 */
import { Entry } from './entry';
import { MediaType } from '@blue/core';
export interface Layout {
    mediaType: MediaType;
    format(entry: Entry): string;
}
export interface BatchLayout extends Layout {
    batchFooter: string;
    batchHeader: string;
    batchSeparator: string;
    formatBatch(entries: Entry[]): string;
}
export declare abstract class AbstractLayout implements Layout {
    mediaType: MediaType;
    constructor();
    abstract format(entry: Entry): string;
}
export declare abstract class AbstractBatchLayout extends AbstractLayout implements BatchLayout {
    batchFooter: string;
    batchHeader: string;
    batchSeparator: string;
    constructor();
    abstract formatBatch(entries: Entry[]): string;
}
//# sourceMappingURL=layout.d.ts.map