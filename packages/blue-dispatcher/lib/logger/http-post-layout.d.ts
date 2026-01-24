/**
 * @author Jeff Rose
 */
import { MediaType } from '@blue/core';
import { Entry, NullLayout } from '@blue/logger';
export declare class HTTPPostLayout extends NullLayout {
    readonly mediaType: MediaType;
    constructor();
    format(entry: Entry): string;
}
//# sourceMappingURL=http-post-layout.d.ts.map