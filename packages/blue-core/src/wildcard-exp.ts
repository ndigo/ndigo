/**
 * @author Jeff Rose
 */

import { wildcardExpression } from '@blue/parser';

/**
 * @extends external:RegExp
 * @param {string} pattern A wildcard pattern
 */
export default class WildcardExp extends RegExp {
    constructor(pattern: string = '*') {
        const parseResult = wildcardExpression.run(pattern);
        if (!parseResult.isError) {
            // Type narrowing: parseResult is Ok<string, any> here
            super((parseResult as { isError: false; result: string; index: number; data: any }).result);
        } else {
            throw new Error(`Failed to parse wildcard pattern: ${pattern}`);
        }
    }
}
