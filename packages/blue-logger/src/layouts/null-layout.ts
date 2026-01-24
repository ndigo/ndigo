/**
 * @author Jeff Rose
 */

import { Entry } from '../entry';
import { AbstractBatchLayout } from '../layout';

export class NullLayout extends AbstractBatchLayout {
    batchSeparator: string;

    constructor(){
        super();

        Reflect.defineProperty( this, 'batchSeparator', {
            value: ',',
            configurable: true,
            enumerable: false,
            writable: true
        } );
    }

    format( entry: Entry ): string {
        return entry.message.join( ' ' );
    }

    formatBatch( entries: Entry[] ): string {
        const formatted = this.formatEntries( entries );
        return `${ this.batchHeader }${ formatted.join( this.batchSeparator ) }${ this.batchFooter }`;
    }

    protected formatEntries( entries: Entry[] ): string[] {
        const
            length = entries.length,
            formatted: string[] = new Array( length );
        let index = 0;

        for( ; index < length; index++ ){
            formatted[ index ] = this.format( entries[ index ] );
        }

        return formatted;
    }
}
