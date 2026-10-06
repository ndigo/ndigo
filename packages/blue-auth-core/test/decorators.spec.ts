/**
 * @module blue-auth-core
 * @since 1.0.0
 * @author Jeff Rose
 */
import { describe, test, expect } from 'vitest';
import { authenticated, authorized, AUTH_REQUIRED_KEY, AUTH_ROLES_KEY } from '../src/decorators';

type DecoratorContext = ClassDecoratorContext | ClassMethodDecoratorContext;

/** Builds a fake class-decorator context backed by the given metadata bag. */
function classContext(metadata: Record<PropertyKey, unknown>): ClassDecoratorContext {
    return {
        kind: 'class',
        name: undefined,
        addInitializer() {},
        metadata,
    };
}

/** Builds a fake method-decorator context backed by the given metadata bag. */
function methodContext(name: string, metadata: Record<PropertyKey, unknown>): ClassMethodDecoratorContext {
    return {
        kind: 'method',
        name,
        static: false,
        private: false,
        access: {
            has: () => false,
            get: () => () => {},
        },
        addInitializer() {},
        metadata,
    };
}

/**
 * Builds a fake context for a non-class, non-method element (e.g. a field) to
 * exercise the decorators' anti-pattern detection. Its shape is intentionally
 * incompatible with the real decorator context types, so it is narrowed
 * through the union the decorators accept.
 */
function fieldContext(name: string, metadata: Record<PropertyKey, unknown>): DecoratorContext {
    const context: { kind: string; name: string | undefined; metadata: Record<PropertyKey, unknown> } = {
        kind: 'field',
        name,
        metadata,
    };
    return context as DecoratorContext;
}

describe('@authenticated decorator', () => {
    test('sets metadata on class', () => {
        const metadata: Record<PropertyKey, unknown> = {};

        class DummyClass {}

        authenticated(DummyClass, classContext(metadata));

        expect(metadata[AUTH_REQUIRED_KEY]).toBe(true);
    });

    test('sets metadata on class method', () => {
        const metadata: Record<PropertyKey, unknown> = {};

        function dummyMethod() {}

        authenticated(dummyMethod, methodContext('handle', metadata));

        expect(metadata[`${AUTH_REQUIRED_KEY}:handle`]).toBe(true);
    });

    test('throws on non-class, non-method contexts (anti-pattern detection)', () => {
        const metadata: Record<PropertyKey, unknown> = {};

        function dummyMethod() {}

        expect(() => authenticated(dummyMethod, fieldContext('prop', metadata))).toThrow(
            '@authenticated can only be applied to a class or method'
        );
        expect(metadata[AUTH_REQUIRED_KEY]).toBeUndefined();
    });
});

describe('@authorized decorator', () => {
    test('adds role to class metadata', () => {
        const metadata: Record<PropertyKey, unknown> = {};

        class DummyClass {}

        const decorator = authorized('admin');
        decorator(DummyClass, classContext(metadata));

        expect(metadata[AUTH_ROLES_KEY]).toEqual(['admin']);
    });

    test('adds role to method metadata', () => {
        const metadata: Record<PropertyKey, unknown> = {};

        function dummyMethod() {}

        const decorator = authorized('admin');
        decorator(dummyMethod, methodContext('handle', metadata));

        expect(metadata[`${AUTH_ROLES_KEY}:handle`]).toEqual(['admin']);
    });

    test('stacking decorators accumulates roles on class', () => {
        const metadata: Record<PropertyKey, unknown> = {};

        class DummyClass {}

        const d1 = authorized('admin');
        const d2 = authorized('user');
        d1(DummyClass, classContext(metadata));
        d2(DummyClass, classContext(metadata));

        expect(metadata[AUTH_ROLES_KEY]).toEqual(['admin', 'user']);
    });

    test('stacking decorators accumulates roles on method', () => {
        const metadata: Record<PropertyKey, unknown> = {};

        function dummyMethod() {}

        const d1 = authorized('admin');
        const d2 = authorized('user');
        d1(dummyMethod, methodContext('handle', metadata));
        d2(dummyMethod, methodContext('handle', metadata));

        expect(metadata[`${AUTH_ROLES_KEY}:handle`]).toEqual(['admin', 'user']);
    });

    test('different methods have separate role lists', () => {
        const classMetadata: Record<PropertyKey, unknown> = {};
        const methodAMetadata: Record<PropertyKey, unknown> = {};
        const methodBMetadata: Record<PropertyKey, unknown> = {};

        function methodA() {}
        function methodB() {}

        // Class-level roles
        authorized('admin')(class {}, classContext(classMetadata));

        // Method A roles
        authorized('roleA')(methodA, methodContext('methodA', methodAMetadata));

        // Method B roles
        authorized('roleB')(methodB, methodContext('methodB', methodBMetadata));

        expect(classMetadata[AUTH_ROLES_KEY]).toEqual(['admin']);
        expect(methodAMetadata[`${AUTH_ROLES_KEY}:methodA`]).toEqual(['roleA']);
        expect(methodBMetadata[`${AUTH_ROLES_KEY}:methodB`]).toEqual(['roleB']);
    });
});
