/**
 */
import { describe, expect, it } from 'vitest';
import type { Route } from '@ndigo/router';
import { MediaTypes } from '@ndigo/core';
import type { ViewTarget } from '../src/view-target';
import { AbstractSerializingView } from '../src/abstract-serializing-view';

/** A concrete {@link AbstractSerializingView} whose hook coerces to a string. */
class StringifyView extends AbstractSerializingView {
    constructor() {
        super();
        this.mediaType = MediaTypes.TEXT_CSV?.withCharset('UTF-8') ?? null;
    }

    /** @inheritdoc */
    protected serialize(model: unknown): string {
        return model == null ? '' : String(model);
    }
}

/** A DOM-free {@link ViewTarget} that captures committed output. */
class CaptureTarget implements ViewTarget {
    last: unknown = undefined;

    async prepare(): Promise<void> {
        // no-op
    }

    async commit(output: unknown): Promise<void> {
        this.last = output;
    }

    async clear(): Promise<void> {
        this.last = undefined;
    }
}

describe('AbstractSerializingView', () => {
    it('produces a document from the serialize hook with the declared media type', async () => {
        const view = new StringifyView();

        const result = await view.renderTo(42, {} as Route);

        expect(result.body).toBe('42');
        expect(result.mediaType?.baseType).toBe('text/csv');
    });

    it('commits the serialized body to the target in fragment mode', async () => {
        const view = new StringifyView();
        const target = new CaptureTarget();

        await view.render({ a: 1 }, {}, target);

        expect(target.last).toBe('[object Object]');
    });

    it('throws when no ViewTarget is supplied', async () => {
        const view = new StringifyView();
        await expect(view.render({}, {}, undefined)).rejects.toThrow(/ViewTarget/);
    });
});
