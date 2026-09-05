import { describe, it, expect } from 'vitest';
import { signal, computed, effect, batch, untracked, Signal } from '../src/index';

describe('signal', () => {
    it('creates a signal with the given value', () => {
        const s = signal(0);
        expect(s.value).toBe(0);
    });

    it('updates value on assignment', () => {
        const s = signal('hello');
        s.value = 'world';
        expect(s.value).toBe('world');
    });

    it('notifies subscribers on change (includes initial value)', () => {
        const s = signal(0);
        const values: number[] = [];
        s.subscribe((v) => values.push(v));

        s.value = 1;
        s.value = 2;

        expect(values).toEqual([0, 1, 2]);
    });

    it('does not notify subscriber on repeat assignment of same primitve', () => {
        const s = signal(0);
        const values: number[] = [];
        s.subscribe((v) => values.push(v));

        s.value = 0; // same value — subscriber not called again after initial

        expect(values).toEqual([0]);
    });

    it('subscribe fires immediately with initial value', () => {
        const s = signal(42);
        let value: number | undefined;
        s.subscribe((v) => {
            value = v;
        });
        expect(value).toBe(42);
    });

    it('peek returns current value without tracking', () => {
        const s = signal(42);
        expect(s.peek()).toBe(42);
    });

    it('is a Signal instance', () => {
        const s = signal(0);
        expect(s).toBeInstanceOf(Signal);
    });

    it('toString returns the stringified value', () => {
        const s = signal(42);
        expect(s.toString()).toBe('42');
    });

    it('toJSON returns the value', () => {
        const s = signal({ a: 1 });
        expect(s.toJSON()).toEqual({ a: 1 });
    });

    it('valueOf returns the value', () => {
        const s = signal(42);
        expect(s.valueOf()).toBe(42);
    });

    it('supports undefined initial value', () => {
        const s = signal<number>();
        expect(s.value).toBeUndefined();
    });
});

describe('computed', () => {
    it('derives a value from source signals', () => {
        const a = signal(2);
        const b = signal(3);
        const sum = computed(() => a.value + b.value);

        expect(sum.value).toBe(5);
    });

    it('updates when source changes', () => {
        const a = signal(2);
        const b = signal(3);
        const sum = computed(() => a.value + b.value);

        a.value = 10;
        expect(sum.value).toBe(13);
    });

    it('lazily evaluates and caches', () => {
        const a = signal(1);
        let computeCount = 0;
        const doubled = computed(() => {
            computeCount++;
            return a.value * 2;
        });

        // Not accessed yet — not computed
        expect(computeCount).toBe(0);

        // First access — computes
        expect(doubled.value).toBe(2);
        expect(computeCount).toBe(1);

        // Cached — no recompute
        expect(doubled.value).toBe(2);
        expect(computeCount).toBe(1);

        // Source changed — recomputes on next access
        a.value = 3;
        expect(doubled.value).toBe(6);
        expect(computeCount).toBe(2);
    });

    it('computed is readonly (throws on set)', () => {
        const s = signal(0);
        const c = computed(() => s.value * 2);
        expect(c.value).toBe(0);
        s.value = 3;
        expect(c.value).toBe(6);
        expect(() => {
            (c as any).value = 42;
        }).toThrow();
    });

    it('chains computed from computed', () => {
        const count = signal(2);
        const doubled = computed(() => count.value * 2);
        const quadrupled = computed(() => doubled.value * 2);

        expect(quadrupled.value).toBe(8);

        count.value = 3;
        expect(quadrupled.value).toBe(12);
    });
});

describe('effect', () => {
    it('runs immediately on creation', () => {
        const s = signal(0);
        let called = false;
        const dispose = effect(() => {
            void s.value; // subscribe
            called = true;
        });

        expect(called).toBe(true);
        dispose();
    });

    it('re-runs when tracked signals change', () => {
        const s = signal(0);
        const calls: number[] = [];
        const dispose = effect(() => {
            calls.push(s.value);
        });

        s.value = 1;
        s.value = 2;

        expect(calls).toEqual([0, 1, 2]);
        dispose();
    });

    it('stops reacting after dispose', () => {
        const s = signal(0);
        const calls: number[] = [];
        const dispose = effect(() => {
            calls.push(s.value);
        });

        s.value = 1;
        dispose();
        s.value = 2;

        expect(calls).toEqual([0, 1]);
    });
});

describe('batch', () => {
    it('defers notifications until batch completes', () => {
        const a = signal(1);
        const b = signal(2);
        const calls: number[] = [];

        effect(() => {
            calls.push(a.value + b.value);
        });

        // Initial run
        expect(calls).toEqual([3]);

        batch(() => {
            a.value = 10;
            b.value = 20;
            // No notification yet
            expect(calls).toEqual([3]);
        });

        // Single notification after batch
        expect(calls).toEqual([3, 30]);
    });

    it('handles nested batches', () => {
        const s = signal(0);
        const calls: number[] = [];

        effect(() => {
            calls.push(s.value);
        });

        batch(() => {
            s.value = 1;
            batch(() => {
                s.value = 2;
            });
            expect(calls).toEqual([0]); // still not flushed
        });

        expect(calls).toEqual([0, 2]);
    });
});

describe('untracked', () => {
    it('reads a signal without subscribing', () => {
        const s = signal(0);
        let trackedValue = 0;

        const dispose = effect(() => {
            trackedValue = untracked(() => s.value);
        });

        expect(trackedValue).toBe(0);

        s.value = 1;
        // effect does not re-run because s.value was read with untracked
        expect(trackedValue).toBe(0);

        dispose();
    });
});
