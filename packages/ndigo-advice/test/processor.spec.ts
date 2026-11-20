/**
 * Container integration for the advice model.
 */
import { describe, expect, it, vi } from 'vitest';
import { DefaultFactory } from '@ndigo/factory';
import { methodAnnotation } from '@ndigo/core';

import { hasAnnotation } from '../src/matchers';
import { MethodInterceptorRegistry } from '../src/registry';
import { interception } from '../src/processor';
import { interceptMethods } from '../src/weave';
import type { MethodInterceptor } from '../src/interceptor';

/**
 * `interception(...)` always implements `processAfterInitialization`; the
 * processor interface leaves its hooks optional, so tests unwrap it
 * explicitly.
 */
const afterInitializationOf = (processor: ReturnType<typeof interception>) => {
    const hook = processor.processAfterInitialization;
    if (!hook) {
        throw new Error('interception() must implement processAfterInitialization');
    }
    return hook;
};

describe('interception() container integration', () => {
    const audited = methodAnnotation<{ action: string }>('orders:audited');

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

    function audit(log: string[]): MethodInterceptor {
        return {
            invoke(invocation, next) {
                const spec = invocation.annotation(audited);
                if (spec !== undefined) {
                    log.push(`${spec.action}:${String(invocation.methodName)}`);
                }
                return next();
            },
        };
    }

    function rulesFor(interceptor: MethodInterceptor) {
        return [{ when: hasAnnotation(audited), use: interceptor }];
    }

    it('advises matched methods on entries created through the factory', () => {
        const factory = new DefaultFactory();
        const log: string[] = [];
        factory.addProcessor(interception(rulesFor(audit(log))));
        factory.setValue('orders', OrderService);

        const service = factory.getValue<OrderService>('orders');

        expect(service.place('a')).toBe('ok:a');
        expect(service.plain()).toBe('plain');
        expect(service.place('b')).toBe('ok:b');
        expect(log).toEqual(['order.place:place', 'order.place:place']);
        // The factory caches the advised instance as the singleton.
        expect(factory.getValue<OrderService>('orders')).toBe(service);
    });

    it('keeps entries without matches untouched', () => {
        const factory = new DefaultFactory();
        const log: string[] = [];
        factory.addProcessor(interception(rulesFor(audit(log))));
        factory.setValue('uncared', UncaredService);

        const service = factory.getValue<UncaredService>('uncared');

        expect(service.untouched()).toBe('untouched');
        expect(log).toEqual([]);
    });

    it('is idempotent when the same processor object is registered twice', () => {
        const factory = new DefaultFactory();
        const log: string[] = [];
        const processor = interception(rulesFor(audit(log)));
        factory.addProcessor(processor);
        factory.addProcessor(processor);
        factory.setValue('orders', OrderService);

        const service = factory.getValue<OrderService>('orders');

        expect(service.place('a')).toBe('ok:a');
        expect(log).toEqual(['order.place:place']);
    });

    it('fails loudly when a second interception() processor meets an advised entry', () => {
        const factory = new DefaultFactory();
        factory.addProcessor(interception(rulesFor(audit([]))));
        factory.addProcessor(interception(rulesFor(audit([]))));
        factory.setValue('orders', OrderService);

        // A silent second registration would look configured but never run —
        // the guard fails loud instead.
        expect(() => factory.getValue<OrderService>('orders')).toThrow(
            /already advised — register exactly one interception\(\.\.\.\) processor/
        );
    });

    it('passes standalone-advised instances through with a warning', () => {
        const standaloneLog: string[] = [];
        const processor = interception(rulesFor(audit([])));
        const standalone = interceptMethods(new OrderService(), rulesFor(audit(standaloneLog)));

        const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
        try {
            const result = afterInitializationOf(processor)('orders', standalone);

            expect(result).toBe(standalone);
            expect(warn).toHaveBeenCalledTimes(1);
            expect(warn.mock.calls[0]?.[0]).toContain('already advised standalone');
            expect(standalone.place('solo')).toBe('ok:solo');
            expect(standaloneLog).toEqual(['order.place:place']);
        } finally {
            warn.mockRestore();
        }
    });

    it('advises self-invocations, unlike the proxy strategy it replaced', () => {
        const factory = new DefaultFactory();
        const log: string[] = [];
        factory.addProcessor(interception(rulesFor(audit(log))));
        factory.setValue('orders', OrderService);

        const service = factory.getValue<OrderService>('orders');

        expect(service.outer()).toBe('outer:ok:inner');
        expect(log).toEqual(['order.place:place']);
    });

    it('accepts a registry that features fill independently', () => {
        const factory = new DefaultFactory();
        const log: string[] = [];
        const registry = new MethodInterceptorRegistry();

        factory.addProcessor(interception(registry));
        registry.add({ when: hasAnnotation(audited), use: audit(log) });
        factory.setValue('orders', OrderService);

        // Rules are read at weave time, so a feature that registers after the
        // processor was installed still applies to entries created later.
        expect(factory.getValue<OrderService>('orders').place('a')).toBe('ok:a');
        expect(log).toEqual(['order.place:place']);
    });
});

describe('startup diagnostics', () => {
    const auditedDiagnostic = methodAnnotation<{ action: string }>('diag:audited');

    class AnnotatedButUnadvised {
        @auditedDiagnostic({ action: 'orphan' })
        run(): string {
            return 'ok';
        }
    }

    class Advised {
        @auditedDiagnostic({ action: 'claimed' })
        run(): string {
            return 'ok';
        }
    }

    it('warns once per class when nothing advises its annotations', () => {
        const processor = interception([{ when: { matches: () => false }, use: { invoke: (_i, next) => next() } }]);
        const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});

        try {
            afterInitializationOf(processor)('first', new AnnotatedButUnadvised());
            afterInitializationOf(processor)('second', new AnnotatedButUnadvised());

            expect(warn).toHaveBeenCalledTimes(1);
            expect(warn.mock.calls[0]?.[0]).toContain("declares annotations on 'run'");
        } finally {
            warn.mockRestore();
        }
    });

    it('stays silent when a rule advises the annotation', () => {
        const processor = interception([
            { when: hasAnnotation(auditedDiagnostic), use: { invoke: (_i, next) => next() } },
        ]);
        const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});

        try {
            afterInitializationOf(processor)('advised', new Advised());
            expect(warn).not.toHaveBeenCalled();
        } finally {
            warn.mockRestore();
        }
    });

    it('stays silent for a class that declares nothing', () => {
        class PlainService {
            run(): string {
                return 'ok';
            }
        }

        const processor = interception([]);
        const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});

        try {
            afterInitializationOf(processor)('plain', new PlainService());
            expect(warn).not.toHaveBeenCalled();
        } finally {
            warn.mockRestore();
        }
    });
});
