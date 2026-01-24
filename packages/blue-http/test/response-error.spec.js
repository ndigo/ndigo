import ResponseError from '../src/response-error';

describe( 'ResponseError', function(){
    test( 'it should create empty response errors', async function(){
        const response = new ResponseError();
        expect( response ).toHaveProperty( 'message' ).that.equals( 'Invalid response' );
        expect( response ).toHaveProperty( 'body' ).that.is.null;
        expect( response ).toHaveProperty( 'bodyUsed' ).that.is.false;
        expect( response ).toHaveProperty( 'headers' ).that.is.empty;
        expect( response ).toHaveProperty( 'ok' ).that.is.false;
        expect( response ).toHaveProperty( 'redirected' ).that.is.false;
        expect( response ).toHaveProperty( 'status' ).that.equals( 418 );
        expect( response ).toHaveProperty( 'statusText' ).that.equals( 'I\'m a teapot' );
        expect( response ).toHaveProperty( 'trailer' ).that.is.undefined;
        expect( response ).toHaveProperty( 'type' ).that.equals( 'error' );
        expect( response ).toHaveProperty( 'url' ).that.equals( '' );
        expect( response.clone() ).toBeInstanceOf( ResponseError );
        expect( ( await response.arrayBuffer() ).byteLength ).to.be.equal( 0 );
        expect( ( await response.blob() ).size ).to.be.equal( 0 );
        expect( await response.text() ).to.be.equal( '' );
        expect( Object.prototype.toString.call( response ) ).to.equals( '[object ResponseError]' );
    } );
} );
