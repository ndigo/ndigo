/**
 * Two independent configurations contributing advice to the same method.
 *
 * The registry exists so features can contribute rules independently, and this
 * lane pins both halves of that promise: the rules compose onto one method in
 * band order, and — the part nothing else states — they must be contributed
 * *before* the advised entry is created, because weaving happens once, at
 * creation.
 *
 * The registry is module-scoped here because there is no supported way for a
 * configuration to receive it yet: configurations run only their `@entry`
 * methods, and the registry is not a registered entry. An application composes
 * the rules in its bootstrap today (apps 03/05/17).
 */
// @vitest-environment node
import { describe, test, expect } from 'vitest';
import { configuration, entry } from '@ndigo/context';
import { methodAnnotation } from '@ndigo/core';
import { hasAnnotation, interception, MethodInterceptorRegistry } from '@ndigo/advice';
import type { MethodInterceptor } from '@ndigo/advice';
import { ApplicationBuilder } from '../src/application-builder';

const firstKey = methodAnnotation<true>('probe:first');
const secondKey = methodAnnotation<true>('probe:second');

/** Module-scoped so a configuration can reach the registry it contributes to. */
const rules = new MethodInterceptorRegistry();

/** Records execution order, so the composed order is observable. */
const log: string[] = [];

/**
 * @param label - The name to record when this advice runs.
 * @returns Advice that records and forwards.
 */
function recorder(label: string): MethodInterceptor {
    return {
        invoke(_invocation, next) {
            log.push(label);
            return next();
        },
    };
}

class OrderService {
    @firstKey(true)
    @secondKey(true)
    place(order: string): string {
        log.push('method');
        return `ok:${order}`;
    }
}

@configuration
class FirstFeatureConfiguration {
    /** A feature's rule: its own annotation, its own band. No entry yet. */
    @entry()
    contribute(): MethodInterceptorRegistry {
        rules.add({ when: hasAnnotation(firstKey), use: recorder('first'), order: 100 });
        return rules;
    }
}

@configuration
class SecondFeatureConfiguration {
    @entry()
    contribute(): MethodInterceptorRegistry {
        rules.add({ when: hasAnnotation(secondKey), use: recorder('second'), order: 200 });
        return rules;
    }

    /** The advised entry, declared after both rules exist. */
    @entry()
    orderService(): OrderService {
        return new OrderService();
    }
}

describe('advice contributed by two independent configurations', () => {
    test('both rules compile onto the same method, in band order', async () => {
        const context = await new ApplicationBuilder([FirstFeatureConfiguration, SecondFeatureConfiguration])
            // The application owns the registry and the one weaver.
            .processors(interception(rules))
            .run();

        const service = context.getValue<OrderService>('orderService');
        log.length = 0;
        expect(service.place('widget')).toBe('ok:widget');

        // Two independent contributors, one deterministic order: the lower band
        // outermost, then the higher, then the method.
        expect(log).toEqual(['first', 'second', 'method']);
    });

    test('a rule contributed after the entry exists does not reach it', async () => {
        // Weaving is once, at creation. This is why contribution order matters
        // and why every rule a capability needs must be registered before the
        // entry it advises is created.
        const late = new MethodInterceptorRegistry();
        const context = await new ApplicationBuilder([SecondFeatureConfiguration]).processors(interception(late)).run();

        const service = context.getValue<OrderService>('orderService');
        log.length = 0;
        late.add({ when: hasAnnotation(firstKey), use: recorder('late'), order: 0 });

        service.place('widget');
        expect(log).toEqual(['method']);
    });
});
