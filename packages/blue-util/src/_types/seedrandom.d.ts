/**
 * @module blue-util
 * @since 1.0.0
 * @author Jeff Rose
 */
declare module 'seedrandom/lib/alea.js' {
    function alea(
        seed?: string,
        options?: { entropy: boolean }
    ): {
        double(): number;
    };
    export default alea;
}
