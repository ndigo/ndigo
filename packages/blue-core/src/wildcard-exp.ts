/**
 * @author Jeff Rose
 */

import { wildcardExpression } from '@blue/parser';
import { FrameworkError } from './error';

/**
 * A regular expression compiled from a wildcard pattern.
 */
export default class WildcardExp extends RegExp {
    /**
     * Compiles a wildcard pattern into a regular expression.
     *
     * @param pattern - Wildcard pattern to compile.
     * @throws {FrameworkError} When the wildcard parser cannot parse the pattern.
     */
    constructor(pattern: string = '*') {
        const parseResult = wildcardExpression.run(pattern);
        if (!parseResult.isError) {
            // Type narrowing: parseResult is Ok<string, any> here
            super((parseResult as { isError: false; result: string; index: number; data: any }).result);
        } else {
            throw new FrameworkError(`Failed to parse wildcard pattern: ${pattern}`);
        }
    }
}
