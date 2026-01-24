/**
 * @author Jeff Rose
 */

import fill from './fill';

const modules: Promise<any>[] = [];

fill( 'es6_number', function(){
    fill( 'number_epsilon', () => modules.push( import( 'core-js/actual/number/epsilon' ) ) );
    fill( 'number_isfinite', () => modules.push( import( 'core-js/actual/number/is-finite' ) ) );
    fill( 'number_isinteger', () => modules.push( import( 'core-js/actual/number/is-integer' ) ) );
    fill( 'number_isnan', () => modules.push( import( 'core-js/actual/number/is-nan' ) ) );
    fill( 'number_max_safe_integer', () => modules.push( import( 'core-js/actual/number/max-safe-integer' ) ) );
    fill( 'number_min_safe_integer', () => modules.push( import( 'core-js/actual/number/min-safe-integer' ) ) );
    fill( 'number_parsefloat', () => modules.push( import( 'core-js/actual/number/parse-float' ) ) );
    fill( 'number_parseint', () => modules.push( import( 'core-js/actual/number/parse-int' ) ) );
    fill( 'number_tofixed', () => modules.push( import( 'core-js/actual/number/to-fixed' ) ) );
    fill( 'number_toprecision', () => modules.push( import( 'core-js/actual/number/to-precision' ) ) );
} );

export default modules.length ? Promise.all( modules ) : Promise.resolve();
