const { rest, setupWorker } = require( 'msw' );

import base64PDF from './dummy.pdf';
import base64GIF from './pixel.gif';
import base64JPG from './pixel.jpg';
import base64PNG from './pixel.png';

export const lastModified = ( new Date( 2020, 0, 1, 0, 0, 0, 0 ) ).toUTCString().replace( ', ', ',' );

export const eTag = '33a64df551425fcc55e4d42a148795d9f25f89d4';

const handlers = [
    rest.get( '/contentType', ( { headers }, response, context ) => {
        const contentType = ( headers && headers.get( 'Content-Type' ) ) || 'text/plain';
        switch( contentType ){
            case 'application/json':
            case 'text/json':
                return response( context.json( { foo: 123 } ) );
            case 'text/html':
                return response( context.xml( '<div id="foo">123</div>' ) );
            default:
                return response( context.text( 'foo=123' ) );
        }
    } ),
    rest.get( '/responseClass/:code', async ( request, response, context ) => {
        const { code } = request.params;
        return response(
            context.status( code ),
            context.body( null )
        );
    } ),
    rest.get( '/responseType/:type/:subtype', async ( request, response, context ) => {
        const
            { type, subtype } = request.params,
            mediaType = `${ type }/${ subtype }`;
        let data, buffer, length;

        switch( mediaType ){
            case 'application/pdf':
                data = await fetch( base64PDF );
                buffer = await data.arrayBuffer();
                length = buffer.byteLength.toString();
                return response(
                    context.set( 'Content-Length', length ),
                    context.set( 'Content-Type', mediaType ),
                    context.body( buffer )
                );
            case 'image/gif':
                data = await fetch( base64GIF );
                buffer = await data.arrayBuffer();
                length = buffer.byteLength.toString();
                return response(
                    context.set( 'Content-Length', length ),
                    context.set( 'Content-Type', mediaType ),
                    context.body( buffer )
                );
            case 'image/jpg':
                data = await fetch( base64JPG );
                buffer = await data.arrayBuffer();
                length = buffer.byteLength.toString();
                return response(
                    context.set( 'Content-Length', length ),
                    context.set( 'Content-Type', mediaType ),
                    context.body( buffer )
                );
            case 'image/png':
                data = await fetch( base64PNG );
                buffer = await data.arrayBuffer();
                length = buffer.byteLength.toString();
                return response(
                    context.set( 'Content-Length', length ),
                    context.set( 'Content-Type', mediaType ),
                    context.body( buffer )
                );
            case 'text/html':
                data = '<div id="foo">123</div>',
                length = data.length.toString();
                return response(
                    context.set( 'Content-Length', length ),
                    context.set( 'Content-Type', mediaType ),
                    context.xml( data )
                );
            case 'text/xml':
                data = '<div id="foo">123</div>',
                length = data.length.toString();
                return response(
                    context.set( 'Content-Length', length ),
                    context.set( 'Content-Type', mediaType ),
                    context.xml( data )
                );
            case 'text/foo':
                data = 'foo=123',
                length = data.length.toString();
                return response(
                    context.set( 'Content-Length', length ),
                    context.set( 'Content-Type', mediaType ),
                    context.text( data )
                );
            default:
                return response(
                    context.set( 'Content-Length', '0' ),
                    context.set( 'Content-Type', mediaType ),
                    context.text( '' )
                );
                break;
        }
    } ),
    rest.get( '/ifModified', ( request, response, context ) => response( context.set( 'Last-Modified', lastModified ), context.set( 'ETag', eTag ), context.json( { foo: 123 } ) ) ),
    rest.get( '/notOK', ( request, response, context ) => response( context.status( 404 ), context.text( 'foo=123' ) ) ),
    rest.get( '/request', ( request, response, context ) => response( context.text( 'foo=123' ) ) ),
    rest.get( '/timeout/:duration', async ( { params }, response, context ) => {
        const { duration } = params;
        return response(
            context.delay( Number( duration ) ),
            context.body( null )
        );
    } ),
    rest.get( '/dataParameter', async ( request, response, context ) => response( context.body( null ) ) ),
    rest.post( '/dataParameter', async ( request, response, context ) => response( context.body( null ) ) )
];

export const worker = setupWorker( ...handlers );
