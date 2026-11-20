/**
 * Shadow-weaving spike.
 *
 * Proves the properties the runtime depends on: identity preservation, advised
 * self-invocation, `#private` access, untouched getters, stable method
 * identity, and the exact boundary where the Proxy fallback is required.
 */
import '@tsmetadata/polyfill';
import { describe, test, expect, vi } from 'vitest';
import { methodAnnotation } from '@ndigo/core';

import { invokeChain } from '../src/chain';
import { compileMethodPlan } from '../src/plan';
import { enumerateMethodNames, entryNameOf, shadowObstacle, shadowWeave } from '../src/shadow';
import type { MethodDescriptor, MethodInterceptorRule, MethodInterceptor } from '../src/interceptor';

const audited = methodAnnotation<{ action: string }>('orders:audited');

/**
 * Around-advice that records each call and forwards it unchanged.
 */
function recordingInterceptor(log: string[], label: string): MethodInterceptor {
    return {
        invoke(invocation, next) {
            log.push(`${label}:${String(invocation.methodName)}`);
            return next();
        },
    };
}

/**
 * Compiles and weaves in one step, the way the container path will.
 */
function weave<T extends object>(instance: T, rules: readonly MethodInterceptorRule[]): T {
    const targetType = Object.getPrototypeOf(instance)?.constructor ?? Object;
    const names = enumerateMethodNames(instance);
    const plans = compileMethodPlan(targetType, entryNameOf(instance), names, rules);
    return shadowWeave(instance, plans);
}

describe('shadow weaving: identity', () => {
    class OrderService {
        @audited({ action: 'order.submit' })
        submit(): string {
            return 'ok';
        }
    }

    test('returns the same object, so identity is preserved', () => {
        const service = new OrderService();
        const woven = weave(service, [
            {
                when: { matches: (m: MethodDescriptor) => m.annotation(audited) !== undefined },
                use: recordingInterceptor([], 'audit'),
            },
        ]);

        expect(woven).toBe(service);
        expect(woven instanceof OrderService).toBe(true);
    });

    test('installed wrappers are non-enumerable, like the methods they shadow', () => {
        const service = new OrderService();
        weave(service, [{ use: recordingInterceptor([], 'audit') }]);

        expect(Object.keys(service)).toEqual([]);
        expect(Object.getOwnPropertyDescriptor(service, 'submit')?.enumerable).toBe(false);
    });

    test('weaving twice is a no-op, so advice runs once per call', () => {
        const log: string[] = [];
        const service = new OrderService();
        const rules = [{ use: recordingInterceptor(log, 'audit') }];

        weave(service, rules);
        weave(service, rules);
        service.submit();

        expect(log).toEqual(['audit:submit']);
    });

    test('unadvised sibling methods keep their prototype identity', () => {
        const log: string[] = [];
        const service = new OrderService();
        weave(service, [
            { when: { matches: (m) => m.methodName === 'submit' }, use: recordingInterceptor(log, 'audit') },
        ]);

        expect(service.submit).not.toBe(OrderService.prototype.submit);
        expect(Object.hasOwn(service, 'submit')).toBe(true);
    });
});

describe('shadow weaving: call semantics', () => {
    test('self-invocation runs advice', () => {
        const log: string[] = [];

        class OrderService {
            @audited({ action: 'order.place' })
            place(): string {
                return this.reserve();
            }

            reserve(): string {
                return 'reserved';
            }
        }

        const service = weave(new OrderService(), [
            { when: { matches: (m) => m.annotation(audited) !== undefined }, use: recordingInterceptor(log, 'audit') },
            { when: { matches: (m) => m.methodName === 'reserve' }, use: recordingInterceptor(log, 'reserve') },
        ]);

        expect(service.place()).toBe('reserved');
        // The nested call is advised because `this.reserve` resolves the own
        // wrapper installed on the instance.
        expect(log).toEqual(['audit:place', 'reserve:reserve']);
    });

    test('advice reaches `#private` state because the instance is the receiver', () => {
        class Account {
            #balance = 100n;

            withdraw(amount: bigint): bigint {
                this.#balance -= amount;
                return this.#balance;
            }
        }

        const account = shadowWeave(
            new Account(),
            compileMethodPlan(
                Account,
                'account',
                ['withdraw'],
                [
                    {
                        use: {
                            invoke(invocation, next) {
                                return next();
                            },
                        },
                    },
                ]
            )
        );

        expect(account.withdraw(30n)).toBe(70n);
    });

    test('a short-circuiting interceptor never runs the method', () => {
        class OrderService {
            submit(): string {
                throw new Error('should not run');
            }
        }

        const service = shadowWeave(
            new OrderService(),
            compileMethodPlan(OrderService, 'orderService', ['submit'], [{ use: { invoke: () => 'cached' } }])
        );

        expect(service.submit()).toBe('cached');
    });

    test('retry re-entry re-runs the tail', () => {
        let attempts = 0;

        class Flaky {
            run(): string {
                attempts++;
                if (attempts < 3) {
                    throw new Error('flaky');
                }
                return 'done';
            }
        }

        const retry: MethodInterceptor = {
            invoke(_invocation, next) {
                let lastError: unknown;
                for (let attempt = 0; attempt < 3; attempt++) {
                    try {
                        return next();
                    } catch (error) {
                        lastError = error;
                    }
                }
                throw lastError;
            },
        };

        const flaky = shadowWeave(new Flaky(), compileMethodPlan(Flaky, 'flaky', ['run'], [{ use: retry }]));

        expect(flaky.run()).toBe('done');
        expect(attempts).toBe(3);
    });

    test('retains `this` for a wrapper captured off the instance', () => {
        class OrderService {
            #id = 'order-1';

            submit(): string {
                return this.#id;
            }
        }

        const service = shadowWeave(
            new OrderService(),
            compileMethodPlan(OrderService, 'orderService', ['submit'], [{ use: { invoke: (_i, next) => next() } }])
        );

        const submit = service.submit;
        expect(submit()).toBe('order-1');
    });
});

