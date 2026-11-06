/**
 */
import { describe, expect, it } from 'vitest';
import type { Route } from '@ndigo/router';
import { TextView } from '../src/text-view';

describe('TextView', () => {
    it('encodes strings verbatim as text/plain', async () => {
        const view = new TextView();

        const result = await view.renderTo('hello', {} as Route);

        expect(result.body).toBe('hello');
        expect(result.mediaType?.baseType).toBe('text/plain');
    });

    it('coerces numbers to their string form', async () => {
        const view = new TextView();
        expect((await view.renderTo(42, {} as Route)).body).toBe('42');
    });

    it('renders an empty document for nullish models', async () => {
        const view = new TextView();
        expect((await view.renderTo(null, {} as Route)).body).toBe('');
        expect((await view.renderTo(undefined, {} as Route)).body).toBe('');
    });
});
