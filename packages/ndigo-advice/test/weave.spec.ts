/**
 * Weaving strategies, the standalone path, and the registry.
 */
import '@tsmetadata/polyfill';
import { describe, test, expect, vi } from 'vitest';
import { classAnnotation, methodAnnotation } from '@ndigo/core';

import { hasAnnotation } from '../src/matchers';
import { AdviceOrder, DEFAULT_ADVICE_ORDER } from '../src/order';
import { MethodInterceptorRegistry } from '../src/registry';
import { createIntercepted, interceptMethods, planFor, weaveInstance } from '../src/weave';
import type { MethodInterceptor } from '../src/interceptor';

const audited = methodAnnotation<{ action: string }>('orders:audited');

/** Records calls and forwards them. */
function recorder(log: string[], label = 'advice'): MethodInterceptor {
    return {
        invoke(invocation, next) {
            log.push(`${label}:${String(invocation.methodName)}`);
            return next();
        },
    };
}

describe('standalone weaving', () => {
    class OrderService {
        @audited({ action: 'order.submit' })
        submit(): string {
            return 'ok';
        }

        other(): string {
            return 'other';
        }
    }

    test('interceptMethods advises without a container', () => {
        const log: string[] = [];
        const service = interceptMethods(new OrderService(), [{ when: hasAnnotation(audited), use: recorder(log) }]);

        expect(service.submit()).toBe('ok');
        expect(log).toEqual(['advice:submit']);
    });

    test('createIntercepted constructs and advises', () => {
        const log: string[] = [];
        const service = createIntercepted(OrderService, [{ when: hasAnnotation(audited), use: recorder(log) }]);

        expect(service).toBeInstanceOf(OrderService);
        expect(service.submit()).toBe('ok');
        expect(log).toEqual(['advice:submit']);
    });

    test('weaving the same instance twice reuses the first result', () => {
        const rules = [{ use: recorder([]) }];
        const service = new OrderService();

        const first = interceptMethods(service, rules);
        const second = interceptMethods(service, rules);

        expect(second).toBe(first);
    });

    test('an object nothing matches keeps its identity and is not marked woven', () => {
        const service = new OrderService();
        const { instance, strategy } = weaveInstance(service, [{ when: { matches: () => false }, use: recorder([]) }]);

        expect(instance).toBe(service);
        expect(strategy).toBe('none');
    });

    test('planFor reports the advised surface without weaving', () => {
        const plans = planFor(new OrderService(), [{ when: hasAnnotation(audited), use: recorder([]) }]);

        expect(plans.map((plan) => plan.descriptor.methodName)).toEqual(['submit']);
    });

    test('the entry name defaults to the class name', () => {
        const log: string[] = [];
        const service = interceptMethods(new OrderService(), [
            {
                when: hasAnnotation(audited),
                use: {
                    invoke(invocation, next) {
                        log.push(invocation.entryName);
                        return next();
                    },
                },
            },
        ]);

        service.submit();
        expect(log).toEqual(['OrderService']);
    });
});

describe('proxy fallback', () => {
    class OrderService {
        #id = 'order-1';

        @audited({ action: 'order.submit' })
        submit(): string {
            return this.describe();
        }

        describe(): string {
            return this.#id;
        }
    }

    test('a frozen instance is woven through a proxy and still works', () => {
        const log: string[] = [];
        const frozen = Object.freeze(new OrderService());

        const { instance, strategy } = weaveInstance(frozen, [{ when: hasAnnotation(audited), use: recorder(log) }]);

        expect(strategy).toBe('proxy');
        expect(instance).not.toBe(frozen);
        expect(instance.submit()).toBe('order-1');
        expect(log).toEqual(['advice:submit']);
    });

    test('the documented boundary: identity is not preserved', () => {
        const frozen = Object.freeze(new OrderService());
        const { instance } = weaveInstance(frozen, [{ use: recorder([]) }]);

        expect(instance === frozen).toBe(false);
    });

    test('the documented boundary: self-invocation bypasses advice', () => {
        const log: string[] = [];
        const frozen = Object.freeze(new OrderService());

        const service = interceptMethods(frozen, [
            { when: hasAnnotation(audited), use: recorder(log, 'audit') },
            { when: { matches: (m) => m.methodName === 'describe' }, use: recorder(log, 'describe') },
        ]);

        service.submit();
        // `this.describe()` inside `submit` resolves the prototype method with
        // the proxy as receiver, so it runs unadvised.
        expect(log).toEqual(['audit:submit']);
    });

    test('unadvised proxy methods keep `#private` access', () => {
        const frozen = Object.freeze(new OrderService());
        const service = interceptMethods(frozen, [{ when: hasAnnotation(audited), use: recorder([]) }]);

        expect(service.describe()).toBe('order-1');
    });
});

