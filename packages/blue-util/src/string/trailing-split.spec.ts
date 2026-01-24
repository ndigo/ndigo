import trailingSplit from './trailing-split';

describe( 'trailingSplit', function(){

    test( 'it should split strings w/ trailing separators', function(){
        expect( trailingSplit( ',', '1,2,3,' ) ).toEqual( [ '1', '2', '3' ] );
        expect( trailingSplit( ',', ',,' ) ).toEqual( [ '', '', '' ] );
    } );

    test( 'it should split strings w/o trailing separators', function(){
        expect( trailingSplit( ',', '1,2,3' ) ).toEqual( [ '1', '2', '3' ] );
        expect( trailingSplit( ',', ',' ) ).toEqual( [ '' ] );
    } );

    test( 'it should split strings w/o separators', function(){
        expect( trailingSplit( ',', '1' ) ).toEqual( [ '1' ] );
        expect( trailingSplit( ',', '' ) ).toEqual( [ '' ] );
    } );

    test( 'it should be curried', function(){
        const splitOnComma = trailingSplit( ',' );
        expect( splitOnComma ).toBeInstanceOf( Function );
        expect( splitOnComma( '1,2,3,' ) ).toEqual( [ '1', '2', '3' ] );
    } );
} );
