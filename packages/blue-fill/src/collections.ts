/**
 * @author Jeff Rose
 */

import fill from './fill';

const modules: Promise<any>[] = [];

fill( 'es6_collections', function(){
    fill( 'map', () => modules.push( import( 'core-js/actual/map' ) ) );
    fill( 'set', () => modules.push( import( 'core-js/actual/set' ) ) );
    fill( 'weakmap', () => modules.push( import( 'core-js/actual/weak-map' ) ) );
    fill( 'weakset', () => modules.push( import( 'core-js/actual/weak-set' ) ) );
} );

export default modules.length ? Promise.all( modules ) : Promise.resolve();