describe('shadow weaving: untouched surface', () => {
    class Shape {
        #label = 'shape';

        get label(): string {
            return this.#label;
        }

        area(): number {
            return 1;
        }
    }

    test('getters are neither wrapped nor invoked early', () => {
        const service = weave(new Shape(), [
            { when: { matches: (m) => m.methodName === 'area' }, use: { invoke: (_i, next) => next() } },
        ]);

        expect(Object.hasOwn(service, 'label')).toBe(false);
        expect(service.label).toBe('shape');
    });

    test('method identity is stable across reads', () => {
        const service = weave(new Shape(), [{ use: { invoke: (_i, next) => next() } }]);

        expect(service.area).toBe(service.area);
    });
});

describe('shadow weaving: order', () => {
    test('rules compose outermost-first by effective order', () => {
        const log: string[] = [];

        class Service {
            run(): string {
                log.push('run');
                return 'ok';
            }
        }

        const service = shadowWeave(
            new Service(),
            compileMethodPlan(
                Service,
                'service',
                ['run'],
                [
                    { use: recordingInterceptor(log, 'inner'), order: 20 },
                    { use: recordingInterceptor(log, 'outer'), order: 10 },
                ]
            )
        );

        service.run();
        expect(log).toEqual(['outer:run', 'inner:run', 'run']);
    });

    test('a rule order overrides the interceptor order', () => {
        const log: string[] = [];
        const advice = recordingInterceptor(log, 'shared');

        class Service {
            run(): void {}
        }

        const service = shadowWeave(
            new Service(),
            compileMethodPlan(
                Service,
                'service',
                ['run'],
                [
                    { use: advice, order: 30 },
                    { use: recordingInterceptor(log, 'other'), order: 20 },
                ]
            )
        );

        service.run();
        expect(log).toEqual(['other:run', 'shared:run']);
    });
});

describe('shadow weaving: plan compilation', () => {
    test('validate runs once per matched method, at compile time', () => {
        const validate = vi.fn();

        class Service {
            @audited({ action: 'a' })
            one(): void {}
            two(): void {}
        }

        compileMethodPlan(
            Service,
            'service',
            ['one', 'two'],
            [
                {
                    when: { matches: (m) => m.annotation(audited) !== undefined },
                    use: { validate, invoke: (_i, next) => next() },
                },
            ]
        );

        expect(validate).toHaveBeenCalledTimes(1);
        expect(validate.mock.calls[0][0].methodName).toBe('one');
    });

    test('a rule without `when` matches every method', () => {
        class Service {
            one(): void {}
            two(): void {}
        }

        const plans = compileMethodPlan(
            Service,
            'service',
            ['one', 'two'],
            [{ use: { invoke: (_i, next) => next() } }]
        );

        expect(plans.map((plan) => plan.descriptor.methodName)).toEqual(['one', 'two']);
    });

    test('methods matched by no rule produce no plan', () => {
        class Service {
            one(): void {}
            two(): void {}
        }

        const plans = compileMethodPlan(
            Service,
            'service',
            ['one', 'two'],
            [{ when: { matches: (m) => m.methodName === 'two' }, use: { invoke: (_i, next) => next() } }]
        );

        expect(plans.map((plan) => plan.descriptor.methodName)).toEqual(['two']);
    });

    test('an interceptor that never calls next leaves the tail unreached', () => {
        const tail = vi.fn(() => 'tail');

        expect(invokeChain([{ invoke: () => 'short' }], {} as never, tail)).toBe('short');
        expect(tail).not.toHaveBeenCalled();
    });
});

describe('shadow weaving: fallback boundary', () => {
    test('a frozen instance cannot be shadow-woven', () => {
        class Service {
            run(): void {}
        }
        const service = Object.freeze(new Service());

        expect(shadowObstacle(service, ['run'])).toContain('non-extensible');
    });

    test('a sealed instance cannot be shadow-woven', () => {
        class Service {
            run(): void {}
        }
        const service = Object.seal(new Service());

        expect(shadowObstacle(service, ['run'])).toContain('non-extensible');
    });

    test('an own non-configurable member blocks the whole instance', () => {
        class Service {
            run(): void {}
        }
        const service = new Service();
        Object.defineProperty(service, 'run', { value: () => {}, configurable: false, writable: true });

        expect(shadowObstacle(service, ['run'])).toContain('non-configurable');
    });

    test('an own accessor blocks the whole instance', () => {
        class Service {
            run(): void {}
        }
        const service = new Service();
        Object.defineProperty(service, 'run', { get: () => () => {}, configurable: true });

        expect(shadowObstacle(service, ['run'])).toContain('accessor');
    });

    test('a function target falls back to Proxy weaving', () => {
        function ServiceClient(): void {}
        ServiceClient.prototype.fetch = function fetch(): void {};

        expect(shadowObstacle(ServiceClient as unknown as object, ['fetch'])).toContain('shared prototype');
    });

    test('a plain extensible instance with no conflicts is weavable', () => {
        class Service {
            run(): void {}
        }

        expect(shadowObstacle(new Service(), ['run'])).toBeNull();
    });

    test('shadowWeave throws instead of silently skipping advice', () => {
        class Service {
            run(): void {}
        }
        const service = Object.freeze(new Service());

        expect(() =>
            shadowWeave(
                service,
                compileMethodPlan(Service, 'service', ['run'], [{ use: { invoke: (_i, next) => next() } }])
            )
        ).toThrow(TypeError);
    });
});
