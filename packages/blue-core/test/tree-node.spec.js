const { expect, use } = require( 'chai' );
const { spy } = require( 'sinon' );
const sinon_chai = require( 'sinon-chai' );
import { direct, escalate, indexOf } from '../src/tree-node';

use( sinon_chai );

describe( 'direct', function(){
    const tree = { children: [ { children: [] }, { children: [] } ] };
    let directSpy;

    beforeEach( function(){
        directSpy = spy();
    } );

    afterEach( function(){
        directSpy = void 0;
    } );

    test( 'it should exclude the root node by default', function(){
        direct( tree, directSpy );
        expect( directSpy ).to.be.calledTwice;
    } );

    test( 'it should include the root node', function(){
        direct( tree, directSpy, true );
        expect( directSpy ).to.be.calledThrice;
    } );
} );

describe( 'escalate', function(){
    const tree = { parent: { parent: { parent: null } } };
    let escalateSpy;

    beforeEach( function(){
        escalateSpy = spy();
    } );

    afterEach( function(){
        escalateSpy = void 0;
    } );

    test( 'it should exclude the root node by default', function(){
        escalate( tree, escalateSpy );
        expect( escalateSpy ).to.be.calledTwice;
    } );

    test( 'it should include the root node', function(){
        escalate( tree, escalateSpy, true );
        expect( escalateSpy ).to.be.calledThrice;
    } );
} );

describe( 'indexOf', function(){
    const
        child = { children: [] },
        tree = { children: [ { children: [] }, { children: [] }, child ] };

    test( 'it should return the index of', function(){
        expect( indexOf( tree.children, child ) ).toBe( 2 );
    } );
} );
