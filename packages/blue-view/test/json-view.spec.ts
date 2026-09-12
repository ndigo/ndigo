import { describe, expect, test } from 'vitest';
import type { ViewTarget } from '../src/view-target';
import { JSONView } from '../src/json-view';

/** A DOM-free {@link ViewTarget} that captures committed output. */
class CaptureViewTarget implements ViewTarget {
    last: unknown = undefined;

    async prepare(): Promise<void> {
        // no-op — nothing to clear for a string target
    }

    async commit(output: unknown): Promise<void> {
        this.last = output;
    }

    async clear(): Promise<void> {
        this.last = undefined;
    }
}

describe('JSONView', () => {
    test('declares an application/json media type', () => {
        const view = new JSONView();
        expect(view.mediaType?.baseType).toBe('application/json');
    });

    test('serializes the model to a JSON string on the target', async () => {
        const view = new JSONView();
        const target = new CaptureViewTarget();

        await view.render({ name: 'Ada', count: 3 }, {}, target);

        expect(target.last).toBe('{"name":"Ada","count":3}');
    });

    test('renders null when no model is supplied', async () => {
        const view = new JSONView();
        const target = new CaptureViewTarget();

        await view.render(undefined, {}, target);

        expect(target.last).toBe('null');
    });

    test('throws when no ViewTarget is supplied', async () => {
        const view = new JSONView();
        await expect(view.render({ a: 1 }, {}, undefined)).rejects.toThrow(/ViewTarget/);
    });
});
