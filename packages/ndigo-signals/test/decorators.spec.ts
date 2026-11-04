/**
 * @module ndigo-signals
 * @since 1.0.0
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

        const c = new Counter();
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

        const c = new Counter();
        expect(c.doubled).toBe(0);

        c.count = 3;
        expect(c.doubled).toBe(6);
    });

    it('each instance has independent signal', () => {
        @reactive
        class Store {
            @signal value = 'default';
        }

        const a = new Store();
        const b = new Store();

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

        const calc = new Calculator();
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

        const c = new Calc();
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

        const c = new Calc();
        expect(computeCount).toBe(0); // lazy — not computed yet

        void c.doubled; // first access
        expect(computeCount).toBe(1);

        void c.doubled; // cached
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

        const w = new Watcher();

        w.count = 1;
        w.count = 2;

        expect(values).toContain(1);
        expect(values).toContain(2);
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

        // @reactive installs a dispose() method at runtime that the class type doesn't declare.
        const w = new Watcher() as Watcher & { dispose(): void };

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

        const c = new Component();
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

        const c = new Counter();
        const sig = getSignal<number>(c, 'count');
        expect(sig).toBeDefined();
        // sig is proven defined by the assertion above; narrow for typed access.
        if (sig === undefined) {
            throw new Error('expected getSignal to return the backing signal');
        }
        expect(sig.value).toBe(0);

        c.count = 10;
        expect(sig.value).toBe(10);
    });
});

describe('@reactive inheritance', () => {
    it('does not activate @signal/@effect members declared in an undecorated subclass', () => {
        let subclassEffectRuns = 0;

        @reactive
        class Base {
            @signal x = 1;
        }

        class Sub extends Base {
            @signal y = 2;

            @effect trackY() {
                subclassEffectRuns++;
                void this.y;
            }
        }

        const s = new Sub();

        // Documented limitation: the subclass field stays a plain data property
        // and its effect never runs, while the decorated base class still works.
        const descriptor = Object.getOwnPropertyDescriptor(s, 'y');
        expect(descriptor?.value).toBe(2);
        expect(descriptor?.get).toBeUndefined();
        expect(subclassEffectRuns).toBe(0);

        s.x = 7;
        expect(s.x).toBe(7);

        // getSignal names the pending member and both possible causes.
        expect(() => getSignal(s, 'y')).toThrow(/@signal 'y' is pending on an instance of Sub/);
        expect(() => getSignal(s, 'y')).toThrow(
            /either the class is missing the @reactive class decorator, or the member is declared on a subclass of a @reactive class/
        );
        // Requesting a sibling member still reports the pending set.
        expect(() => getSignal(s, 'x')).toThrow(/@signal\/@effect fields \(y\) are pending on an instance of Sub/);
    });

    it('activates subclass members when the subclass is decorated with @reactive too', () => {
        @reactive
        class Base {
            @signal x = 1;
        }

        @reactive
        class Sub extends Base {
            @signal y = 2;

            @computed get sum(): number {
                return this.x + this.y;
            }
        }

        const s = new Sub();
        expect(s.sum).toBe(3);

        s.y = 20;
        expect(s.y).toBe(20);
        expect(s.sum).toBe(21);
        expect(getSignal<number>(s, 'y')?.value).toBe(20);
    });

    it('reports pending @effect methods with both possible causes', () => {
        class Undecorated {
            @effect track(): void {
                /* never runs — the class is missing @reactive */
            }
        }

        const u = new Undecorated();
        expect(() => getSignal(u, 'anything')).toThrow(
            /@effect methods \(1\) are pending on an instance of Undecorated/
        );
        expect(() => getSignal(u, 'anything')).toThrow(
            /either the class is missing the @reactive class decorator, or the member is declared on a subclass of a @reactive class/
        );
    });
});

describe('@reactive cleanup hardening (SIGNALS-10)', () => {
    interface WithTeardown {
        count: number;
        dispose(): void;
        destroy(): void;
    }

    it('does not throw at construction when the class declares a getter-only destroy', () => {
        @reactive
        class Widget {
            @signal count = 0;

            get destroy(): string {
                return 'not-a-method';
            }
        }

        expect(() => new Widget()).not.toThrow();
    });

    it('installs a working dispose when the class declares a getter-only dispose', () => {
        const values: number[] = [];

        @reactive
        class Watcher {
            @signal count = 0;

            @effect track() {
                values.push(this.count);
            }

            get dispose(): boolean {
                return false;
            }
        }

        const watcher = new Watcher() as unknown as WithTeardown;
        watcher.count = 1;

        expect(() => watcher.dispose()).not.toThrow();

        watcher.count = 2;
        expect(values.filter((v) => v === 2)).toHaveLength(0);
    });

    it('leaves an own non-configurable teardown property untouched instead of throwing', () => {
        const locked = (): void => undefined;

        class LockedBase {
            constructor() {
                Object.defineProperty(this, 'dispose', {
                    value: locked,
                    writable: false,
                    enumerable: false,
                    configurable: false,
                });
            }
        }

        @reactive
        class Locked extends LockedBase {
            @signal count = 0;
        }

        const instance = new Locked() as unknown as { dispose: () => void };
        expect(instance.dispose).toBe(locked);
    });

    it('keeps the installed teardown wrappers non-enumerable', () => {
        @reactive
        class Counter {
            @signal count = 0;
        }

        const counter = new Counter();

        expect(Object.keys(counter)).not.toContain('destroy');
        expect(Object.keys(counter)).not.toContain('dispose');
        expect(Object.getOwnPropertyDescriptor(counter, 'destroy')?.enumerable).toBe(false);
        expect(Object.getOwnPropertyDescriptor(counter, 'dispose')?.enumerable).toBe(false);
    });

    it('tears down base effects when a subclass declares destroy as a field', () => {
        const values: number[] = [];
        let subclassDestroyed = false;

        @reactive
        class Base {
            @signal count = 0;

            @effect track() {
                values.push(this.count);
            }
        }

        @reactive
        class Sub extends Base {
            destroy = (): void => {
                subclassDestroyed = true;
            };
        }

        const sub = new Sub() as unknown as WithTeardown;
        sub.count = 1;
        sub.destroy();

        expect(subclassDestroyed).toBe(true);
        sub.count = 2;
        expect(values.filter((v) => v === 2)).toHaveLength(0);
    });

    it('runs teardown exactly once when dispose and destroy are both called', () => {
        const values: number[] = [];

        @reactive
        class Watcher {
            @signal count = 0;

            @effect track() {
                values.push(this.count);
            }
        }

        const watcher = new Watcher() as unknown as WithTeardown;
        watcher.count = 1;
        watcher.dispose();
        watcher.destroy();

        watcher.count = 2;
        expect(values.filter((v) => v === 2)).toHaveLength(0);
    });
});
