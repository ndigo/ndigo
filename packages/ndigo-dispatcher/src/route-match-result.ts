/**
 * @module ndigo-dispatcher
 * @since 1.0.0
 * @author Jeff Rose
 */
import { createNull, JSONValue } from '@ndigo/core';

/**
 * Result of matching a route pattern to a path.
 */
export class RouteMatchResult {
    /**
     * The matched pattern.
     */
    readonly pattern: string;

    /**
     * The matched path.
     */
    readonly path: string;

    get [Symbol.toStringTag](): string {
        return 'RouteMatchResult';
    }

    /**
     * Create a route match result.
     *
     * @param pattern - The matched pattern.
     * @param path - The matched path.
     */
    constructor(pattern: string, path: string) {
        this.pattern = pattern;
        this.path = path;
    }

    /**
     * Serialize the match result to JSON.
     *
     * @returns A JSON representation of the match.
     */
    toJSON(): JSONValue {
        const json = createNull();
        json.pattern = this.pattern;
        json.path = this.path;
        return json;
    }
}
