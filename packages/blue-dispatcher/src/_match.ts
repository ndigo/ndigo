import { Comparator, Serializable } from '@blue/core';
import { RouteHandlerMethod } from './route-handler-method';

const { defineProperty } = Reflect;

class Match<T> implements Serializable {
    readonly mapping!: T;
    readonly handlerMethod!: RouteHandlerMethod;

    get [Symbol.toStringTag](): string {
        return 'Match';
    }

    constructor(mapping: T, handlerMethod: RouteHandlerMethod) {
        defineProperty(this, 'mapping', {
            value: mapping,
            configurable: true,
            enumerable: false,
            writable: false,
        });

        defineProperty(this, 'handlerMethod', {
            value: handlerMethod,
            configurable: true,
            enumerable: false,
            writable: false,
        });
    }

    toString(): string {
        return String(this.mapping);
    }
}

class MatchComparator<T> implements Comparator<Match<T>> {
    readonly comparator!: Comparator<T>;

    get [Symbol.toStringTag](): string {
        return 'MatchComparator';
    }

    constructor(comparator: Comparator<T>) {
        defineProperty(this, 'comparator', {
            value: comparator,
            configurable: true,
            enumerable: false,
            writable: false,
        });
    }

    compare(match1: Match<T>, match2: Match<T>): number {
        return this.comparator.compare(match1.mapping, match2.mapping);
    }
}

export { Match, MatchComparator };