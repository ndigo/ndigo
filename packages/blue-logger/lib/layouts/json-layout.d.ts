/**
 * @author Jeff Rose
 */
import { MediaType } from '@blue/core';
import { Entry } from '../entry';
import { NullLayout } from './null-layout';
export declare class JSONLayout extends NullLayout {
    readonly mediaType: MediaType;
    readonly batchFooter: string;
    readonly batchHeader: string;
    readonly batchSeparator: string;
    constructor();
    format(entry: Entry): string;
}
//# sourceMappingURL=json-layout.d.ts.map