/**
 */
import { describe, test, expect, vi } from 'vitest';
import { GenericApplicationContext } from '../src/context';

describe('GenericApplicationContext — teardown of managed values on close', () => {
    test('a plain setValue bean implementing Destroyable is destroyed on close', () => {
        const context = new GenericApplicationContext('t1');
        const bean = {
            destroyed: false,
            destroy() {
                this.destroyed = true;
            },
        };
        context.setValue('destroyableBean', bean);

        expect(bean.destroyed).toBe(false);
        context.close();
        expect(bean.destroyed).toBe(true);
    });

    test('a plain setValue bean implementing Closeable is closed on close', () => {
        const context = new GenericApplicationContext('t2');
        const closed = vi.fn();
        context.setValue('closeableBean', { close: closed });

        context.close();
        expect(closed).toHaveBeenCalledTimes(1);
    });

    test('a constructor-registered Destroyable bean is destroyed on close', () => {
        class DestroyMe {
            destroyed = false;
            destroy() {
                this.destroyed = true;
            }
        }

        const context = new GenericApplicationContext('t3');
        context.setValue('lazyBean', DestroyMe);
        const bean = context.getValue<DestroyMe>('lazyBean');

        context.close();
        expect(bean.destroyed).toBe(true);
    });

    test('internal state fields and non-lifecycle values are not torn down', () => {
        const context = new GenericApplicationContext('t4');
        context.setValue('scalarBean', 42);

        context.close();

        // A scalar is not lifecycle-bearing, so it is neither destroyed nor
        // removed — and internal context state survives intact.
        expect(context.destroyed).toBe(true);
        expect((context as unknown as { scalarBean: number }).scalarBean).toBe(42);
    });
});

describe('GenericApplicationContext — remaining branch coverage', () => {
    test('bubble on root context emits only on self (no parent to climb)', () => {
        const root = new GenericApplicationContext('root');
        const listener = vi.fn();
        root.on('up:event', listener);
        root.bubble('up:event', 'data');
        expect(listener).toHaveBeenCalledTimes(1);
        root.destroy();
    });

    test('broadcast on leaf context with no children emits only on self', () => {
        const root = new GenericApplicationContext('root');
        const child = root.newChild('leaf') as GenericApplicationContext;
        const listener = vi.fn();
        child.on('down:event', listener);
        child.broadcast('down:event');
        expect(listener).toHaveBeenCalledTimes(1);
        root.destroy();
    });

    test('bubble from grandchild emits on self, intermediate parent, and root', () => {
        const root = new GenericApplicationContext('root');
        const child = root.newChild('child') as GenericApplicationContext;
        const grandchild = child.newChild('grandchild') as GenericApplicationContext;

        const rootListener = vi.fn();
        const childListener = vi.fn();
        const grandchildListener = vi.fn();

        root.on('up:event', rootListener);
        child.on('up:event', childListener);
        grandchild.on('up:event', grandchildListener);

        grandchild.bubble('up:event');

        // escalate emits on the origin (inclusive) then climbs the parent chain
        expect(grandchildListener).toHaveBeenCalledTimes(1);
        expect(childListener).toHaveBeenCalledTimes(1);
        expect(rootListener).toHaveBeenCalledTimes(1);
        root.destroy();
    });

    test('close on a never-refreshed context completes', () => {
        const context = new GenericApplicationContext('never-activated');
        const closeListener = vi.fn();
        const destroyListener = vi.fn();
        context.on('context:close', closeListener);
        context.on('context:destroy', destroyListener);
        context.close();
        expect(closeListener).toHaveBeenCalled();
        expect(destroyListener).toHaveBeenCalled();
        expect(context.destroyed).toBe(true);
    });

    test('removeChild returns false when child is not in children list', () => {
        const parent = new GenericApplicationContext('parent');
        const orphan = new GenericApplicationContext('orphan');
        const result = parent.removeChild(orphan);
        expect(result).toBe(false);
        parent.destroy();
        orphan.destroy();
    });

    test('repeated close on already-closed child is no-op', () => {
        const parent = new GenericApplicationContext('parent');
        const child = parent.newChild('child') as GenericApplicationContext;
        child.close();
        child.close();
        child.close();
        expect(child.destroyed).toBe(true);
        expect(parent.children).toHaveLength(0);
        parent.destroy();
    });

    test('close() completes teardown when a context:close listener throws (CTX-06)', () => {
        const context = new GenericApplicationContext('throwing-close');
        const child = context.newChild('child') as GenericApplicationContext;
        const bean = {
            destroyed: false,
            destroy() {
                this.destroyed = true;
            },
        };
        context.setValue('bean', bean);
        // No 'error' listener → the emitter re-throws the listener failure out
        // of emit(), which previously aborted close() before any teardown.
        context.on('context:close', () => {
            throw new Error('listener boom');
        });
        const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});

        expect(() => context.close()).not.toThrow();

        expect(context.destroyed).toBe(true);
        expect(child.destroyed).toBe(true);
        expect(bean.destroyed).toBe(true);
        expect(context.children).toHaveLength(0);
        expect(consoleError).toHaveBeenCalled();
        consoleError.mockRestore();
    });

    test('close() is exception-safe on a throwing context:destroy listener too (CTX-06)', () => {
        const context = new GenericApplicationContext('throwing-destroy');
        context.on('context:destroy', () => {
            throw new Error('destroy boom');
        });
        const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});

        expect(() => context.close()).not.toThrow();
        expect(context.destroyed).toBe(true);
        expect(context.listenerCount('context:destroy')).toBe(0);
        consoleError.mockRestore();
    });
});
