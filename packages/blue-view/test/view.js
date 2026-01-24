import { expect } from "chai";
import { RootContext } from "@blue/core";
import { View } from "../src/view";

// Note: in the future, we may need to pass a second argument: constructor
// args to pass to the "new ViewSubType()" instruction. SubTypes may need
// more values in the constructor than the base view knows how to deal with.
const sharedSpec = function ( ViewSubType ){

    describe( 'View', function () {
        test( 'it should be defined', function () {
            expect( ViewSubType ).to.not.be.undefined;
        } );

        describe( "instance", function () {
            let view = undefined,
                parentContext = new RootContext( 'ROOT' );

            beforeEach( function () {
                view = new ViewSubType( parentContext, {
                    name: "testView"
                } );
            } );

            describe( "props", function () {
                it( "should have a name", function () {
                    expect( view.name ).to.be.a( "string" );
                    expect( view.name ).to.not.equal( "" );
                } );
            } );

            describe( "destroy", function () {
                it( "should undefine the model", function ( done ) {
                    Promise.resolve( view.destroy() ).then( function () {
                        expect( view.model ).toBeUndefined();
                        done();
                    } ).catch( function () {
                        expect( "View destroy" ).toBe( "to work" );
                        done();
                    } );
                } );
            } );
        } );
    } );
};

export default sharedSpec;
