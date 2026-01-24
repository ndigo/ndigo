const { expect, use } = require('chai');
const sinon_chai = require('sinon-chai');
import { spy } from 'sinon';
import {
    GenericApplicationContext,
    ProxiedGenericApplicationContext,
    ApplicationContextAwareProcessor,
} from '../src/context';
import { MockEnvironment } from '../src/environment';

use(sinon_chai);

describe('GenericApplicationContext', function () {
    let context;

    beforeEach(function () {
        context = new GenericApplicationContext('test');
    });

    afterEach(function () {
        context.destroy();
        context = undefined;
    });

    test('it should have certain properties', function () {
        expect(context).toHaveProperty('name').that.equals('test');
        expect(context).toHaveProperty('createdTimestamp').that.is.a('number');
        expect(context).toHaveProperty('id').that.is.a('number');
        expect(context).toHaveProperty('parent').that.is.null;
        expect(context).toHaveProperty('root').that.equals(context);
        expect(context).toHaveProperty('destroyed').that.equals(false);
        expect(context).toHaveProperty('destroyedTimestamp').that.equals(-1);
    });

    test('it should provide a path', function () {
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

    test('it should accept an initial property set', function () {
        context = new GenericApplicationContext('test', { foo: 'bar' });
        expect(context.getValue('foo')).toBe('bar');
    });
});

describe('ProxiedGenericContext', function () {
    let context;

    beforeEach(function () {
        context = new ProxiedGenericApplicationContext('test');
    });

    afterEach(function () {
        context.destroy();
        context = undefined;
    });

    test('it should alias methods', function () {
        context.setValue('foo', 123);
        context.bar = 456;

        expect(context.getValue('foo')).toBe(123);
        expect(context.foo).toBe(123);
        expect(context.hasValue('foo')).toBe(true);
        expect('foo' in context).toBe(true);
        expect(context.getValue('bar')).toBe(456);
        expect(context.bar).toBe(456);
        expect(context.hasValue('bar')).toBe(true);
        expect('bar' in context).toBe(true);
    });
});

describe('ApplicationContextAwareProcessor', function () {
    class TestPrototype {
        constructor() {
            //this.isAware = true;
        }
    }
    TestPrototype.prototype.isAware = true;
    TestPrototype.prototype.destroy = spy();
    TestPrototype.prototype.init = spy();
    TestPrototype.prototype.setApplicationContext = spy();
    TestPrototype.prototype.setApplicationEventEmitter = spy();
    TestPrototype.prototype.setEnvironment = spy();
    TestPrototype.prototype.setContentSource = spy();
    TestPrototype.prototype.setResourceLoader = spy();

    let context, env, processor;

    beforeEach(function () {
        env = new MockEnvironment();
        context = new GenericApplicationContext('test');
        processor = new ApplicationContextAwareProcessor(context);
        context.setEnvironment(env);
        context.addProcessor(processor);
    });

    afterEach(function () {
        context.destroy();
        context = env = processor = undefined;
    });

    test('it should set context values on singletons', function () {
        context.setValue('test', TestPrototype);

        const test = context.getValue('test');
        expect(test.setApplicationContext).to.be.calledWith(context);
        expect(test.setApplicationEventEmitter).to.be.calledWith(context);
        expect(test.setEnvironment).to.be.calledWith(env);
        expect(test.setContentSource).to.be.calledWith(context);
        expect(test.setResourceLoader).to.be.calledWith(context);
    });

    test('it should set context values on instances', function () {
        context.setValue('test', TestPrototype);

        const test = context.getInstance('test');
        expect(test.setApplicationContext).to.be.calledWith(context);
        expect(test.setApplicationEventEmitter).to.be.calledWith(context);
        expect(test.setEnvironment).to.be.calledWith(env);
        expect(test.setContentSource).to.be.calledWith(context);
        expect(test.setResourceLoader).to.be.calledWith(context);
    });

    /*
    test( '', function(){

    } );
    */
});

/* Older tests
xdescribe( 'Context', function(){

    test( 'it should be a constructor', function(){
        expect( RootContext && RootContext.constructor ).toBe( Function );
    } );

    test( 'it should create instances', function(){
        const context = new RootContext( 'root' );
        expect( context ).to.be.an.instanceof( RootContext );
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
        expect( context.id ).to.be.a( 'number' );
        expect( context.createdTimestamp ).to.be.a( 'number');
        expect( context.root ).toBe( context );
        expect( context.parent ).toBe( null );

    } );

    test( 'it should manage children', function(){
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

    test( 'it should be destroyable', function(){
        const
            parent = new RootContext( 'root' ),
            child = parent.newChild( 'child-1' );

        parent.destroy();

        expect( child.destroyed ).toBe( true );
        expect( child.destroyedTimestamp ).to.be.a( 'number');
        expect( parent.destroyed ).toBe( true );
        expect( parent.destroyedTimestamp ).to.be.a( 'number');
    } );

} );
*/
