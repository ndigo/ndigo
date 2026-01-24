import ResponseStatus from '../src/response-status';

describe( 'ResponseStatus', function(){
    test( 'it should create statuses', function(){
        const
            continueStatus = new ResponseStatus( 100, 'Continue' ),
            okStatus = new ResponseStatus( 200, 'OK' ),
            multipleChoiceStatus = new ResponseStatus( 300, 'Multiple Choice' ),
            badRequestStatus = new ResponseStatus( 400, 'Bad Request' ),
            internalServerErrorStatus = new ResponseStatus( 500, 'Internal Server Error' ),

            okJSON = { 'code': 200, 'text': 'OK' },
            okString = '200 OK';

        expect( okStatus ).to.have.ownProperty( 'code' ).that.equals( 200 );
        expect( okStatus ).to.have.ownProperty( 'text' ).that.equals( 'OK' );
        expect( okStatus.toString() ).toBe( okString );
        expect( String( okStatus ) ).toBe( okString );
        expect( okStatus.toJSON() ).toEqual( okJSON );

        expect( continueStatus.isClientErrorClass ).toBe( false );
        expect( continueStatus.isInformationClass ).toBe( true );
        expect( continueStatus.isRedirectClass ).toBe( false );
        expect( continueStatus.isServerErrorClass ).toBe( false );
        expect( continueStatus.isSuccessClass ).toBe( false );

        expect( okStatus.isClientErrorClass ).toBe( false );
        expect( okStatus.isInformationClass ).toBe( false );
        expect( okStatus.isRedirectClass ).toBe( false );
        expect( okStatus.isServerErrorClass ).toBe( false );
        expect( okStatus.isSuccessClass ).toBe( true );

        expect( multipleChoiceStatus.isClientErrorClass ).toBe( false );
        expect( multipleChoiceStatus.isInformationClass ).toBe( false );
        expect( multipleChoiceStatus.isRedirectClass ).toBe( true );
        expect( multipleChoiceStatus.isServerErrorClass ).toBe( false );
        expect( multipleChoiceStatus.isSuccessClass ).toBe( false );

        expect( badRequestStatus.isClientErrorClass ).toBe( true );
        expect( badRequestStatus.isInformationClass ).toBe( false );
        expect( badRequestStatus.isRedirectClass ).toBe( false );
        expect( badRequestStatus.isServerErrorClass ).toBe( false );
        expect( badRequestStatus.isSuccessClass ).toBe( false );

        expect( internalServerErrorStatus.isClientErrorClass ).toBe( false );
        expect( internalServerErrorStatus.isInformationClass ).toBe( false );
        expect( internalServerErrorStatus.isRedirectClass ).toBe( false );
        expect( internalServerErrorStatus.isServerErrorClass ).toBe( true );
        expect( internalServerErrorStatus.isSuccessClass ).toBe( false );

        expect( Object.prototype.toString.call( okStatus ) ).to.equals( '[object ResponseStatus:200]' );
    } );

    test( 'it should return registered statuses', function(){
        const
            okResponse = new Response( null, { status: 200, statusText: 'OK' } ),
            okStatus = ResponseStatus.for( 200, 'OK' );

        expect( ResponseStatus.for( okResponse ) ).toBe( okStatus );
        expect( ResponseStatus.for( 999 ) ).toBeNull();
    } );

    test( 'it should be comparable', function(){
        const
            okStatus = ResponseStatus.for( 200, 'OK' ),
            okTooStatus = new ResponseStatus( 200, 'OK Too' ),
            createdStatus = ResponseStatus.for( 201, 'Created' );

        expect( okStatus.compareTo( createdStatus ) ).toBe( -1 );
        expect( createdStatus.compareTo( okStatus ) ).toBe( 1 );
        expect( okStatus.compareTo( okStatus ) ).toBe( 0 );
        expect( okStatus.compareTo( okTooStatus ) ).toBe( -1 );

        expect( okStatus.equals( okStatus ) ).toBe( true );
        expect( okStatus.equals( createdStatus ) ).toBe( false );
    } );

    test( 'it should create responses', function(){
        const
            okStatus = ResponseStatus.for( 200, 'OK' ),
            okResponse = okStatus.createResponse( null );

        expect( okResponse ).toHaveProperty( 'body' ).that.is.null;
        expect( okResponse ).toHaveProperty( 'status' ).that.equals( 200 );
        expect( okResponse ).toHaveProperty( 'statusText' ).that.equals( 'OK' );
    } );

    test( 'it should create response inits', function(){
        const okStatus = ResponseStatus.for( 200, 'OK' );

        expect( okStatus.toResponseInit() ).toEqual( { status: 200, statusText: 'OK' } );
    } );
} );
