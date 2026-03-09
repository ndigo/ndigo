import { describe, test, expect, beforeEach, afterEach, vi } from 'vitest';
import {
    GenericApplicationContext,
    ProxiedGenericApplicationContext,
    ApplicationContextAwareProcessor,
} from '../src/context';
import { StaticContentSource, StaticThemeResolver } from '@blue/content';
import { MockEnvironment } from '../src/environment';
import { EntryRegistryProcessor } from '@blue/factory';

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

        context.setParent(parentContext);

        expect(context.path).toBe('parent/test');
    });

    test('it should manage child contexts', () => {
        const child = context.newChild('child') as GenericApplicationContext;

        expect(context.hasChild(child)).toBe(true);
        expect(child.parent).toBe(context);
        expect(child.path).toBe('test/child');
        expect(context.removeChild(child)).toBe(true);
        expect(context.hasChild(child)).toBe(false);
    });

    test('it should refresh and initialize constructor entries', () => {
        class TestValue {
            initialized = false;

            init(): void {
                this.initialized = true;
            }
        }

        context.setValue('testValue', TestValue);
        context.refresh();

        expect((context as any).isActive).toBe(true);
        expect(context.getValue<TestValue>('testValue').initialized).toBe(true);
    });

    test('it should run registry processors during refresh', () => {
        const processor: EntryRegistryProcessor = {
            processEntryRegistry(registry): void {
                registry.setValue('fromProcessor', 123);
            },
        };

        context.addProcessor(processor);
        context.refresh();

        expect(context.getValue<number>('fromProcessor')).toBe(123);
    });

    test('it should bubble events up the context tree', () => {
        const parent = new GenericApplicationContext('parent');
        context.setParent(parent);

        const parentListener = vi.fn();
        const childListener = vi.fn();

        parent.on('test:event', parentListener);
        context.on('test:event', childListener);

        context.bubble('test:event', { hello: 'world' });

        expect(childListener).toHaveBeenCalledTimes(1);
        expect(parentListener).toHaveBeenCalledTimes(1);
    });

    test('it should broadcast events down the context tree', () => {
        const child = context.newChild('child') as GenericApplicationContext;
        const parentListener = vi.fn();
        const childListener = vi.fn();

        context.on('broadcast:event', parentListener);
        child.on('broadcast:event', childListener);

        context.broadcast('broadcast:event', 1, 2, 3);

        expect(parentListener).toHaveBeenCalledTimes(1);
        expect(childListener).toHaveBeenCalledTimes(1);
    });

    test('it should close and cascade destruction to child contexts', () => {
        const child = context.newChild('child') as GenericApplicationContext;
        const destroyListener = vi.fn();

        child.on('context:destroy', destroyListener);
        context.refresh();
        context.close();

        expect(context.destroyed).toBe(true);
        expect(child.destroyed).toBe(true);
        expect(destroyListener).toHaveBeenCalledTimes(1);
    });

    test('it should accept an initial property set', () => {
        context = new GenericApplicationContext('test', { foo: 'bar' });
        expect(context.getValue('foo')).toBe('bar');
    });

    test('it should resolve content from local content source', () => {
        context.setContentSource(
            new StaticContentSource({
                greeting: {
                    en: 'Hello',
                },
            })
        );

        expect(context.getContent('greeting', 'en')).toBe('Hello');
    });

    test('it should resolve content from parent context fallback', () => {
        const parent = new GenericApplicationContext('parent');
        parent.setContentSource(
            new StaticContentSource({
                welcome: {
                    en: 'Welcome parent',
                },
            })
        );

        context.setParent(parent);
        expect(context.getContent('welcome', 'en')).toBe('Welcome parent');
    });

    test('it should resolve theme from configured theme name', () => {
        context.setThemeName('night');
        const theme = context.getTheme();

        expect(theme.name).toBe('night');
    });

    test('it should resolve theme from custom theme resolver', () => {
        context.setThemeResolver(
            new StaticThemeResolver(
                [
                    {
                        name: 'light',
                        contentSource: new StaticContentSource(),
                    },
                ],
                'light'
            )
        );

        expect(context.getTheme().name).toBe('light');
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
