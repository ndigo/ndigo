import { DataBinder } from '../src/data-binder';
import { MutablePropertyValues } from '../src/property-value';

describe( 'DataBinder', function(){
    let db, target;

    beforeEach( function(){
        target = {};
        db = new DataBinder( target, 'test' );
    } );

    afterEach( function(){
        db = target = void 0;
    } );

    test( 'it should bind data to empty objects', function(){
        const mpv = new MutablePropertyValues();
        mpv.addPropertyValue( 'foo', 123 );
        mpv.addPropertyValue( 'bar.qux', 456 );
        mpv.addPropertyValue( 'bar["fuz"]', 789 );
        mpv.addPropertyValue( 'baz[0]', 'abc' );
        mpv.addPropertyValue( 'baz[1]', 'def' );
        db.bind( mpv );
        expect( db.result ).toEqual( { foo: 123, bar: { qux: 456, fuz: 789 }, baz: [ 'abc', 'def' ] } );
    } );
} );
