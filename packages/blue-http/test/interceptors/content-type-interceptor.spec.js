import { worker } from '../_worker';
import { HTTP } from '../../src/http';
import { ContentTypeInterceptor } from '../../src/interceptors/content-type-interceptor';
import { MediaTypes } from '@blue/core';

class TestContentTypeInterceptor extends ContentTypeInterceptor {
    preInit( url, settings ){
        const proceed = super.preInit( url, settings );
        expect( proceed ).toBe( true );
        settings.contentType && expect( settings.headers.get( 'Content-Type' ) ).toBe( 'text/html' );
        return proceed;
    }
}

const parseXML = async ( response ) => {
    const
        text = await response.text(),
        doc = ( new DOMParser() ).parseFromString( text, 'text/xml' ),
        result = ( new XMLSerializer() ).serializeToString( doc );
    return result;
};

describe( 'ContentTypeInterceptor', function(){
    let http;

    before( () => worker.start( { quiet: true } ) );

    beforeEach( function(){
        http = new HTTP( [ new TestContentTypeInterceptor() ] );
    } );

    afterEach( function(){
        http = void 0;
        worker.resetHandlers();
    } );

    after( () => worker.stop() );

    test( 'it should handle string media types', async function(){
        const
            response = await http.request( '/contentType', {
                contentType: 'text/html'
            } ),
            text = await parseXML( response );
        expect( text ).toBe( '<div id="foo">123</div>' );
    } );

    test( 'it should handle instance media types', async function(){
        const
            response = await http.request( '/contentType', {
                contentType: MediaTypes.TEXT_HTML
            } ),
            text = await parseXML( response );
        expect( text ).toBe( '<div id="foo">123</div>' );
    } );

    test( 'it should overwrite the existing Content-Type header', async function(){
        const
            response = await http.request( '/contentType', {
                contentType: 'text/html',
                headers: new Headers( {
                    'Content-type': 'application/json'
                } )
            } ),
            text = await parseXML( response );
        expect( text ).toBe( '<div id="foo">123</div>' );
    } );

    test( 'it should ignore requests that lack a contentType setting', async function(){
        const
            response = await http.request( '/contentType', {
                headers: new Headers( {
                    'Content-type': 'application/json'
                } )
            } ),
            json = await response.json();
        expect( json ).toEqual( { foo: 123 } );
    } );
} );
