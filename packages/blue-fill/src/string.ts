/**
 * @author Jeff Rose
 */

import fill from './fill';

const modules: Promise<any>[] = [];

fill( 'es5_string', function(){
    fill( 'string_trim', () => modules.push( import( 'core-js/actual/string/trim' ) ) );
} );

fill( 'es6_string', function(){
    fill( 'string_codepointat', () => modules.push( import( 'core-js/actual/string/code-point-at' ) ) );
    fill( 'string_endswith', () => modules.push( import( 'core-js/actual/string/ends-with' ) ) );
    fill( 'string_fromcodepoint', () => modules.push( import( 'core-js/actual/string/from-code-point' ) ) );
    fill( 'string_includes', () => modules.push( import( 'core-js/actual/string/includes' ) ) );
    fill( 'string_normalize', () => modules.push( import( '../node_modules/unorm/lib/unorm' ) ) );
    fill( 'string_raw', () => modules.push( import( 'core-js/actual/string/raw' ) ) );
    fill( 'string_repeat', () => modules.push( import( 'core-js/actual/string/repeat' ) ) );
    fill( 'string_startswith', () => modules.push( import( 'core-js/actual/string/starts-with' ) ) );
} );

fill( 'es7_string', function(){
    fill( 'string_trimleft', () => modules.push( import( 'core-js/actual/string/trim-left' ) ) );
    fill( 'string_trimright', () => modules.push( import( 'core-js/actual/string/trim-right' ) ) );
} );

fill( 'es8_string', function(){
    fill( 'string_padend', () => modules.push( import( 'core-js/actual/string/pad-end' ) ) );
    fill( 'string_padstart', () => modules.push( import( 'core-js/actual/string/pad-start' ) ) );
} );

fill( 'es10_string', function(){
    fill( 'string_trimend', () => modules.push( import( 'core-js/actual/string/trim-end' ) ) );
    fill( 'string_trimstart', () => modules.push( import( 'core-js/actual/string/trim-start' ) ) );
} );

fill( 'es11_string', function(){
    fill( 'string_matchall', () => modules.push( import( 'core-js/actual/string/match-all' ) ) );
} );

// TODO Move this behind an ES check once it's standardized
fill( 'string_replaceall', () => modules.push( import( 'core-js/actual/string/replace-all' ) ) );

export default modules.length ? Promise.all( modules ) : Promise.resolve();
