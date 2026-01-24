const { expect, use } = require( 'chai' );
const sinon_chai = require( 'sinon-chai' );
import { spy } from 'sinon';
import { EventModel } from '../src/event';

use( sinon_chai );

describe( 'Model', function(){

    test( 'it should assert', function(){
        const callback = spy();

        const FooBar = EventModel( {
            foo: Number,
            bar: Number
        } );

        const
            fb1 = new FooBar( {
                foo: 12,
                bar: 34
            } ),
            fb2 = new FooBar( {
                foo: 56,
                bar: 78
            } );

        fb1.on( 'change', callback );
        fb2.on( 'change:bar', callback );

        fb1.bar = 90;
        fb2.bar = 10;

        expect( callback ).to.be.calledTwice;
        expect( callback ).to.be.calledWith( 34, 90 );
        expect( callback ).to.be.calledWith( 78, 10 );
    } );
} );
