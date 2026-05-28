import '@tsmetadata/polyfill';
import { describe, expect, test, vi } from 'vitest';
import { domainComponent, domainAction, domainData, getDomainMetadata } from '../src/decorators';
import { GenericDomainComponent } from '../src/component';

describe('@domainComponent', () => {
    test('it should store the component name in Symbol.metadata', () => {
        @domainComponent('profile')
        class ProfileComponent extends GenericDomainComponent {}
        const meta = getDomainMetadata(ProfileComponent);
        expect(meta.name).toBe('profile');
    });

    test('it should leave actions and data empty when not decorated', () => {
        @domainComponent('empty')
        class EmptyComponent extends GenericDomainComponent {}
        const meta = getDomainMetadata(EmptyComponent);
        expect(meta.actions).toEqual([]);
        expect(meta.data).toEqual([]);
    });

    test('getDomainMetadata returns empty defaults for undecorated class', () => {
        class BareComponent extends GenericDomainComponent {}
        const meta = getDomainMetadata(BareComponent);
        expect(meta.name).toBeUndefined();
        expect(meta.actions).toEqual([]);
        expect(meta.data).toEqual([]);
    });
});

describe('@domainAction', () => {
    test('it should register the method name in domain:actions metadata', () => {
        class MyComponent extends GenericDomainComponent {
            @domainAction
            submit() { return 'ok'; }
        }
        const meta = getDomainMetadata(MyComponent);
        expect(meta.actions).toContain('submit');
    });

    test('it should register multiple actions', () => {
        class MyComponent extends GenericDomainComponent {
            @domainAction
            submit() {}
            @domainAction
            cancel() {}
        }
        const meta = getDomainMetadata(MyComponent);
        expect(meta.actions).toContain('submit');
        expect(meta.actions).toContain('cancel');
    });

    test('it should call through to the original method', () => {
        class MyComponent extends GenericDomainComponent {
            @domainAction
            greet(name: string) { return `hello ${name}`; }
        }
        const c = new MyComponent();
        c.init('greeter');
        expect(c.greet('world')).toBe('hello world');
    });

    test('it should rethrow errors from the action method', () => {
        class MyComponent extends GenericDomainComponent {
            @domainAction
            boom() { throw new Error('kaboom'); }
        }
        const c = new MyComponent();
        c.init('boomer');
        expect(() => c.boom()).toThrow('kaboom');
    });

    test('it should log an error when the action throws', () => {
        const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
        class MyComponent extends GenericDomainComponent {
            @domainAction
            explode() { throw new Error('bang'); }
        }
        const c = new MyComponent();
        c.init('exploder');
        try { c.explode(); } catch {}
        expect(spy).toHaveBeenCalled();
        spy.mockRestore();
    });
});

// These tests for @domainData are skipped due to environment limitations
// but are included in the spec as requested
describe('@domainData', () => {
    const makeMockModel = () => {
        const store = Object.create(null) as Record<string, unknown>;
        return {
            get: (key: string) => store[key],
            set: (key: string, value: unknown) => { store[key] = value; },
        };
    };

    test('it should register the field name in domain:data metadata', () => {
        class MyComponent extends GenericDomainComponent {
            @domainData
            firstName: string = '';
        }
        const meta = getDomainMetadata(MyComponent);
        expect(meta.data).toContain('firstName');
    });

    test('it should proxy reads and writes through this.model', () => {
        class MyComponent extends GenericDomainComponent {
            @domainData
            balance: number = 0;
        }
        const c = new MyComponent();
        c.init('account');
        c.model = makeMockModel() as any;
        (c as any).balance = 42;
        expect((c as any).balance).toBe(42);
    });

    test('it should handle multiple @domainData fields', () => {
        class MyComponent extends GenericDomainComponent {
            @domainData
            firstName: string = '';
            @domainData
            lastName: string = '';
        }
        const meta = getDomainMetadata(MyComponent);
        expect(meta.data).toContain('firstName');
        expect(meta.data).toContain('lastName');
    });

    test('it should return undefined gracefully when model is not set', () => {
        class MyComponent extends GenericDomainComponent {
            @domainData
            value: string = '';
        }
        const c = new MyComponent();
        c.init('no-model');
        // model not set — should not throw
        expect(() => (c as any).value).not.toThrow();
        expect((c as any).value).toBeUndefined();
    });
});