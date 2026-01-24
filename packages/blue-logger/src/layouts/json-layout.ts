/**
 * @author Jeff Rose
 */

import { createNull, MediaType, MediaTypes, JSONObject } from '@blue/core';
import { Entry } from '../entry';
import { NullLayout } from './null-layout';

const defineProperty = Reflect.defineProperty;

export class JSONLayout extends NullLayout {
    readonly mediaType: MediaType;
    readonly batchFooter: string;
    readonly batchHeader: string;
    readonly batchSeparator: string;

    constructor(){
        super();

        defineProperty( this, 'mediaType', {
            value: MediaTypes.APPLICATION_JSON,
            configurable: true,
            enumerable: false,
            writable: false
        } );
        defineProperty( this, 'batchFooter', {
            value: ']',
            configurable: true,
            enumerable: false,
            writable: false
        } );
        defineProperty( this, 'batchHeader', {
            value: '[',
            configurable: true,
            enumerable: false,
            writable: false
        } );
        defineProperty( this, 'batchSeparator', {
            value: ',',
            configurable: true,
            enumerable: false,
            writable: false
        } );
    }

    format( entry: Entry ): string {
        const formatted: JSONObject = Object.assign( createNull(), entry );
        formatted.message = entry.message.join( ' ' );
        return JSON.stringify( formatted );
    }
}
