/**
 * @module blue-proxy
 * @since 1.0.0
 * @author Jeff Rose
 */

import { describe, expect, it } from 'vitest';
import {
    invokeChain,
    sortInterceptors,
    createMethodDescriptor,
    MethodInterceptor,
    MethodInvocation,
} from '@blue/proxy';
import { methodAnnotation } from '@blue/proxy';

describe('interceptor API', () => {
    const audited = methodAnnotation<{ action: string }>('audited');

    class Service {
        #secret = 's3cret';

        @audited({ action: 'run' })
        run(value: string): string {
            return `${value}:${this.#secret}`;
        }
    }

    it('exposes entry, method, and annotation via the descriptor', () => {
        const descriptor = createMethodDescriptor(Service, 'service', 'run');

        expect(descriptor.entryName).toBe('service');
        expect(descriptor.targetType).toBe(Service);
        expect(descriptor.methodName).toBe('run');
        expect(descriptor.annotation(audited)).toEqual({ action: 'run' });
        expect(descriptor.annotation(methodAnnotation('other'))).toBeUndefined();
    });
});

describe('invokeChain', () => {
    interface CallLog {
        interceptor: string;
        args: readonly unknown[];
    }

    class Service {
        run(_value: string): string {
            return 'result';
        }
    }

    const call: MethodInvocation = {
        entryName: 'service',
        targetType: Service,
        methodName: 'run',
        target: new Service(),
        args: ['x'],
        annotation: () => undefined,
    };

    function recordingInterceptor(name: string, order?: number, next?: boolean) {
        const log: CallLog[] = [];
        const interceptor: MethodInterceptor = {
            order,
            matches: () => true,
            invoke: (invocation, proceed) => {
                log.push({ interceptor: name, args: [...invocation.args] });
                if (next !== false) {
                    return proceed();
                }
                return 'short-circuit';
            },
        };
        return { log, interceptor };
    }

    it('invokes interceptors in order and reaches the tail', () => {
        const a = recordingInterceptor('a', 1);
        const b = recordingInterceptor('b', 0);
        const c = recordingInterceptor('c');
        const tailCalls: string[] = [];

        const result = invokeChain([a.interceptor, b.interceptor, c.interceptor], call, () => {
            tailCalls.push('tail');
            return 'result';
        });

        expect(result).toBe('result');
        // Actual call order: b (order 0) → a (order 1) → c (registration order)
        expect([...b.log, ...a.log, ...c.log].map((e) => e.interceptor)).toEqual(['b', 'a', 'c']);
        expect(tailCalls).toEqual(['tail']);
    });

    it('propagates call args to interceptors and the tail', () => {
        const seen: unknown[][] = [];
        const interceptor: MethodInterceptor = {
            matches: () => true,
            invoke: (invocation, proceed) => {
                seen.push([...invocation.args]);
                return proceed();
            },
        };

        invokeChain([interceptor], call, () => {
            seen.push(['tail']);
            return 'result';
        });

        expect(seen).toEqual([['x'], ['tail']]);
    });

    it('short-circuits when an interceptor does not proceed', () => {
        const a = recordingInterceptor('a', 0, false);
        const b = recordingInterceptor('b');
        let tailCalled = false;

        const result = invokeChain([a.interceptor, b.interceptor], call, () => {
            tailCalled = true;
            return 'result';
        });

        expect(result).toBe('short-circuit');
        expect(tailCalled).toBe(false);
        expect(b.log).toEqual([]);
    });

    it('re-enters the chain when next() is invoked twice (retry pattern)', () => {
        const tailCalls: string[] = [];
        const counting: MethodInterceptor = {
            matches: () => true,
            invoke: (_invocation, proceed) => {
                proceed();
                return proceed();
            },
        };

        invokeChain([counting], call, () => {
            tailCalls.push('tail');
            return 'result';
        });

        // Each next() invocation re-runs the remaining chain and tail —
        // around-advice (retry) depends on this.
        expect(tailCalls).toEqual(['tail', 'tail']);
    });

    it('propagates interceptor exceptions', () => {
        const boom = new Error('boom');
        const interceptor: MethodInterceptor = {
            matches: () => true,
            invoke: () => {
                throw boom;
            },
        };

        expect(() => invokeChain([interceptor], call, () => 'result')).toThrow('boom');
    });

    it('invokes the tail directly for an empty chain', () => {
        let tailCalled = false;
        const result = invokeChain([], call, () => {
            tailCalled = true;
            return 'result';
        });

        expect(result).toBe('result');
        expect(tailCalled).toBe(true);
    });
});

describe('sortInterceptors', () => {
    // sortInterceptors only reads `order`; a `name` tags each mock so the
    // sorted result can be asserted by identity, even though the
    // MethodInterceptor contract doesn't declare a name.
    function namedInterceptor(name: string, order?: number): MethodInterceptor & { name: string } {
        return {
            order,
            name,
            matches: () => true,
            invoke: () => undefined,
        };
    }

    it('is stable within equal orders', () => {
        const a = namedInterceptor('a', 0);
        const b = namedInterceptor('b', 0);
        const c = namedInterceptor('c', -1);

        const sorted = sortInterceptors([a, b, c]) as Array<MethodInterceptor & { name: string }>;

        expect(sorted.map((i) => i.name)).toEqual(['c', 'a', 'b']);
    });

    it('treats missing order as 0', () => {
        const a = namedInterceptor('a');
        const b = namedInterceptor('b', 1);

        expect((sortInterceptors([a, b]) as Array<MethodInterceptor & { name: string }>).map((i) => i.name)).toEqual([
            'a',
            'b',
        ]);
        expect((sortInterceptors([b, a]) as Array<MethodInterceptor & { name: string }>).map((i) => i.name)).toEqual([
            'a',
            'b',
        ]);
    });
});
