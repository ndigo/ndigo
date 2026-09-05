import { describe, test, expect } from 'vitest';
import { authenticated, authorized, AUTH_REQUIRED_KEY, AUTH_ROLES_KEY } from '../src/_decorators';

describe('@authenticated decorator', () => {
    test('sets metadata on class', () => {
        let metadata: Record<string, unknown> = {};

        class DummyClass {}

        authenticated(DummyClass, { kind: 'class', name: '', metadata: metadata as any, type: 'class' } as any);

        expect(metadata[AUTH_REQUIRED_KEY]).toBe(true);
    });

    test('sets metadata on class method', () => {
        let metadata: Record<string, unknown> = {};

        function dummyMethod() {}

        authenticated(dummyMethod, {
            kind: 'method',
            name: 'handle',
            metadata: metadata as any,
            type: 'method',
        } as any);

        expect(metadata[`${AUTH_REQUIRED_KEY}:handle`]).toBe(true);
    });

    test('does not set metadata on non-class, non-method contexts', () => {
        let metadata: Record<string, unknown> = {};

        function dummyMethod() {}

        authenticated(dummyMethod, {
            kind: 'field',
            name: 'prop',
            metadata: metadata as any,
            type: 'field',
        } as any);

        expect(metadata[AUTH_REQUIRED_KEY]).toBeUndefined();
    });
});

describe('@authorized decorator', () => {
    test('adds role to class metadata', () => {
        let metadata: Record<string, unknown> = {};

        class DummyClass {}

        const decorator = authorized('admin');
        decorator(DummyClass, { kind: 'class', name: '', metadata: metadata as any, type: 'class' } as any);

        expect(metadata[AUTH_ROLES_KEY]).toEqual(['admin']);
    });

    test('adds role to method metadata', () => {
        let metadata: Record<string, unknown> = {};

        function dummyMethod() {}

        const decorator = authorized('admin');
        decorator(dummyMethod, {
            kind: 'method',
            name: 'handle',
            metadata: metadata as any,
            type: 'method',
        } as any);

        expect(metadata[`${AUTH_ROLES_KEY}:handle`]).toEqual(['admin']);
    });

    test('stacking decorators accumulates roles on class', () => {
        let metadata: Record<string, unknown> = {};

        class DummyClass {}

        const d1 = authorized('admin');
        const d2 = authorized('user');
        d1(DummyClass, { kind: 'class', name: '', metadata: metadata as any, type: 'class' } as any);
        d2(DummyClass, { kind: 'class', name: '', metadata: metadata as any, type: 'class' } as any);

        expect(metadata[AUTH_ROLES_KEY]).toEqual(['admin', 'user']);
    });

    test('stacking decorators accumulates roles on method', () => {
        let metadata: Record<string, unknown> = {};

        function dummyMethod() {}

        const d1 = authorized('admin');
        const d2 = authorized('user');
        d1(dummyMethod, { kind: 'method', name: 'handle', metadata: metadata as any, type: 'method' } as any);
        d2(dummyMethod, { kind: 'method', name: 'handle', metadata: metadata as any, type: 'method' } as any);

        expect(metadata[`${AUTH_ROLES_KEY}:handle`]).toEqual(['admin', 'user']);
    });

    test('different methods have separate role lists', () => {
        let classMetadata: Record<string, unknown> = {};
        let methodAMetadata: Record<string, unknown> = {};
        let methodBMetadata: Record<string, unknown> = {};

        function methodA() {}
        function methodB() {}

        // Class-level roles
        authorized('admin')(class {}, {
            kind: 'class',
            name: '',
            metadata: classMetadata as any,
            type: 'class',
        } as any);

        // Method A roles
        authorized('roleA')(methodA, {
            kind: 'method',
            name: 'methodA',
            metadata: methodAMetadata as any,
            type: 'method',
        } as any);

        // Method B roles
        authorized('roleB')(methodB, {
            kind: 'method',
            name: 'methodB',
            metadata: methodBMetadata as any,
            type: 'method',
        } as any);

        expect(classMetadata[AUTH_ROLES_KEY]).toEqual(['admin']);
        expect(methodAMetadata[`${AUTH_ROLES_KEY}:methodA`]).toEqual(['roleA']);
        expect(methodBMetadata[`${AUTH_ROLES_KEY}:methodB`]).toEqual(['roleB']);
    });
});
