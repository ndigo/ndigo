/**
 * Router that reads the current route from the file system.
 */
import { AbstractRouter, RouterCallback } from '@ndigo/router';

/**
 * A router implementation for Node.js that resolves routes based on the file system.
 */
export class FileSystemRouter extends AbstractRouter {
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
