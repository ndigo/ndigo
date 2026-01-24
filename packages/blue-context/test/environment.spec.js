const { expect, use } = require( 'chai' );
const sinon_chai = require( 'sinon-chai' );
import { StandardEnvironment } from '../src/environment';

use( sinon_chai );

describe( 'StandardEnvironment', function(){
    const jsonData1 = { a: 1, b: 2, c: 3 };
    let env;

    beforeEach( function(){
        env = new StandardEnvironment();
        env.activeProfiles = [ 'foo', 'bar' ];
        env.propertySources.push( jsonData1 );
    } );

    afterEach( function(){
        env = void 0;
    } );

    test( 'it should track active profiles', function(){
        expect( env.activeProfiles ).to.contain( 'foo' );
        expect( env.activeProfiles ).to.contain( 'bar' );
        expect( env.activeProfiles ).to.have.lengthOf( 2 );

        expect( env.activeProfiles ).to.not.contain( 'qux' );
        env.addActiveProfile( 'qux' );
        expect( env.activeProfiles ).to.contain( 'qux' );
        expect( env.activeProfiles ).to.have.lengthOf( 3 );

        env.activeProfiles = [ 'baz' ];
        expect( env.activeProfiles ).to.contain( 'baz' );
        expect( env.activeProfiles ).to.not.contain( 'foo' );
        expect( env.activeProfiles ).to.not.contain( 'bar' );
        expect( env.activeProfiles ).to.not.contain( 'qux' );
        expect( env.activeProfiles ).to.have.lengthOf( 1 );
    } );
} );
