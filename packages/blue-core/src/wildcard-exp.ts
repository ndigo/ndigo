/**
 * @author Jeff Rose
 */

import { wildcardExpression } from '@blue/parser';

/**
 * @class module:core.WildcardExp
 * @extends external:RegExp
 * @param {external:string} pattern A wildcard pattern
 */
export default class WildcardExp extends RegExp {
    constructor( pattern: string = '*' ){
        const regExpPattern = wildcardExpression.run( pattern ).result;
        super( regExpPattern );
    }
}
