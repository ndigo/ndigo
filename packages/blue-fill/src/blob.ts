/**
 * @author Jeff Rose
 */

import fill from './fill';

let polyfill: Promise<any>;

const modules: Promise<any>[] = [];

function importOnce(){
    if( !polyfill ){
        polyfill = import( 'blob-polyfill' );
    }
    return polyfill;
};

fill( 'blob',
    () => modules.push( importOnce() ),
    function(){
        fill( 'blob_arraybuffer', () => modules.push( importOnce() ) );
        fill( 'blob_slice', () => modules.push( importOnce() ) );
        fill( 'blob_stream', () => modules.push( importOnce() ) );
        fill( 'blob_text', () => modules.push( importOnce() ) );
    } );

export default modules.length ? Promise.all( modules ) : Promise.resolve();
