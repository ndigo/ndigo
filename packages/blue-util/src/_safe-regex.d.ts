/**
 * @module blue-util
 * @since 1.0.0
 * @author Jeff Rose
 */
declare module 'safe-regex' {
    function safeRegex(pattern: string): boolean;
    export = safeRegex;
}
