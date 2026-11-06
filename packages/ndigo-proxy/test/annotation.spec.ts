/**
 */

import { describe, expect, it } from 'vitest';
import { annotationOf, methodAnnotation, PROXY_METADATA_PREFIX } from '@ndigo/proxy';
import { getSymbolMetadata } from '@ndigo/core';

describe('methodAnnotation', () => {
    interface AuditSpec {
        action: string;
    }

    it('exposes a namespace key', () => {
        const audited = methodAnnotation<AuditSpec>('audited');
        expect(audited.key).toBe('proxy:audited');
    });

    it('stores the value in Symbol.metadata without replacing the method', () => {
        const audited = methodAnnotation<AuditSpec>('audited');

        class OrderService {
            @audited({ action: 'order.submit' })
            submit(): string {
                return 'receipt';
            }
        }

        const metadata = getSymbolMetadata(OrderService);
        expect(metadata).toEqual({
            'proxy:audited:submit': { action: 'order.submit' },
        });

        const instance = new OrderService();
        // The prototype method is untouched — the annotation is metadata-only.
        expect(OrderService.prototype.submit).toBe(
            Object.getOwnPropertyDescriptor(OrderService.prototype, 'submit')?.value
        );
        expect(instance.submit()).toBe('receipt');
    });

    it('respects the proxy metadata namespace prefix', () => {
        expect(PROXY_METADATA_PREFIX).toBe('proxy:');
    });

    it('supports multiple annotation names without collisions', () => {
        const audited = methodAnnotation<{ action: string }>('audited');
        const cached = methodAnnotation<{ ttl: number }>('cacheHint');

        class Service {
            @audited({ action: 'a' })
            @cached({ ttl: 5 })
            run(): void {}
        }

        expect(annotationOf(new Service(), audited, 'run')).toEqual({ action: 'a' });
        expect(annotationOf(new Service(), cached, 'run')).toEqual({ ttl: 5 });
    });

    it('rejects non-method decoration targets', () => {
        const audited = methodAnnotation<AuditSpec>('audited');

        class OrderService {
            submit(): void {}
        }

        expect(() => {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            audited({ action: 'x' })(OrderService, { kind: 'class' } as unknown as ClassMethodDecoratorContext);
        }).toThrow(TypeError);

        expect(() => {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            audited({ action: 'x' })(
                undefined as unknown as Function,
                { kind: 'field' } as unknown as ClassMethodDecoratorContext
            );
        }).toThrow(TypeError);
    });

    describe('annotationOf', () => {
        const audited = methodAnnotation<AuditSpec>('audited');

        class Base {
            @audited({ action: 'base' })
            base(): void {}

            @audited({ action: 'base.shared' })
            shared(): void {}
        }

        class Derived extends Base {
            @audited({ action: 'derived.shared' })
            shared(): void {}

            plain(): void {}
        }

        it('reads annotations from instances', () => {
            expect(annotationOf(new Derived(), audited, 'base')).toEqual({ action: 'base' });
        });

        it('resolves inherited annotations from the base class', () => {
            expect(annotationOf(new Derived(), audited, 'base')).toEqual({ action: 'base' });
        });

        it('prefers the nearest declaration when a method is re-declared', () => {
            expect(annotationOf(new Derived(), audited, 'shared')).toEqual({ action: 'derived.shared' });
        });

        it('returns undefined for unannotated methods', () => {
            expect(annotationOf(new Derived(), audited, 'plain')).toBeUndefined();
        });

        it('reads from the class constructor as well as instances', () => {
            expect(annotationOf(Derived, audited, 'shared')).toEqual({ action: 'derived.shared' });
        });
    });
});
