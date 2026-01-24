import { expect } from "chai";
import { RootContext } from "@blue/core";
import { WebView } from "../src/view";

// import baseViewSpec from "@blue/view/test/pathBasedView";
import baseViewSpec from "../../blue-view/test/pathBasedView";

const sharedSpec = function ( ViewSubType ){
    let testContainer = null,
        guid = 0,
        hasDOM = false;

    baseViewSpec( ViewSubType );

    if ( document && document.querySelector ) {
        testContainer = document.querySelector( "body" );
        hasDOM = true;
    }

    describe( "WebView", function () {
        test( 'it should be defined', function () {
            expect( ViewSubType ).to.not.be.undefined;
        } );

        describe( "instance", function () {
            let view = undefined,
                parentContext = new RootContext( 'ROOT' ),
                targetId = "webContainer",
                selector = `#${targetId}`,
                testViewId = "webView";

            beforeEach( function () {
                let target = null;
                if ( hasDOM ) {
                    target = document.createElement( "div" );
                    guid++;
                    target.setAttribute( "id", targetId );
                    target.setAttribute( "data-guid", `${guid}` );
                    testContainer.appendChild( target );
                }
                view = new ViewSubType( parentContext, {
                    name: "testView",
                    path: "foo/bar",
                    template: `<div id='${testViewId}'></div>`
                } );
            } );

            afterEach( function () {
                document.querySelector( "body" ).removeChild( document.getElementById( targetId ) );
                return Promise.resolve( view.destroy() );
            } );

            if ( hasDOM ) {
                describe( "replaceIn", function () {
                    it( "should render a view to the target node", function ( done ) {
                        view.replaceIn( selector, {}, {} ).then( function () {
                            expect( view.isInDOM() ).toBe( true );
                            done();
                        }, function () {
                            expect( true ).toBe( false );
                            done();
                        } );
                    } );
                    it( "should replace contents of target node with new template", function ( done ) {
                        let elem = document.createElement( "div" );
                        elem.setAttribute( "id", "replace-me" );
                        document.querySelector( selector ).appendChild( elem );
                        expect( document.getElementById( "replace-me" ) ).to.not.be.null;

                        view.replaceIn( selector, {}, {} ).then( function () {
                            expect( document.getElementById( "replace-me" ) ).toBeNull();
                            expect( view.isInDOM() ).toBe( true );
                            done();
                        }, function () {
                            expect( true ).toBe( false );
                            done();
                        } );
                    } );
                } );
                describe( "appendTo", function () {
                    it( "should render a view to the target node", function ( done ) {
                        view.appendTo( selector, {}, {} ).then( function () {
                            expect( view.isInDOM() ).toBe( true );
                            done();
                        }, function () {
                            expect( true ).toBe( false );
                            done();
                        } );
                    } );
                    it( "should add to contents of target node", function ( done ) {
                        let elem = document.createElement( "div" );
                        elem.setAttribute( "id", "replace-me" );
                        document.querySelector( selector ).appendChild( elem );
                        expect( document.getElementById( "replace-me" ) ).to.not.be.null;

                        view.appendTo( selector, {}, {} ).then( function () {
                            expect( document.getElementById( "replace-me" ) ).to.not.be.null;
                            expect( view.isInDOM() ).toBe( true );
                            done();
                        }, function () {
                            expect( true ).toBe( false );
                            done();
                        } );
                    } );
                } );
            }
        } );
    } );
};

export default sharedSpec;
