/**
 * @author Jeff Rose
 */

import fill from './fill';

const modules: Promise<any>[] = [];

fill( 'es5_array', function(){
    fill( 'array_every', () => modules.push( import( 'core-js/actual/array/every' ) ) );
    fill( 'array_filter', () => modules.push( import( 'core-js/actual/array/filter' ) ) );
    fill( 'array_foreach', () => modules.push( import( 'core-js/actual/array/for-each' ) ) );
    fill( 'array_indexof', () => modules.push( import( 'core-js/actual/array/index-of' ) ) );
    fill( 'array_isarray', () => modules.push( import( 'core-js/actual/array/is-array' ) ) );
    fill( 'array_lastindexof', () => modules.push( import( 'core-js/actual/array/last-index-of' ) ) );
    fill( 'array_map', () => modules.push( import( 'core-js/actual/array/map' ) ) );
    fill( 'array_some', () => modules.push( import( 'core-js/actual/array/some' ) ) );
    fill( 'array_reduce', () => modules.push( import( 'core-js/actual/array/reduce' ) ) );
    fill( 'array_reduceright', () => modules.push( import( 'core-js/actual/array/reduce-right' ) ) );
} );

fill( 'es6_array', function(){
    fill( 'array_copywithin', () => modules.push( import( 'core-js/actual/array/copy-within' ) ) );
    fill( 'array_entries', () => modules.push( import( 'core-js/actual/array/entries' ) ) );
    fill( 'array_fill', () => modules.push( import( 'core-js/actual/array/fill' ) ) );
    fill( 'array_find', () => modules.push( import( 'core-js/actual/array/find' ) ) );
    fill( 'array_findindex', () => modules.push( import( 'core-js/actual/array/find-index' ) ) );
    fill( 'array_from', () => modules.push( import( 'core-js/actual/array/from' ) ) );
    fill( 'array_of', () => modules.push( import( 'core-js/actual/array/of' ) ) );
    fill( 'array_values', () => modules.push( import( 'core-js/actual/array/values' ) ) );
} );

fill( 'es7_array', function(){
    fill( 'array_includes', () => modules.push( import( 'core-js/actual/array/includes' ) ) );
} );

fill( 'es10_array', function(){
    fill( 'array_flatmap', () => modules.push( import( 'core-js/actual/array/flat-map' ) ) );
    fill( 'array_flat', () => modules.push( import( 'core-js/actual/array/flat' ) ) );
} );

fill( 'array_at', () => modules.push( import( 'core-js/actual/array/at' ) ) );

export default modules.length ? Promise.all( modules ) : Promise.resolve();
