/**
 * @author Jeff Rose
 */

import { createNull, MediaType, MediaTypes, JSONObject } from '@blue/core';
import { toQueryString } from '@blue/router';
import { Entry, NullLayout } from '@blue/logger';

export class HTTPPostLayout extends NullLayout {
    readonly mediaType: MediaType;

    constructor(){
        super();

        Reflect.defineProperty( this, 'mediaType', {
            value: MediaTypes.MULTIPART_FORM_DATA,
            configurable: true,
            enumerable: false,
            writable: false
        } );
    }

    format( entry: Entry ): string {
        const data: JSONObject = createNull();

        data.category = entry.category;
        data.level = entry.level.toString();
        data.message = entry.message.join( ' ' );
        data.timestamp = entry.timestamp;

        if( entry.error ){
            const error = entry.message[ 0 ] as Error;
            data.errorName = error.name;
            data.errorMessage = error.message;
        }

        return toQueryString( data );
    }
}
