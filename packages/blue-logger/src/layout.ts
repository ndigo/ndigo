/**
 * @author Jeff Rose
 */

import { Entry } from './entry';
import { MediaType, MediaTypes } from '@blue/core';

export interface Layout {
    mediaType: MediaType;

    format( entry: Entry ): string;
}

export interface BatchLayout extends Layout {
    batchFooter: string;
    batchHeader: string;
    batchSeparator: string;

    formatBatch( entries: Entry[] ): string;
}

export abstract class AbstractLayout implements Layout {
    mediaType: MediaType;

    constructor(){
        this.mediaType = MediaTypes.TEXT_PLAIN;
    }

    abstract format( entry: Entry ): string;
}

export abstract class AbstractBatchLayout extends AbstractLayout implements BatchLayout {
    batchFooter: string;
    batchHeader: string;
    batchSeparator: string;

    constructor(){
        super();
        this.batchFooter = '';
        this.batchHeader = '';
        this.batchSeparator = '';
    }

    abstract formatBatch( entries: Entry[] ): string;
}
