/**
 * @module ndigo-proxy
 * @since 1.0.0
 * @author Jeff Rose
 */
import { describe, expect, it } from 'vitest';
import {
    interceptMethods,
    isIntercepted,
    methodAnnotation,
    type MethodDescriptor,
    type MethodInterceptor,
} from '@ndigo/proxy';

const guarded = methodAnnotation<{ zone: string }>('guarded');

class StandaloneService {
    #secrets: string[] = [];

    @guarded({ zone: 'teller' })
    tell(secret: string): string {
        this.#secrets.push(secret);
        return `ok:${secret}`;
    }

    seen(): readonly string[] {
        return this.#secrets;
    }

    plain(): string {
        return 'plain';
    }
}

class Unmatched {
    nothing(): string {
        return 'nothing';
    }
}

describe('interceptMethods', () => {
    function recordingInterceptor(log: string[]) {
        const interceptor: MethodInterceptor = {
            matches: (method: MethodDescriptor) => method.annotation(guarded) !== undefined,
            invoke: (invocation, next) => {
                log.push(`${invocation.entryName}:${String(invocation.methodName)}`);
                return next();
            },
        };
        return interceptor;
    }

    it('weaves matched methods standalone with an entry name from the class', () => {
        const log: string[] = [];
        const service = new StandaloneService();
        const proxy = interceptMethods<StandaloneService>(service, [recordingInterceptor(log)]);

        expect(proxy).not.toBe(service);
        expect(proxy.tell('s3cret')).toBe('ok:s3cret');
        expect(proxy.seen()).toEqual(['s3cret']);
        expect(proxy.plain()).toBe('plain');
        expect(log).toEqual(['StandaloneService:tell']);
    });

    it('returns the instance unchanged when nothing matches', () => {
        const unmatched = new Unmatched();
        expect(interceptMethods<Unmatched>(unmatched, [recordingInterceptor([])])).toBe(unmatched);
    });

    it('passes arrow-function targets through unchanged instead of throwing', () => {
        const arrow = (): string => 'arrow';
        const permissive: MethodInterceptor = { matches: () => true, invoke: (_invocation, next) => next() };

        expect(interceptMethods(arrow, [permissive])).toBe(arrow);
        expect(arrow()).toBe('arrow');
    });

    it('passes bound-function targets through unchanged instead of throwing', () => {
        const bound = function bound(): string {
            return 'bound';
        }.bind(null);
        const permissive: MethodInterceptor = { matches: () => true, invoke: (_invocation, next) => next() };

        expect(interceptMethods(bound, [permissive])).toBe(bound);
        expect(bound()).toBe('bound');
    });

    it('is idempotent — already-woven proxies pass through', () => {
        const service = new StandaloneService();
        const proxy = interceptMethods<StandaloneService>(service, [recordingInterceptor([])]);
        const again = interceptMethods<StandaloneService>(proxy as StandaloneService, [recordingInterceptor([])]);

        expect(again).toBe(proxy);
    });

    it('returns the same proxy when the raw target is re-woven (KRN-REV-PROXY-17)', () => {
        const log: string[] = [];
        const service = new StandaloneService();
        const proxy = interceptMethods<StandaloneService>(service, [recordingInterceptor(log)]);
        const again = interceptMethods<StandaloneService>(service, [recordingInterceptor([])]);

        // Keying idempotency on the proxy alone let this produce a second,
        // independent proxy over the same target.
        expect(again).toBe(proxy);
        expect(isIntercepted(service)).toBe(true);

        proxy.tell('s');
        expect(log).toEqual(['StandaloneService:tell']);
    });

    it('honors the documented order field like the container path', () => {
        const log: string[] = [];
        const byOrder = (name: string, order: number): MethodInterceptor => ({
            order,
            matches: () => true,
            invoke: (_invocation, next) => {
                log.push(name);
                return next();
            },
        });
        const service = new StandaloneService();

        const proxy = interceptMethods<StandaloneService>(service, [
            byOrder('registered-first', 10),
            byOrder('registered-second', -5),
        ]);

        proxy.plain();
        // Lower order runs closer to the caller, regardless of registration order.
        expect(log).toEqual(['registered-second', 'registered-first']);
    });

    it('reports the class as targetType', () => {
        const seen: MethodDescriptor[] = [];
        const matching: MethodInterceptor = {
            matches: (method: MethodDescriptor) => {
                seen.push(method);
                return method.annotation(guarded) !== undefined;
            },
            invoke: (_invocation, next) => next(),
        };
        const service = new StandaloneService();

        interceptMethods<StandaloneService>(service, [matching]);

        expect(seen.length).toBeGreaterThan(0);
        expect(seen.every((method) => method.targetType === StandaloneService)).toBe(true);
    });
});
