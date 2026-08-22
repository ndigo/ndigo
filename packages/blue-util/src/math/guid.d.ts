/**
 * @author Jeff Rose
 */
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
declare const guid: () => string;
export default guid;
