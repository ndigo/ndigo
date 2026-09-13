/**
 * @blue/view — CSV view.
 *
 * @module
 * @since 1.0.0
 */

import { MediaTypes } from '@blue/core';
import { AbstractSerializingView } from './abstract-serializing-view.js';

/**
 * Construction options for {@link CSVView}.
 */
export interface CSVViewOptions {
    /**
     * Column order for the header and every row. When omitted, the columns
     * are derived from the first record's keys.
     */
    columns?: string[];

    /**
     * Field delimiter. Defaults to `,`.
     */
    delimiter?: string;
}

/**
 * A view that encodes an array of record objects as a CSV document
 * (`text/csv`), RFC 4180-style: a header row, `\r\n` row endings, and
 * quoting of fields containing the delimiter, double quotes, or line breaks.
 */
export class CSVView extends AbstractSerializingView {
    readonly #columns?: string[];
    readonly #delimiter: string;

    constructor(options: CSVViewOptions = {}) {
        super();
        this.mediaType = MediaTypes.TEXT_CSV?.withCharset('UTF-8') ?? null;
        this.#columns = options.columns;
        this.#delimiter = options.delimiter ?? ',';
    }

    /** @inheritdoc */
    protected serialize(model: unknown): string {
        const records = Array.isArray(model) ? model : [];
        const columns =
            this.#columns ??
            (records[0] != null && typeof records[0] === 'object'
                ? Object.keys(records[0] as Record<string, unknown>)
                : []);

        const lines: string[] = [];
        if (columns.length > 0) {
            lines.push(columns.map((column) => this.#escape(column)).join(this.#delimiter));
        }

        for (const record of records) {
            if (record == null || typeof record !== 'object') {
                continue;
            }
            const row = columns.map((column) =>
                this.#escape(String((record as Record<string, unknown>)[column] ?? ''))
            );
            lines.push(row.join(this.#delimiter));
        }

        return lines.join('\r\n');
    }

    #escape(value: string): string {
        const needsQuoting =
            value.includes(this.#delimiter) || value.includes('"') || value.includes('\r') || value.includes('\n');
        return needsQuoting ? `"${value.replaceAll('"', '""')}"` : value;
    }
}
