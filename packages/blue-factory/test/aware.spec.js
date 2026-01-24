import { $aware, AsAware, AsNameAware, likeAware, likeNameAware } from '../src/aware';

describe( 'AsAware', function(){
    class Empty {}

    const
        AwareEmpty = AsAware( Empty ),
        NameAwareEmpty = AsNameAware( Empty );

    let aware, nameAware;

    afterEach( function(){
        aware = nameAware = undefined;
    } );

    beforeEach( function(){
        aware = new AwareEmpty();
        nameAware = new NameAwareEmpty();
    } );

    test( 'it should create aware instances', function(){
        expect( aware ).toHaveProperty( $aware ).that.is.true;
        expect( nameAware ).toHaveProperty( $aware ).that.is.true;

        nameAware.setName( 'test' );

        expect( nameAware ).toHaveProperty( 'name' ).that.equals( 'test' );

        expect( likeAware( aware ) ).toBe( true );
        expect( likeAware( nameAware ) ).toBe( true );
        expect( likeNameAware( aware ) ).toBe( false );
        expect( likeNameAware( nameAware ) ).toBe( true );
    } );
} );
