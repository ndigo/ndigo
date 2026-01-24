/**
 * @author Jeff Rose
 */

import { MediaType, MediaTypes } from '@blue/core';
import { Entry, loggable } from '../entry';
import { NullLayout } from './null-layout';

const defineProperty = Reflect.defineProperty;

export class XMLLayout extends NullLayout {
    declare readonly mediaType: MediaType;
    declare batchFooter: string;
    declare batchHeader: string;
    declare batchSeparator: string;

    constructor() {
        super();

        defineProperty(this, 'mediaType', {
            value: MediaTypes.TEXT_XML,
            configurable: true,
            enumerable: false,
            writable: false,
        });
        defineProperty(this, 'batchFooter', {
            value: '',
            configurable: true,
            enumerable: false,
            writable: true,
        });
        defineProperty(this, 'batchHeader', {
            value: '',
            configurable: true,
            enumerable: false,
            writable: true,
        });
        defineProperty(this, 'batchSeparator', {
            value: '',
            configurable: true,
            enumerable: false,
            writable: true,
        });
    }

    format({ category, error, level, message, timestamp }: Entry): string {
        return `${this.batchHeader}<Entry category="${category}" level="${level}" timestamp="${timestamp}">${error ? this.formatError(message[0] as Error) : this.formatMessage(message)}</Entry>${this.batchFooter}`;
    }

    formatBatch(entries: Entry[]): string {
        const formatted: string[] = this.formatEntries(entries);
        return `<Entries size="${entries.length}">${formatted.join(this.batchSeparator)}</Entries>`;
    }

    formatError(error?: Error): string {
        // TODO escape error
        // TODO use stracktrace-js?
        return error ? `<Error name="${error.name}"><![CDATA[${error.message}]]></Error>` : '';
    }

    formatMessage(message: loggable[]): string {
        // TODO escape message
        return `<Message><![CDATA[${message.join(' ')}]]></Message>`;
    }
}
