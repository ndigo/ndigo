/**
 * Route match results.
 */
import { createNull, JSONValue, Serializable } from '@ndigo/core';

/**
 * Result of matching a route pattern to a path.
 */
export class RouteMatchResult implements Serializable {
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
