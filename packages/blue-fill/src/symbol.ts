/**
 * @author Jeff Rose
 */

import fill from './fill';

const modules: Promise<any>[] = [];

fill( 'symbol',
    () => modules.push( import( 'core-js/actual/symbol/index' ) ),
    function(){
        fill( 'es6_symbol', function(){
            fill( 'symbol_for', () => modules.push( import( 'core-js/actual/symbol/for' ) ) );
            fill( 'symbol_keyfor', () => modules.push( import( 'core-js/actual/symbol/key-for' ) ) );
            fill( 'symbol_hasinstance', () => modules.push( import( 'core-js/actual/symbol/has-instance' ) ) );
            fill( 'symbol_isconcatspreadable', () => modules.push( import( 'core-js/actual/symbol/is-concat-spreadable' ) ) );
            fill( 'symbol_iterator', () => modules.push( import( 'core-js/actual/symbol/iterator' ) ) );
            fill( 'symbol_match', () => modules.push( import( 'core-js/actual/symbol/match' ) ) );
            fill( 'symbol_replace', () => modules.push( import( 'core-js/actual/symbol/replace' ) ) );
            fill( 'symbol_search', () => modules.push( import( 'core-js/actual/symbol/search' ) ) );
            fill( 'symbol_species', () => modules.push( import( 'core-js/actual/symbol/species' ) ) );
            fill( 'symbol_split', () => modules.push( import( 'core-js/actual/symbol/split' ) ) );
            fill( 'symbol_toprimitive', () => modules.push( import( 'core-js/actual/symbol/to-primitive' ) ) );
            fill( 'symbol_tostringtag', () => modules.push( import( 'core-js/actual/symbol/to-string-tag' ) ) );
            fill( 'symbol_unscopables', () => modules.push( import( 'core-js/actual/symbol/unscopables' ) ) );
        } );
        fill( 'es9_symbol', function(){
            fill( 'symbol_asynciterator', () => modules.push( import( 'core-js/actual/symbol/async-iterator' ) ) );
        } );
        fill( 'es10_symbol', function(){
            fill( 'symbol_description', () => modules.push( import( 'core-js/actual/symbol/description' ) ) );
        } );
    } );

export default modules.length ? Promise.all( modules ) : Promise.resolve();
