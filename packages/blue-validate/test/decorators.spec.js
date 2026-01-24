import { Test } from './testDecorators';

describe( 'decorators', function(){

    test( 'it should decorate', function(){
        const test = new Test( 'bar' );

        expect( test ).toBeInstanceOf( Test );

        expect( true ).toBe( true );
    } );

} );
