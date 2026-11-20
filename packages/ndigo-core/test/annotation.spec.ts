/**
 * Tests for the metadata-only annotation primitives.
 */
import '@tsmetadata/polyfill';
import { describe, test, expect } from 'vitest';
import { annotationOf, classAnnotation, methodAnnotation, type AnnotationDecorator } from '../src/annotation';

type MethodDecorator = (target: Function, context: ClassMethodDecoratorContext) => Function;
type ClassDecorator = (target: unknown, context: ClassDecoratorContext) => void;

function methodContext(name: string, metadata: Record<string, unknown> = {}): ClassMethodDecoratorContext {
    return { kind: 'method', name, metadata } as unknown as ClassMethodDecoratorContext;
}

function classContext(metadata: Record<string, unknown> = {}): ClassDecoratorContext {
    return { kind: 'class', name: 'Service', metadata } as unknown as ClassDecoratorContext;
}

function applyMethod<T>(
    decorator: (value: T) => AnnotationDecorator,
    value: T,
    target: Function,
    name: string
): { returned: Function; metadata: Record<string, unknown> } {
    const metadata: Record<string, unknown> = {};
    const returned = (decorator(value) as MethodDecorator)(target, methodContext(name, metadata));
    return { returned, metadata };
}

describe('methodAnnotation', () => {
    const audited = methodAnnotation<{ action: string }>('orders:audited');

    test('records the value under the qualified key and returns the method unchanged', () => {
        const original = function submit(): string {
            return 'submitted';
        };

        const { returned, metadata } = applyMethod(audited, { action: 'order.submit' }, original, 'submit');

        expect(returned).toBe(original);
        expect(metadata['orders:audited:submit']).toEqual({ action: 'order.submit' });
    });

    test('reads the value from the class and from an instance', () => {
        class Service {
            @audited({ action: 'order.submit' })
            submit(): string {
                return 'submitted';
            }
        }

        expect(annotationOf(Service, audited, 'submit')).toEqual({ action: 'order.submit' });
        expect(annotationOf(new Service(), audited, 'submit')).toEqual({ action: 'order.submit' });
    });

    test('inherited declarations resolve, nearest declaration wins', () => {
        class Base {
            @audited({ action: 'base' })
            run(): void {}
        }

        class Child extends Base {}

        class Override extends Base {
            @audited({ action: 'override' })
            override run(): void {}
        }

        expect(annotationOf(Child, audited, 'run')).toEqual({ action: 'base' });
        expect(annotationOf(Override, audited, 'run')).toEqual({ action: 'override' });
    });

    test('returns undefined for an unannotated member', () => {
        class Service {
            other(): void {}
        }

        expect(annotationOf(Service, audited, 'other')).toBeUndefined();
        expect(annotationOf(Service, audited, 'missing')).toBeUndefined();
    });

    test('rejects a class target', () => {
        expect(() => (audited({ action: 'x' }) as ClassDecorator)(class {}, classContext())).toThrow(TypeError);
    });
});

describe('classAnnotation', () => {
    const audited = classAnnotation<{ action: string }>('orders:audited');

    test('records the value under the class key', () => {
        const metadata: Record<string, unknown> = {};
        (audited({ action: 'class-wide' }) as ClassDecorator)(class Service {}, classContext(metadata));

        expect(metadata['orders:audited']).toEqual({ action: 'class-wide' });
    });

    test('reads the class-level value without a member', () => {
        @audited({ action: 'class-wide' })
        class Service {
            run(): void {}
        }

        expect(annotationOf(Service, audited)).toEqual({ action: 'class-wide' });
        expect(annotationOf(new Service(), audited)).toEqual({ action: 'class-wide' });
    });

    test('a class-level key does not leak into member reads', () => {
        @audited({ action: 'class-wide' })
        class Service {
            run(): void {}
        }

        // Deliberate: `annotationOf` with a member is the *member* read. The
        // class-level fallback belongs to the advice-facing reader
        // (`MethodDescriptor.annotation`), which applies it so a blanket
        // annotation covers every method — matching how `@authenticated` is
        // read by the route guards.
        expect(annotationOf(Service, audited, 'run')).toBeUndefined();
        expect(annotationOf(Service, audited)).toEqual({ action: 'class-wide' });
    });

    test('rejects a method target', () => {
        expect(() => (audited({ action: 'x' }) as MethodDecorator)(function run() {}, methodContext('run'))).toThrow(
            TypeError
        );
    });
});

describe('annotation keys', () => {
    test('exposes the qualified key and the unqualified name', () => {
        const key = methodAnnotation('resilience:retry');

        expect(key.key).toBe('resilience:retry');
        expect(key.name).toBe('retry');
    });

    test.each(['retry', 'resilience:', ':retry', 'a:b:c', ''])('rejects malformed name %j', (name) => {
        expect(() => methodAnnotation(name)).toThrow(TypeError);
        expect(() => classAnnotation(name)).toThrow(TypeError);
    });
});
