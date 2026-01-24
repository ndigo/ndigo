/**
 * @author Jeff Rose
 */

import { complement, isNil } from '@blue/util';

export * from '@blue/util';

export const isDefined = complement( isNil );
