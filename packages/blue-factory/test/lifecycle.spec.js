import { likeDestroyable, likeInitializable } from '../src/lifecycle';

describe( 'likeDestroyable', function(){
    test( 'it should identify destroyables', function(){
        expect( likeDestroyable( { destroy: () => void 0, destroyed: false } ) ).toBe( true );
    } );
} );

describe( 'likeInitializable', function(){
    test( 'it should identify initializables', function(){
        expect( likeInitializable( { init: () => void 0 } ) ).toBe( true );
    } );
} );