describe('wrapper transparency', () => {
    class Handled {
        @audited({ action: 'handle' })
        handle(path: string, extra: number): string {
            return `${path}:${extra}`;
        }
    }

    const handler = { when: hasAnnotation(audited), use: recorder([]) };

    /**
     * The shape the dispatcher reads `@parameters` names from: it calls
     * `fn.toString()` (`_decorator-util.ts`), so this mirrors that call rather
     * than forcing `Function.prototype.toString`.
     *
     * @param fn - The method to inspect.
     * @returns The declared parameter names.
     */
    function parameterNames(fn: (...args: never[]) => unknown): string[] {
        const match = fn.toString().match(/(?:function\s*)?[^(]*\(([^)]*)\)/);
        return (match?.[1] ?? '')
            .split(',')
            .map((name) => name.trim())
            .filter(Boolean);
    }

    test('advice does not change what the method source reveals', () => {
        // Framework code resolves `@parameters` names by reading the function
        // source, so a wrapped method must read exactly like the declared one.
        const declared = parameterNames(Handled.prototype.handle);
        expect(declared).toEqual(['path', 'extra']);

        const advised = interceptMethods(new Handled(), [handler]);
        expect(parameterNames(advised.handle)).toEqual(['path', 'extra']);
    });

    test('advice preserves the declared arity and name', () => {
        const advised = interceptMethods(new Handled(), [handler]);

        expect(advised.handle.length).toBe(2);
        expect(advised.handle.name).toBe('handle');
        // Still a distinct function: wrapping is the point.
        expect(advised.handle).not.toBe(Handled.prototype.handle);
    });

    test('the proxy fallback is transparent too', () => {
        const frozen = Object.freeze(new Handled());
        const advised = interceptMethods(frozen, [handler]);

        expect(parameterNames(advised.handle)).toEqual(['path', 'extra']);
        expect(advised.handle.length).toBe(2);
    });
});

describe('registry', () => {
    test('keeps registration order and skips identity duplicates', () => {
        const registry = new MethodInterceptorRegistry();
        const first = { use: recorder([]) };
        const second = { use: recorder([]) };

        registry.add(first).add(first).add(second);

        expect(registry.rules).toEqual([first, second]);
        expect(registry.isEmpty).toBe(false);
    });

    test('a fresh registry accepts no rules', () => {
        expect(new MethodInterceptorRegistry().isEmpty).toBe(true);
    });

    test('weaving accepts a registry directly', () => {
        const log: string[] = [];

        class Service {
            @audited({ action: 'x' })
            run(): void {}
        }

        const registry = new MethodInterceptorRegistry().add({ when: hasAnnotation(audited), use: recorder(log) });
        interceptMethods(new Service(), registry).run();

        expect(log).toEqual(['advice:run']);
    });
});

describe('hasAnnotation', () => {
    class Service {
        @audited({ action: 'write' })
        write(): void {}

        @audited({ action: 'read' })
        read(): void {}
    }

    test('matches any annotated method', () => {
        const plans = planFor(new Service(), [{ when: hasAnnotation(audited), use: recorder([]) }]);

        expect(plans.map((plan) => plan.descriptor.methodName)).toEqual(['write', 'read']);
    });

    test('narrows by annotation value', () => {
        const plans = planFor(new Service(), [
            { when: hasAnnotation(audited, (spec) => spec.action === 'write'), use: recorder([]) },
        ]);

        expect(plans.map((plan) => plan.descriptor.methodName)).toEqual(['write']);
    });
});

