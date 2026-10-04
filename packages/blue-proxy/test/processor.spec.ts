/**
 * @module blue-proxy
 * @since 1.0.0
 * @author Jeff Rose
 */

import { describe, expect, it } from 'vitest';
import { DefaultFactory } from '@blue/factory';
import { interception, methodAnnotation, MethodInterceptor } from '@blue/proxy';

describe('interception() container integration', () => {
    const audited = methodAnnotation<{ action: string }>('audited');

    class OrderService {
        #orders: string[] = [];

        @audited({ action: 'order.place' })
        place(order: string): string {
            this.#orders.push(order);
            return `ok:${order}`;
        }

        outer(): string {
            return `outer:${this.place('inner')}`;
        }

        plain(): string {
            return 'plain';
        }
    }

    class UncaredService {
        untouched(): string {
            return 'untouched';
        }
    }

    function audit(log: string[]) {
        const interceptor: MethodInterceptor = {
            matches: (method) => method.annotation(audited) !== undefined,
            invoke: (invocation, next) => {
                const spec = invocation.annotation(audited);
                if (spec !== undefined) {
                    log.push(`${spec.action}:${String(invocation.methodName)}`);
                }
                return next();
            },
        };
        return interceptor;
    }

    it('advises matched methods on entries created through the factory', () => {
        const factory = new DefaultFactory();
        const log: string[] = [];
        factory.addProcessor(interception([audit(log)]));
        factory.setValue('orders', OrderService);

        const service = factory.getValue<OrderService>('orders');

        expect(service.place('a')).toBe('ok:a');
        expect(service.plain()).toBe('plain');
        // Instance-level private state works through the proxy.
        expect(service.place('b')).toBe('ok:b');
        expect(log).toEqual(['order.place:place', 'order.place:place']);
        // The factory caches the woven proxy as the singleton.
        expect(factory.getValue<OrderService>('orders')).toBe(service);
    });

    it('keeps entries without matches unproxied, with no selection cost per call', () => {
        const factory = new DefaultFactory();
        const log: string[] = [];
        factory.addProcessor(interception([audit(log)]));
        factory.setValue('uncared', UncaredService);

        const service = factory.getValue<UncaredService>('uncared');

        expect(service.untouched()).toBe('untouched');
        expect(log).toEqual([]);
    });

    it('is idempotent when the same processor object is registered twice', () => {
        const factory = new DefaultFactory();
        const log: string[] = [];
        const processor = interception([audit(log)]);
        factory.addProcessor(processor);
        factory.addProcessor(processor);
        factory.setValue('orders', OrderService);

        const service = factory.getValue<OrderService>('orders');

        expect(service.place('a')).toBe('ok:a');
        expect(log).toEqual(['order.place:place']);
    });

    it('fails loudly when a second interception() processor meets a woven entry', () => {
        const factory = new DefaultFactory();
        const firstLog: string[] = [];
        const secondLog: string[] = [];
        factory.addProcessor(interception([audit(firstLog)]));
        factory.addProcessor(interception([audit(secondLog)]));
        factory.setValue('orders', OrderService);

        // A silent second registration would look configured but never run —
        // the guard fails loud instead.
        expect(() => factory.getValue<OrderService>('orders')).toThrow(
            /already intercepted — register exactly one interception\(\.\.\.\) processor/
        );
    });

    it('does not advise self-invocations of matched methods', () => {
        const factory = new DefaultFactory();
        const log: string[] = [];
        factory.addProcessor(interception([audit(log)]));
        factory.setValue('orders', OrderService);

        const service = factory.getValue<OrderService>('orders');

        expect(service.outer()).toBe('outer:ok:inner');
        expect(log).toEqual([]);

        expect(service.place('x')).toBe('ok:x');
        expect(log).toEqual(['order.place:place']);
    });
});
