/**
 */
import { AbstractRouter, RouterCallback } from '@ndigo/router';

/**
 * A router implementation for Node.js that resolves routes based on the file system.
 * @since 1.0.0
 */
export class FileSystemRouter extends AbstractRouter {
    #route: string = '/';
    #callback: RouterCallback;

    constructor(callback: RouterCallback) {
        super();
        this.#callback = callback;
    }

    override get route(): string {
        return this.#route;
    }

    override get callback(): RouterCallback {
        return this.#callback;
    }

    navigate(path: string): void {
        this.#route = path;
        this.refresh();
    }
}
