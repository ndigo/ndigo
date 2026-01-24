import { PathRoute } from '../src/path-route';

describe( 'PathRoute', function(){

    test( 'it should parse route strings', function(){
        const
            routeString = '/foo;a=1;b=2/bar;c=3;d=4/baz',
            route = new PathRoute( routeString ),
            segment1 = route[ 0 ],
            segment2 = route[ 1 ],
            segment3 = route[ 2 ];

        expect( segment1 ).toHaveProperty( 'name' ).toBe( 'foo' );
        expect( segment1 ).toHaveProperty( 'data' );
        expect( segment1 ).to.have.nested.property( 'data.a' ).that.equals( '1' );
        expect( segment1 ).to.have.nested.property( 'data.b' ).that.equals( '2' );

        expect( segment2 ).toHaveProperty( 'name' ).toBe( 'bar' );
        expect( segment2 ).toHaveProperty( 'data' );
        expect( segment2 ).to.have.nested.property( 'data.c' ).that.equals( '3' );
        expect( segment2 ).to.have.nested.property( 'data.d' ).that.equals( '4' );

        expect( segment3 ).toHaveProperty( 'name' ).toBe( 'baz' );
        expect( segment3.data ).toBe( null );

        expect( route ).toHaveProperty( 'data' );
        expect( route.data ).toBe( null );

        expect( route.id ).to.be.a( 'number' );
        expect( route.length ).toBe( 3 );

        expect( route.toString() ).toBe( routeString );
    } );

    test( 'it should parse query strings', function(){
        const
            routeString = '/foo/bar?a=1&b=2&c=3',
            route = new PathRoute( routeString );

        expect( route ).toHaveProperty( 'data' );
        expect( route ).to.have.nested.property( 'data.a' ).toBe( '1' );
        expect( route ).to.have.nested.property( 'data.b' ).toBe( '2' );
        expect( route ).to.have.nested.property( 'data.c' ).toBe( '3' );

        expect( route.toString() ).toBe( routeString );
    } );

    test( 'it should remove your unnecessary semicolons', function(){
        const route = new PathRoute( '/foo;a=1;b=2/bar;c=3;d=4/baz;?e=5&f=6&g=7' );
        expect( route.toString() ).toBe( '/foo;a=1;b=2/bar;c=3;d=4/baz?e=5&f=6&g=7' );
    } );

    test( 'it should ignore trailing slashes', function(){
        const route = new PathRoute( '/foo/bar/' );
        expect( route.toString() ).toBe( '/foo/bar' );
    } );

    test( 'it should ignore double slashes', function(){
        const route = new PathRoute( '/foo//bar' );
        expect( route.toString() ).toBe( '/foo/bar' );
    } );

    test( 'it should assume a leading slash', function(){
        const route = new PathRoute( 'foo/bar' );
        expect( route.toString() ).toBe( '/foo/bar' );
    } );

} );
