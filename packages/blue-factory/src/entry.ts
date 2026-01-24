/**
 * @author Jeff Rose
 */

export default class Entry<T> {
    #name: string;
    #scope: string;
    #value: T;

    get name(): string {
        return this.#name;
    }

    get scope(): string {
        return this.#scope;
    }

    get value(): T {
        return this.#value;
    }

    constructor(name: string, value: T, scope: string) {
        this.#name = name;
        this.#value = value;
        this.#scope = scope;
    }
}
