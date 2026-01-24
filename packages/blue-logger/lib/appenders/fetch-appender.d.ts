/**
 * @author Jeff Rose
 */
import { AbstractBatchAppender } from '../appender';
import { Entry } from '../entry';
export type FetchAppenderSettings = RequestInit & {
    timeout?: number;
};
export declare class FetchAppender extends AbstractBatchAppender {
    appending: Promise<Response>;
    readonly url: string;
    readonly options: FetchAppenderSettings;
    constructor(url: string, options?: FetchAppenderSettings);
    appendBatch(entries: Entry[]): void;
}
//# sourceMappingURL=fetch-appender.d.ts.map