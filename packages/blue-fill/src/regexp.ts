/**
 * @author Jeff Rose
 */

import fill from './fill';

const modules: Promise<any>[] = [];

fill( 'es6_regexp', function(){
    fill( 'regexp_flags', () => modules.push( import( 'core-js/actual/regexp/flags' ) ) );
} );

export default modules.length ? Promise.all( modules ) : Promise.resolve();
