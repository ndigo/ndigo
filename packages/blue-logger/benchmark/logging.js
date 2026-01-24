const
    fs = require( 'fs' ),
    Benchmark = require( 'benchmark' ),
    PinoLogger = require( 'pino' ),
    { createLogger, transports } = require( 'winston' ),
    { EventLogger, SimpleLogger, AsApacheLogger } = require( '..' ),

    suite = new Benchmark.Suite(),

    EventApacheLogger = AsApacheLogger( EventLogger ),
    SimpleApacheLogger = AsApacheLogger( SimpleLogger ),

    eventLogger = new EventApacheLogger( 'test' ),
    simpleLogger = new SimpleApacheLogger( 'test' ),

    pinoLogger = PinoLogger( fs.createWriteStream( '/dev/null' ) ),
    winstonLogger = createLogger( {
        level: 'info',
        transports: [ new transports.Console( { level: 'warn' } ) ]
    } );

suite
    .add( 'simple-logger', function(){
        simpleLogger.info( 'test' );
    } )
    .add( 'event-logger', function(){
        eventLogger.info( 'test' );
    } )
    .add( 'pino', function(){
        pinoLogger.info( 'test' );
    } )
    .add( 'winston', function(){
        winstonLogger.info( 'test' );
    } )
    .on( 'cycle', function( e ){
        console.log( `${ e.target }` );
    } )
    .on( 'complete', function(){
        console.log( `Fastest is ${ this.filter( 'fastest' ).map( 'name' ) }` );
    } )
    .run();
