/**
 * Regression specs for CF-3 (2026-10-06 review): the container registers
 * destruction callbacks for refresh-scoped lifecycle values at creation time,
 * so `RefreshScope.clear()` (the environment `config:refresh` teardown edge,
 * AD-29 D-2) runs `destroy()`/`close()` exactly once per instance. Singleton
 * teardown stays owned by `AbstractFactory.destroyValue` (no double destroy).
 */
import { describe, test, expect, beforeEach, vi } from 'vitest';
import { DefaultFactory } from '../src/factory';
import { RefreshScope, refreshScope, singletonScope } from '../src/scope';

@refreshScope
class DestroyableRefreshEntry {
    destroyed = false;
    destroy = vi.fn(() => {
        this.destroyed = true;
    });
}

@refreshScope
class CloseableRefreshEntry {
    closed = false;
    close = vi.fn(() => {
        this.closed = true;
    });
}

@refreshScope
class PlainRefreshEntry {
    value = Math.random();
}

@singletonScope
class DestroyableSingletonEntry {
    destroyed = false;
    destroy = vi.fn(() => {
        this.destroyed = true;
    });
}

describe('refresh scope teardown (CF-3, AD-29 D-2)', () => {
    let factory: DefaultFactory;

    beforeEach(() => {
        factory = new DefaultFactory();
    });

    const refreshScopeOf = (f: DefaultFactory): RefreshScope => {
        const scope = f.getScope('refresh');
        if (!(scope instanceof RefreshScope)) {
            throw new Error('Expected the factory to register a RefreshScope');
        }
        return scope;
    };

    test('tears down a refresh-scoped destroyable exactly once on refresh (clear)', () => {
        factory.setValue('entry', DestroyableRefreshEntry);

        const entry = factory.getValue<DestroyableRefreshEntry>('entry');

        // Repeated resolution returns the cached instance and must not stack
        // destruction callbacks.
        expect(factory.getValue('entry')).toBe(entry);
        expect(factory.getValue('entry')).toBe(entry);

        refreshScopeOf(factory).clear();

        expect(entry.destroy).toHaveBeenCalledTimes(1);
        expect(entry.destroyed).toBe(true);
    });

    test('tears down a refresh-scoped closeable exactly once on clear', () => {
        factory.setValue('entry', CloseableRefreshEntry);

        const entry = factory.getValue<CloseableRefreshEntry>('entry');
        expect(factory.getValue('entry')).toBe(entry);

        refreshScopeOf(factory).clear();

        expect(entry.close).toHaveBeenCalledTimes(1);
        expect(entry.closed).toBe(true);
    });

    test('registers teardown for each recreated refresh-scoped instance, exactly once', () => {
        factory.setValue('entry', DestroyableRefreshEntry);

        const first = factory.getValue<DestroyableRefreshEntry>('entry');
        refreshScopeOf(factory).clear();

        const second = factory.getValue<DestroyableRefreshEntry>('entry');
        expect(second).not.toBe(first);
        expect(second.destroy).not.toHaveBeenCalled();

        refreshScopeOf(factory).clear();

        // The stale callback was discarded with the first instance...
        expect(first.destroy).toHaveBeenCalledTimes(1);
        // ...and the recreated instance's fresh registration ran once.
        expect(second.destroy).toHaveBeenCalledTimes(1);
    });

    test('destroyValue tears a refresh-scoped destroyable down exactly once', () => {
        factory.setValue('entry', DestroyableRefreshEntry);

        const entry = factory.getValue<DestroyableRefreshEntry>('entry');

        factory.destroyValue('entry');

        expect(entry.destroy).toHaveBeenCalledTimes(1);

        const recreated = factory.getValue<DestroyableRefreshEntry>('entry');
        expect(recreated).not.toBe(entry);
        expect(recreated.destroy).not.toHaveBeenCalled();
    });

    test('refresh scope still clears values without lifecycle hooks', () => {
        factory.setValue('plain', PlainRefreshEntry);

        const first = factory.getValue<PlainRefreshEntry>('plain');

        refreshScopeOf(factory).clear();

        expect(factory.getValue<PlainRefreshEntry>('plain')).not.toBe(first);
    });

    test('keeps singleton teardown unchanged: destroyValue destroys exactly once', () => {
        factory.setValue('entry', DestroyableSingletonEntry);

        const entry = factory.getValue<DestroyableSingletonEntry>('entry');

        factory.destroyValue('entry');

        expect(entry.destroy).toHaveBeenCalledTimes(1);
    });
});
