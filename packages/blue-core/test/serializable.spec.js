import { isJSONValue } from '../src/serializable';

describe( 'isJSONValue', function(){
    test( 'it should recognize JSON values', function(){
        const values = [ 123, 'abc', true, { 'def': 456 } ];
        values.forEach( ( value ) => expect( isJSONValue( value ) ).to.be.true );
    } );

    test( 'it should recognize non-JSON values', function(){
        const values = [ function(){}, { 'abc': function(){} } ];
        values.forEach( ( value ) => expect( isJSONValue( value ) ).to.be.false );
    } );
} );
