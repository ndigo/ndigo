import { complement } from '@blue/util/logic';
import { isNil } from '@blue/util/types';
import {
    addIndex as functionAddIndex,
    addIndexRight as functionAddIndexRight,
} from '@blue/util/function';

// Export all utility modules
export * from '@blue/util/function';
export * from '@blue/util/list';
export * from '@blue/util/logic';
export * from '@blue/util/math';
export * from '@blue/util/object';
export * from '@blue/util/relation';
export * from '@blue/util/string';
export * from '@blue/util/types';

// Explicitly re-export the function versions of the conflicting names
// (the list module versions will be exported via export * above,
// but we prefer the function versions for backwards compatibility)
export { functionAddIndex as addIndex, functionAddIndexRight as addIndexRight };

export const isNotNil = complement(isNil);
