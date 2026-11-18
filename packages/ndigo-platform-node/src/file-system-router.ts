/**
 * Router that reads the current route from the file system.
 */
import { AbstractRouter, RouterCallback } from '@ndigo/router';

/**
 * A router implementation for Node.js that resolves routes based on the file system.
 */
export class FileSystemRouter extends AbstractRouter {
    /**
     * The `Symbol.toStringTag` value for this instance.
     *
     * `Object.prototype.toString()` reads this symbol to render the
     * instance as `"[object <tag>]" ` (see MDN: Symbol.toStringTag).
     *
     * @returns The string "FileSystemRouter".
     *
     * @example
     * console.log(Object.prototype.toString.call(instance)); // "[object FileSystemRouter]"
     */
    get [Symbol.toStringTag](): string {
        return 'FileSystemRouter';
    }

    #route: string = '/';
    #callback: RouterCallback;

    constructor(callback: RouterCallback) {
        super();
        this.#callback = callback;
    }

    /** The current route. */
    override get route(): string {
        return this.#route;
    }

    /** The route-change callback. */
    override get callback(): RouterCallback {
        return this.#callback;
    }

    /**
     * Sets the route and notifies the callback.
     *
     * @param path - The target path.
     */
    navigate(path: string): void {
        this.#route = path;
        this.refresh();
    }
}
