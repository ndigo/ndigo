import { describe, test, expect, vi } from 'vitest';
import { GenericApplicationContext } from '../src/context';

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
});
