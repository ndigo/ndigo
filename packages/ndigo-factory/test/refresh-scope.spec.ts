/**
 * Regression specs for CF-3 (2026-10-06 review): the container registers
 * destruction callbacks for refresh-scoped lifecycle values at creation time,
 * so `RefreshScope.clear()` (the environment `config:refresh` teardown edge,
 * AD-29 D-2) runs `destroy()`/`close()` exactly once per instance. Singleton
 * teardown stays owned by `AbstractFactory.destroyValue` (no double destroy).
 *
 * @module ndigo-factory
 * @since 1.0.0
 * @author Jeff Rose
 */
import { describe, test, expect, beforeEach, vi } from 'vitest';
import { DefaultFactory } from '../src/factory';
import { RefreshScope, refreshScope, singletonScope } from '../src/scope';

@refreshScope
class DestroyableRefreshBean {
    destroyed = false;
    destroy = vi.fn(() => {
        this.destroyed = true;
    });
}

@refreshScope
class CloseableRefreshBean {
    closed = false;
    close = vi.fn(() => {
        this.closed = true;
    });
}

@refreshScope
class PlainRefreshBean {
    value = Math.random();
}

@singletonScope
class DestroyableSingletonBean {
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
        factory.setValue('bean', DestroyableRefreshBean);

        const bean = factory.getValue<DestroyableRefreshBean>('bean');

        // Repeated resolution returns the cached instance and must not stack
        // destruction callbacks.
        expect(factory.getValue('bean')).toBe(bean);
        expect(factory.getValue('bean')).toBe(bean);

        refreshScopeOf(factory).clear();

        expect(bean.destroy).toHaveBeenCalledTimes(1);
        expect(bean.destroyed).toBe(true);
    });

    test('tears down a refresh-scoped closeable exactly once on clear', () => {
        factory.setValue('bean', CloseableRefreshBean);

        const bean = factory.getValue<CloseableRefreshBean>('bean');
        expect(factory.getValue('bean')).toBe(bean);

        refreshScopeOf(factory).clear();

        expect(bean.close).toHaveBeenCalledTimes(1);
        expect(bean.closed).toBe(true);
    });

    test('registers teardown for each recreated refresh-scoped instance, exactly once', () => {
        factory.setValue('bean', DestroyableRefreshBean);

        const first = factory.getValue<DestroyableRefreshBean>('bean');
        refreshScopeOf(factory).clear();

        const second = factory.getValue<DestroyableRefreshBean>('bean');
        expect(second).not.toBe(first);
        expect(second.destroy).not.toHaveBeenCalled();

        refreshScopeOf(factory).clear();

        // The stale callback was discarded with the first instance...
        expect(first.destroy).toHaveBeenCalledTimes(1);
        // ...and the recreated instance's fresh registration ran once.
        expect(second.destroy).toHaveBeenCalledTimes(1);
    });

    test('destroyValue tears a refresh-scoped destroyable down exactly once', () => {
        factory.setValue('bean', DestroyableRefreshBean);

        const bean = factory.getValue<DestroyableRefreshBean>('bean');

        factory.destroyValue('bean');

        expect(bean.destroy).toHaveBeenCalledTimes(1);

        const recreated = factory.getValue<DestroyableRefreshBean>('bean');
        expect(recreated).not.toBe(bean);
        expect(recreated.destroy).not.toHaveBeenCalled();
    });

    test('refresh scope still clears values without lifecycle hooks', () => {
        factory.setValue('plain', PlainRefreshBean);

        const first = factory.getValue<PlainRefreshBean>('plain');

        refreshScopeOf(factory).clear();

        expect(factory.getValue<PlainRefreshBean>('plain')).not.toBe(first);
    });

    test('keeps singleton teardown unchanged: destroyValue destroys exactly once', () => {
        factory.setValue('bean', DestroyableSingletonBean);

        const bean = factory.getValue<DestroyableSingletonBean>('bean');

        factory.destroyValue('bean');

        expect(bean.destroy).toHaveBeenCalledTimes(1);
    });
});
