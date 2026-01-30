import { describe, test, expect, beforeEach, afterEach, vi } from 'vitest';
import {
    GenericApplicationContext,
    ProxiedGenericApplicationContext,
    ApplicationContextAwareProcessor,
} from '../src/context';
import { MockEnvironment } from '../src/environment';

describe('GenericApplicationContext', () => {
    let context: GenericApplicationContext;

    beforeEach(() => {
        context = new GenericApplicationContext('test');
    });

    afterEach(() => {
        context.destroy();
        context = undefined as any;
    });

    test('it should have certain properties', () => {
        expect(context).toHaveProperty('name', 'test');
        expect(context).toHaveProperty('createdTimestamp');
        expect(typeof context.createdTimestamp).toBe('number');
        expect(context).toHaveProperty('id');
        expect(typeof context.id).toBe('number');
        expect(context).toHaveProperty('parent', null);
        expect(context).toHaveProperty('root', context);
        expect(context).toHaveProperty('destroyed', false);
        expect(context).toHaveProperty('destroyedTimestamp', -1);
    });

    test('it should provide a path', () => {
        expect(context.path).toBe('test');

        const parentContext = new GenericApplicationContext('parent');

        Reflect.defineProperty(context, 'parent', {
            value: parentContext,
            configurable: true,
            enumerable: false,
            writable: false,
        });

        expect(context.path).toBe('parent/test');
    });

    test('it should accept an initial property set', () => {
        context = new GenericApplicationContext('test', { foo: 'bar' });
        expect(context.getValue('foo')).toBe('bar');
    });
});

describe('ProxiedGenericContext', () => {
    let context: ProxiedGenericApplicationContext;

    beforeEach(() => {
        context = new ProxiedGenericApplicationContext('test');
    });

    afterEach(() => {
        context.destroy();
        context = undefined as any;
    });

    test('it should alias methods', () => {
        context.setValue('foo', 123);
        (context as any).bar = 456;

        expect(context.getValue('foo')).toBe(123);
        expect((context as any).foo).toBe(123);
        expect(context.hasValue('foo')).toBe(true);
        expect('foo' in context).toBe(true);
        expect(context.getValue('bar')).toBe(456);
        expect((context as any).bar).toBe(456);
        expect(context.hasValue('bar')).toBe(true);
        expect('bar' in context).toBe(true);
    });
});

describe('ApplicationContextAwareProcessor', () => {
    class TestPrototype {
        isAware = true;
        destroy = vi.fn();
        init = vi.fn();
        setApplicationContext = vi.fn();
        setApplicationEventEmitter = vi.fn();
        setEnvironment = vi.fn();
        setContentSource = vi.fn();
        setResourceLoader = vi.fn();
    }

    let context: GenericApplicationContext;
    let env: MockEnvironment;
    let processor: ApplicationContextAwareProcessor;

    beforeEach(() => {
        env = new MockEnvironment();
        context = new GenericApplicationContext('test');
        processor = new ApplicationContextAwareProcessor(context);
        context.setEnvironment(env);
        context.addProcessor(processor);
    });

    afterEach(() => {
        context.destroy();
        context = env = processor = undefined as any;
    });

    test('it should set context values on singletons', () => {
        context.setValue('test', TestPrototype);

        const test = context.getValue('test') as TestPrototype;
        expect(test.setApplicationContext).toHaveBeenCalledWith(context);
        expect(test.setApplicationEventEmitter).toHaveBeenCalledWith(context);
        expect(test.setEnvironment).toHaveBeenCalledWith(env);
        expect(test.setContentSource).toHaveBeenCalledWith(context);
        expect(test.setResourceLoader).toHaveBeenCalledWith(context);
    });

    test('it should set context values on instances', () => {
        context.setValue('test', TestPrototype);

        const test = context.getInstance('test') as TestPrototype;
        expect(test.setApplicationContext).toHaveBeenCalledWith(context);
        expect(test.setApplicationEventEmitter).toHaveBeenCalledWith(context);
        expect(test.setEnvironment).toHaveBeenCalledWith(env);
        expect(test.setContentSource).toHaveBeenCalledWith(context);
        expect(test.setResourceLoader).toHaveBeenCalledWith(context);
    });

    /*
    test( '', () => {

    } );
    */
});

/* Older tests
describe.skip( 'Context', () => {

    test( 'it should be a constructor', () => {
        expect( RootContext && RootContext.constructor ).toBe( Function );
    } );

    test( 'it should create instances', () => {
        const context = new RootContext( 'root' );
        expect( context ).toBeInstanceOf( RootContext );
        expect( context.bubble ).toBeInstanceOf( Function );;
        expect( context.broadcast ).toBeInstanceOf( Function );;
        expect( context.destroy ).toBeInstanceOf( Function );;
        expect( context.emit ).toBeInstanceOf( Function );;
        expect( context.hasChild ).toBeInstanceOf( Function );;
        expect( context.newChild ).toBeInstanceOf( Function );;
        expect( context.off ).toBeInstanceOf( Function );;
        expect( context.on ).toBeInstanceOf( Function );;
        expect( context.removeChild ).toBeInstanceOf( Function );;
        expect( context.name ).toBe( 'root' );
        expect( context.path ).toBe( 'root' );
        expect( context.id ).toBe( 'number' );
        expect( context.createdTimestamp ).toBe( 'number');
        expect( context.root ).toBe( context );
        expect( context.parent ).toBe( null );

    } );

    test( 'it should manage children', () => {
        const
            parent = new RootContext( 'root' ),
            child = parent.newChild( 'child-1' );

        expect( parent.children.indexOf( child ) ).toBe( 0 );

        expect( parent.hasChild( child ) ).toBe( true );
        expect( parent.hasChild( {} ) ).toBe( false );

        expect( parent.removeChild( child ) ).toBe( true );
        expect( parent.removeChild( {} ) ).toBe( false );
        expect( parent.hasChild( child ) ).toBe( false );
    } );

    test( 'it should be destroyable', () => {
        const
            parent = new RootContext( 'root' ),
            child = parent.newChild( 'child-1' );

        parent.destroy();

        expect( child.destroyed ).toBe( true );
        expect( child.destroyedTimestamp ).toBe( 'number');
        expect( parent.destroyed ).toBe( true );
        expect( parent.destroyedTimestamp ).toBe( 'number');
    } );

} );
*/
