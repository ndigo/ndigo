/**
 * `AbstractBaseInstrumentation` enable/disable latch regression spec (OP-6).
 *
 * The platform `InstrumentationBase` runs the subclass's `enable()` from its
 * constructor, and the SDK's `registerInstrumentations` enables it again. A
 * browser-shaped `_wrap` (plain `shimmer.wrap`) would nest a second wrapper
 * and a single `disable()` would leave the inner one live — so the shared
 * base must latch each enable/disable cycle.
 *
 * @module blue-telemetry
 * @since 1.0.0
 * @author Jeff Rose
 */
import { describe, expect, it } from 'vitest';
import { AbstractBaseInstrumentation } from '../src/instrumentation/base';

/**
 * Builds an isolated target class plus an instrumentation whose
 * `enable`/`disable` record into `events` — the calls made to the subclass
 * hooks are the latch observable (`_wrap` itself self-heals on the Node
 * platform, so wrapper layers alone would hide a double enable).
 *
 * @returns The event log, target class, and instrumentation class.
 */
function harness() {
    const events: string[] = [];

    class Target {
        greet(): string {
            return 'hello';
        }
    }

    class TestInstrumentation extends AbstractBaseInstrumentation {
        constructor() {
            super('test-latch');
        }

        enable(): void {
            events.push('enable');
            this._wrap(Target.prototype, 'greet', (original) => {
                return function (this: unknown): string {
                    events.push('wrapped');
                    return original.apply(this);
                };
            });
        }

        disable(): void {
            events.push('disable');
            this._unwrap(Target.prototype, 'greet');
        }
    }

    return { events, Target, Instrumentation: TestInstrumentation };
}

describe('AbstractBaseInstrumentation enable latch', () => {
    it('patches once although the constructor and enable() both enable', () => {
        const { events, Target, Instrumentation } = harness();
        const instrumentation = new Instrumentation();
        const target = new Target();

        // `InstrumentationBase`'s constructor has already enabled the
        // instrumentation exactly once.
        expect(events).toEqual(['enable']);

        // SDK re-registration — must be a no-op, not a second patch.
        instrumentation.enable();
        expect(events).toEqual(['enable']);

        expect(target.greet()).toBe('hello');
        expect(events).toEqual(['enable', 'wrapped']);
    });

    it('disable() unwinds fully and is idempotent; enable() re-arms', () => {
        const { events, Target, Instrumentation } = harness();
        const instrumentation = new Instrumentation();
        const target = new Target();

        instrumentation.enable(); // latched: already enabled
        instrumentation.disable();
        expect(events).toEqual(['enable', 'disable']);
        expect(target.greet()).toBe('hello'); // unwrapped — no 'wrapped' event

        instrumentation.disable(); // latched: already disabled
        expect(events).toEqual(['enable', 'disable']);

        instrumentation.enable(); // re-arm after a disable cycle
        expect(events).toEqual(['enable', 'disable', 'enable']);
        expect(target.greet()).toBe('hello');
        expect(events).toEqual(['enable', 'disable', 'enable', 'wrapped']);
    });
});
