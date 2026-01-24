import { isPrimitive, isNotPrimitive } from '../src/primitive';

const
    primitives = [ 123, 'abc', true, Symbol.iterator, null, 456n, void 0 ],
    nonPrimitives = [ function(){}, {}, new Number( 123 ), new String( 'abc' ), new Boolean( true ) ];

describe( 'isPrimitive', function(){
    test( 'it should recognize primitive values', function(){
        primitives.forEach( ( value ) => expect( isPrimitive( value ) ).to.be.true );
    } );
    test( 'it should recognize non-primitive values', function(){
        nonPrimitives.forEach( ( value ) => expect( isPrimitive( value ) ).to.be.false );
    } );
} );

describe( 'isNotPrimitive', function(){
    test( 'it should recognize primitive values', function(){
        primitives.forEach( ( value ) => expect( isNotPrimitive( value ) ).to.be.false );
    } );
    test( 'it should recognize non-primitive values', function(){
        nonPrimitives.forEach( ( value ) => expect( isNotPrimitive( value ) ).to.be.true );
    } );
} );
