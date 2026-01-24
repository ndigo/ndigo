const { expect } = require( 'chai' );
const { spy } = require( 'sinon' );
import { worker } from '../_worker';
import { HTTP } from '../../src/http';
import { MappedResponseClassHTTPInterceptor } from '../../src/interceptors/response-class-interceptor';

describe( 'ResponseClassHTTPInterceptor', function(){
    let http, interceptor;

    before( () => worker.start( { quiet: true } ) );

    beforeEach( function(){
        interceptor = new MappedResponseClassHTTPInterceptor( {
            postInformationalResponse   : spy(),
            postSuccessfulResponse      : spy(),
            postRedirectResponse        : spy(),
            postClientErrorResponse     : spy(),
            postServerErrorResponse     : spy()
        } );
        http = new HTTP( [ interceptor ] );
    } );

    afterEach( function(){
        http = interceptor = void 0;
        worker.resetHandlers();
    } );

    after( () => worker.stop() );

    //! This does not work and I do not know why. -JBR
    xtest( 'it should handle informational responses', async function(){
        await http.request( '/responseClass/100' );
        const interceptor = http.interceptors[ 0 ].interceptor;
        expect( interceptor.postInformationalResponse.called ).toBe( true );
        expect( interceptor.postSuccessfulResponse.called ).toBe( false );
        expect( interceptor.postRedirectResponse.called ).toBe( false );
        expect( interceptor.postClientErrorResponse.called ).toBe( false );
        expect( interceptor.postServerErrorResponse.called ).toBe( false );
    } );

    test( 'it should handle successful responses', async function(){
        await http.request( '/responseClass/200' );
        const interceptor = http.interceptors[ 0 ].interceptor;
        expect( interceptor.postInformationalResponse.called ).toBe( false );
        expect( interceptor.postSuccessfulResponse.called ).toBe( true );
        expect( interceptor.postRedirectResponse.called ).toBe( false );
        expect( interceptor.postClientErrorResponse.called ).toBe( false );
        expect( interceptor.postServerErrorResponse.called ).toBe( false );
    } );

    test( 'it should handle redirect responses', async function(){
        await http.request( '/responseClass/300' );
        const interceptor = http.interceptors[ 0 ].interceptor;
        expect( interceptor.postInformationalResponse.called ).toBe( false );
        expect( interceptor.postSuccessfulResponse.called ).toBe( false );
        expect( interceptor.postRedirectResponse.called ).toBe( true );
        expect( interceptor.postClientErrorResponse.called ).toBe( false );
        expect( interceptor.postServerErrorResponse.called ).toBe( false );
    } );

    test( 'it should handle client error responses', async function(){
        await http.request( '/responseClass/400' );
        const interceptor = http.interceptors[ 0 ].interceptor;
        expect( interceptor.postInformationalResponse.called ).toBe( false );
        expect( interceptor.postSuccessfulResponse.called ).toBe( false );
        expect( interceptor.postRedirectResponse.called ).toBe( false );
        expect( interceptor.postClientErrorResponse.called ).toBe( true );
        expect( interceptor.postServerErrorResponse.called ).toBe( false );
    } );

    test( 'it should handle server error responses', async function(){
        await http.request( '/responseClass/500' );
        const interceptor = http.interceptors[ 0 ].interceptor;
        expect( interceptor.postInformationalResponse.called ).toBe( false );
        expect( interceptor.postSuccessfulResponse.called ).toBe( false );
        expect( interceptor.postRedirectResponse.called ).toBe( false );
        expect( interceptor.postClientErrorResponse.called ).toBe( false );
        expect( interceptor.postServerErrorResponse.called ).toBe( true );
    } );

} );
