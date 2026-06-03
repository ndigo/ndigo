/**
 * @author Jeff Rose
 */

import randHex from './rand-hex.js';
import randInt from './rand-int.js';

/** Variant nibbles for UUID v4 (RFC 4122 section 4.4). */
const UUID_VARIANT_NIBBLES = [8, 9, 'a', 'b'] as const;

/**
 * Generates a pseudo-random Globally Unique Identifier (v4).
 * Since the total number of GUIDs is 2^122 the chance of generating the same value twice is negligible.
 * @returns {string}
 * @category Math
 * @example
 * guid();
 * //=> "830e9f50-ac7f-4369-a14f-ed0e62b2fa0b"
 * guid();
 * //=> "5de3d09b-e79c-4727-932b-48c49228d508"
 */
const guid = (): string => {
    const variantNibble = UUID_VARIANT_NIBBLES[randInt(0, UUID_VARIANT_NIBBLES.length - 1)];
    return `${randHex(8)}-${randHex(4)}-4${randHex(3)}-${variantNibble}${randHex(3)}-${randHex(12)}`;
};

export default guid;
