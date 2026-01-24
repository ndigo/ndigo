let l = 1000;

const
    Benchmark = require( 'benchmark' ),
    { RingBuffer, ResizableRingBuffer } = require( '..' ),
    NativeArray = Array,

    suite = new Benchmark.Suite(),
    ringBuffer = new RingBuffer(),
    allocatedRingBuffer = new RingBuffer( l ),
    resizableRingBuffer = new ResizableRingBuffer(),
    allocatedResizableRingBuffer = new ResizableRingBuffer( l ),
    array = new NativeArray(),
    allocatedArray = new NativeArray( l );

while( --l ){
    ringBuffer.put( l );
    allocatedRingBuffer.put( l );
    resizableRingBuffer.put( l );
    allocatedResizableRingBuffer.put( l );
    array.push( l );
    allocatedArray.push( l );
}

suite
    .add( 'ring-buffer', function(){
        ringBuffer.put( ringBuffer.get() );
        ringBuffer.put( ringBuffer.get() );
        ringBuffer.put( ringBuffer.get() );
    } )
    .add( 'allocated-ring-buffer', function(){
        allocatedRingBuffer.put( allocatedRingBuffer.get() );
        allocatedRingBuffer.put( allocatedRingBuffer.get() );
        allocatedRingBuffer.put( allocatedRingBuffer.get() );
    } )
    .add( 'resizable-ring-buffer', function(){
        resizableRingBuffer.put( resizableRingBuffer.get() );
        resizableRingBuffer.put( resizableRingBuffer.get() );
        resizableRingBuffer.put( resizableRingBuffer.get() );
    } )
    .add( 'allocated-resizable-ring-buffer', function(){
        allocatedResizableRingBuffer.put( allocatedResizableRingBuffer.get() );
        allocatedResizableRingBuffer.put( allocatedResizableRingBuffer.get() );
        allocatedResizableRingBuffer.put( allocatedResizableRingBuffer.get() );
    } )
    .add( 'built-in-array', function(){
        array.push( array.shift() );
        array.push( array.shift() );
        array.push( array.shift() );
    } )
    .add( 'allocated-built-in-array', function(){
        allocatedArray.push( allocatedArray.shift() );
        allocatedArray.push( allocatedArray.shift() );
        allocatedArray.push( allocatedArray.shift() );
    } )
    .on( 'cycle', function( e ){
        console.log( `${ e.target }` );
    } )
    .on( 'complete', function(){
        console.log( `Fastest is ${ this.filter( 'fastest' ).map( 'name' ) }` );
    } )
    .run();
