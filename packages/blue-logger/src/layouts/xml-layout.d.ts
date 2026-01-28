/**
 * @author Jeff Rose
 */
import { MediaType } from '@blue/core';
import { Entry, loggable } from '../entry';
import { NullLayout } from './null-layout';
export declare class XMLLayout extends NullLayout {
    readonly mediaType: MediaType;
    batchFooter: string;
    batchHeader: string;
    batchSeparator: string;
    constructor();
    format({ category, error, level, message, timestamp }: Entry): string;
    formatBatch(entries: Entry[]): string;
    formatError(error?: Error): string;
    formatMessage(message: loggable[]): string;
}
//# sourceMappingURL=xml-layout.d.ts.map