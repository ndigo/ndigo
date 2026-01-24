/**
 * @author Jeff Rose
 */

import fill from './fill';

const modules: Promise<any>[] = [];

fill( 'es6_math', function(){
    fill( 'math_acosh', () => modules.push( import( 'core-js/actual/math/acosh' ) ) );
    fill( 'math_asinh', () => modules.push( import( 'core-js/actual/math/asinh' ) ) );
    fill( 'math_atanh', () => modules.push( import( 'core-js/actual/math/atanh' ) ) );
    fill( 'math_cbrt', () => modules.push( import( 'core-js/actual/math/cbrt' ) ) );
    fill( 'math_clz32', () => modules.push( import( 'core-js/actual/math/clz32' ) ) );
    fill( 'math_expm1', () => modules.push( import( 'core-js/actual/math/expm1' ) ) );
    fill( 'math_fround', () => modules.push( import( 'core-js/actual/math/fround' ) ) );
    fill( 'math_hypot', () => modules.push( import( 'core-js/actual/math/hypot' ) ) );
    fill( 'math_imul', () => modules.push( import( 'core-js/actual/math/imul' ) ) );
    fill( 'math_log1p', () => modules.push( import( 'core-js/actual/math/log1p' ) ) );
    fill( 'math_log10', () => modules.push( import( 'core-js/actual/math/log10' ) ) );
    fill( 'math_log2', () => modules.push( import( 'core-js/actual/math/log2' ) ) );
    fill( 'math_sign', () => modules.push( import( 'core-js/actual/math/sign' ) ) );
    fill( 'math_sinh', () => modules.push( import( 'core-js/actual/math/sinh' ) ) );
    fill( 'math_tanh', () => modules.push( import( 'core-js/actual/math/tanh' ) ) );
    fill( 'math_trunc', () => modules.push( import( 'core-js/actual/math/trunc' ) ) );
} );

export default modules.length ? Promise.all( modules ) : Promise.resolve();