describe('class-level declarations', () => {
    const guarded = classAnnotation<{ scope: string }>('probe:guarded');

    @guarded({ scope: 'class-wide' })
    class GuardedService {
        one(): string {
            return 'one';
        }

        @audited({ action: 'specific' })
        two(): string {
            return 'two';
        }
    }

    // A member declaration outranks the class's, so the blanket value must not
    // overwrite a method that declared its own.
    class MixedService {
        @audited({ action: 'own' })
        one(): string {
            return 'one';
        }

        two(): string {
            return 'two';
        }
    }

    test('a class-level declaration covers every member', () => {
        const plans = planFor(new GuardedService(), [{ when: hasAnnotation(guarded), use: recorder([]) }]);

        expect(plans.map((plan) => plan.descriptor.methodName)).toEqual(['one', 'two']);
    });

    test('an interceptor reads the class-level value for an undeclared member', () => {
        const seen: (string | undefined)[] = [];
        const service = interceptMethods(new GuardedService(), [
            {
                when: hasAnnotation(guarded),
                use: {
                    invoke(invocation, next) {
                        seen.push(invocation.annotation(guarded)?.scope);
                        return next();
                    },
                },
            },
        ]);

        service.one();
        expect(seen).toEqual(['class-wide']);
    });

    test('a member declaration is not shadowed by the class-level one', () => {
        class PartiallyGuarded extends GuardedService {}

        @guarded({ scope: 'class-wide' })
        class Child extends PartiallyGuarded {}

        // `two` declares its own `audited`; the class-level `guarded` still
        // resolves for it, and the member value wins for `audited`.
        const plans = planFor(new Child(), [{ when: hasAnnotation(audited), use: recorder([]) }]);

        expect(plans.map((plan) => plan.descriptor.methodName)).toEqual(['two']);
    });

    test('class-level values do not leak into an unrelated member read', () => {
        const plans = planFor(new MixedService(), [{ when: hasAnnotation(guarded), use: recorder([]) }]);

        expect(plans).toEqual([]);
    });
});

describe('AdviceOrder', () => {
    test('bands are ordered outermost-first', () => {
        expect(AdviceOrder.Observability).toBeLessThan(AdviceOrder.Resilience);
        expect(AdviceOrder.Resilience).toBeLessThan(AdviceOrder.Transaction);
        expect(AdviceOrder.Transaction).toBeLessThan(AdviceOrder.Application);
        expect(AdviceOrder.Application).toBeLessThan(AdviceOrder.Innermost);
    });

    test('a rule that names no order lands in the Application band', () => {
        // Not outermost: an unordered rule must not wrap observability, or one
        // traced call would become one span per retry attempt.
        expect(DEFAULT_ADVICE_ORDER).toBe(AdviceOrder.Application);

        const log: string[] = [];

        class Service {
            run(): void {
                log.push('run');
            }
        }

        const service = interceptMethods(new Service(), [
            { use: recorder(log, 'unordered') },
            { use: recorder(log, 'observability'), order: AdviceOrder.Observability },
        ]);

        service.run();
        expect(log).toEqual(['observability:run', 'unordered:run', 'run']);
    });

    test('an interceptor order is used when the rule names none', () => {
        const log: string[] = [];

        class Service {
            run(): void {
                log.push('run');
            }
        }

        const service = interceptMethods(new Service(), [
            { use: { order: AdviceOrder.Observability, ...recorder(log, 'banded') } },
            { use: recorder(log, 'unordered') },
        ]);

        service.run();
        expect(log).toEqual(['banded:run', 'unordered:run', 'run']);
    });

    test('a rule order overrides the interceptor band', () => {
        const log: string[] = [];

        class Service {
            run(): void {
                log.push('run');
            }
        }

        const service = interceptMethods(new Service(), [
            { use: { order: AdviceOrder.Observability, ...recorder(log, 'moved') }, order: AdviceOrder.Innermost },
            { use: recorder(log, 'default') },
        ]);

        service.run();
        expect(log).toEqual(['default:run', 'moved:run', 'run']);
    });

    test('registrations interleave by band, not by feature', () => {
        const log: string[] = [];

        class Service {
            run(): void {
                log.push('run');
            }
        }

        const registry = new MethodInterceptorRegistry()
            .add({ use: recorder(log, 'transaction'), order: AdviceOrder.Transaction })
            .add({ use: recorder(log, 'observability'), order: AdviceOrder.Observability })
            .add({ use: recorder(log, 'resilience'), order: AdviceOrder.Resilience });

        interceptMethods(new Service(), registry).run();

        expect(log).toEqual(['observability:run', 'resilience:run', 'transaction:run', 'run']);
    });
});

describe('validation', () => {
    test('validate runs at plan time, before any call', () => {
        const validate = vi.fn(() => {
            throw new TypeError('bad spec');
        });

        class Service {
            @audited({ action: 'x' })
            run(): void {}
        }

        expect(() =>
            interceptMethods(new Service(), [
                { when: hasAnnotation(audited), use: { validate, invoke: (_i, next) => next() } },
            ])
        ).toThrow('bad spec');
        expect(validate).toHaveBeenCalledTimes(1);
    });
});
