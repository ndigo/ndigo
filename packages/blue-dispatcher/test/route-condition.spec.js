import { RouteConditionHolder } from '../src/route-condition';

const { expect } = require( 'chai' );

xdescribe( 'RouteConditionHolder', function(){
    test( 'it should be comparable', function(){
        const
            cond1 = new RouteConditionHolder( 'foo', 'bar', 'baz' ),
            cond2 = new RouteConditionHolder( 'foo=123', 'bar' );

        expect( cond1.compareTo( cond2 ) ).to.be.lessThan( 0 );
        expect( cond2.compareTo( cond1 ) ).toBeGreaterThan( 0 );
    } );
} );
