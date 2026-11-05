/**
 * @since 1.0.0
 * @author Jeff Rose
 */
import { describe, expect, it } from 'vitest';
import type { Route } from '@ndigo/router';
import { CSVView } from '../src/csv-view';

const route: Route = {} as Route;

describe('CSVView', () => {
    it('derives columns from the first record and writes a header row', async () => {
        const view = new CSVView();

        const result = await view.renderTo(
            [
                { name: 'Ada', age: 36 },
                { name: 'Grace', age: 45 },
            ],
            route
        );

        expect(result.body).toBe('name,age\r\nAda,36\r\nGrace,45');
        expect(result.mediaType?.baseType).toBe('text/csv');
    });

    it('honors explicit columns and their order', async () => {
        const view = new CSVView({ columns: ['age', 'name'] });

        const result = await view.renderTo([{ name: 'Ada', age: 36 }], route);

        expect(result.body).toBe('age,name\r\n36,Ada');
    });

    it('quotes fields containing delimiters, quotes, or line breaks', async () => {
        const view = new CSVView();

        const result = await view.renderTo([{ note: 'a,b' }, { note: 'say "hi"' }, { note: 'line1\nline2' }], route);

        expect(result.body).toBe('note\r\n"a,b"\r\n"say ""hi"""\r\n"line1\nline2"');
    });

    it('writes only the header for an empty array with explicit columns', async () => {
        const view = new CSVView({ columns: ['a', 'b'] });
        expect((await view.renderTo([], route)).body).toBe('a,b');
    });

    it('honors a custom delimiter', async () => {
        const view = new CSVView({ delimiter: ';' });
        expect((await view.renderTo([{ a: 1, b: 2 }], route)).body).toBe('a;b\r\n1;2');
    });
});
