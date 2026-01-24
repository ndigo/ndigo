import { expect } from "chai";
import { RootContext } from "@blue/core";
import { PathBasedView } from "../src/view";

// import baseViewSpec from "@blue/view/test/view";
import baseViewSpec from "../../blue-view/test/view";

const sharedSpec = function ( ViewSubType ){
    baseViewSpec( ViewSubType );

    describe( 'PathBasedView', function () {
        test( 'it should be defined', function () {
            expect( ViewSubType ).to.not.be.undefined;
        } );

        describe( "instance", function () {
            let view = undefined,
                parentContext = new RootContext( 'ROOT' );
            beforeEach( function () {
                view = new ViewSubType( parentContext, {
                    name: "testView",
                    path: "foo/bar"
                } );
            } );

            describe( "props", function () {
                it( "should have a path", function () {
                    expect( view.path ).to.be.a( "string" );
                    expect( view.path ).to.not.equal( "" );
                } );
            } )
        } );
    } );
};

export default sharedSpec;
