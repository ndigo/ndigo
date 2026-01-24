/**
 * @author Jeff Rose
 */
import { AbstractBatchAppender, Entry } from '@blue/logger';
import { TimeoutInit, HTTPAware, HTTP } from '@blue/http';
import { $aware } from '@blue/factory';
export type HTTPAppenderInit = TimeoutInit;
export declare class HTTPAppender extends AbstractBatchAppender implements HTTPAware {
    #private;
    appending: Promise<Response>;
    readonly url: string;
    readonly settings: HTTPAppenderInit;
    get [$aware](): boolean;
    constructor(url: string, init?: HTTPAppenderInit);
    appendBatch(entries: Entry[]): void;
    setHTTP(http: HTTP): void;
}
//# sourceMappingURL=http-appender.d.ts.map