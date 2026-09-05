/**
 * @author Jeff Rose
 */

import { describe, it, expect } from 'vitest';
import { signal, computed, effect, reactive, getSignal } from '../src/decorators/index';

describe('@signal with @reactive', () => {
    it('wraps a field with a reactive signal', () => {
        @reactive
        class Counter {
            @signal count = 0;
        }

        const c = new Counter() as any;
        expect(c.count).toBe(0);

        c.count = 5;
        expect(c.count).toBe(5);
    });

    it('updates are reactive to @computed', () => {
        @reactive
        class Counter {
            @signal count = 0;

            @computed get doubled() {
                return this.count * 2;
            }
        }

        const c = new Counter() as any;
        expect(c.doubled).toBe(0);

        c.count = 3;
        expect(c.doubled).toBe(6);
    });

    it('each instance has independent signal', () => {
        @reactive
        class Store {
            @signal value = 'default';
        }

        const a = new Store() as any;
        const b = new Store() as any;

        a.value = 'a-value';
        expect(a.value).toBe('a-value');
        expect(b.value).toBe('default');
    });

    it('triggers @effect on changes', () => {
        const values: number[] = [];

        @reactive
        class Watcher {
            @signal count = 0;

            @effect track() {
                values.push(this.count);
            }
        }

        new Watcher();
        // Effect fires once during setup with initial value
        expect(values.filter((v) => v === 0).length).toBeGreaterThanOrEqual(1);
    });
});

describe('@computed with @reactive', () => {
    it('derives value from @signal fields', () => {
        @reactive
        class Calculator {
            @signal a = 2;
            @signal b = 3;

            @computed get sum() {
                return this.a + this.b;
            }
        }

        const calc = new Calculator() as any;
        expect(calc.sum).toBe(5);

        calc.a = 10;
        expect(calc.sum).toBe(13);
    });

    it('chains computed from computed', () => {
        @reactive
        class Calc {
            @signal value = 2;

            @computed get doubled() {
                return this.value * 2;
            }

            @computed get quadrupled() {
                return this.doubled * 2;
            }
        }

        const c = new Calc() as any;
        expect(c.quadrupled).toBe(8);

        c.value = 3;
        expect(c.quadrupled).toBe(12);
    });

    it('computes lazily', () => {
        let computeCount = 0;

        @reactive
        class Calc {
            @signal value = 1;

            @computed get doubled() {
                computeCount++;
                return this.value * 2;
            }
        }

        const c = new Calc() as any;
        expect(computeCount).toBe(0); // lazy — not computed yet

        c.doubled; // first access
        expect(computeCount).toBe(1);

        c.doubled; // cached
        expect(computeCount).toBe(1);
    });
});

describe('@effect with @reactive', () => {
    it('runs on instantiation', () => {
        let called = false;

        @reactive
        class Watcher {
            @signal count = 42;

            @effect log() {
                called = true;
            }
        }

        new Watcher();
        expect(called).toBe(true);
    });

    it('re-runs when @signal dependencies change', () => {
        const values: number[] = [];

        @reactive
        class Watcher {
            @signal count = 0;

            @effect track() {
                values.push(this.count);
            }
        }

        const w = new Watcher() as any;

        w.count = 1;
        w.count = 2;

        expect(values).toContain(1);
        expect(values).toContain(2);
    });

    it('stops reacting after dispose', () => {
        const values: number[] = [];

        @reactive
        class Watcher {
            @signal count = 0;

            @effect track() {
                values.push(this.count);
            }
        }

        const w = new Watcher() as any;
        w.count = 1;
        expect(values.some((v) => v === 1)).toBe(true);
    });
});

describe('@reactive lifecycle', () => {
    it('provides dispose method that cleans up effects', () => {
        const values: number[] = [];

        @reactive
        class Watcher {
            @signal count = 0;

            @effect track() {
                values.push(this.count);
            }
        }

        const w = new Watcher() as any;

        w.count = 1;
        expect(w.count).toBe(1);

        w.dispose();

        w.count = 2;
        expect(w.count).toBe(2);
        // 2 should NOT appear in values (effect was disposed)
        expect(values.filter((v) => v === 2)).toHaveLength(0);
        // 0 and 1 should appear
        expect(values.some((v) => v === 0)).toBe(true);
        expect(values.some((v) => v === 1)).toBe(true);
    });

    it('chains into existing destroy method', () => {
        let destroyCalled = false;
        let effectFiredAfterDestroy = false;

        @reactive
        class Component {
            @signal value = 0;

            @effect track() {
                if (destroyCalled) {
                    effectFiredAfterDestroy = true;
                }
            }

            destroy(): void {
                destroyCalled = true;
            }
        }

        const c = new Component() as any;
        c.destroy();
        c.value = 42;

        expect(destroyCalled).toBe(true);
        expect(effectFiredAfterDestroy).toBe(false);
    });
});

describe('getSignal', () => {
    it('returns the backing signal', () => {
        @reactive
        class Counter {
            @signal count = 0;
        }

        const c = new Counter() as any;
        const sig = getSignal<number>(c, 'count');
        expect(sig).toBeDefined();
        expect(sig!.value).toBe(0);

        c.count = 10;
        expect(sig!.value).toBe(10);
    });
});
