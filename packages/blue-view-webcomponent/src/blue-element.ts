/**
 * @author Jeff Rose
 */

import { Constructable } from '@blue/core';

export interface BlueElement {
    name: string;
}

const NAME = 'name';

/**
 * Adds a `name` property that reflects the element's `name` attribute.
 *
 * Use this mixin when a web component should expose a simple attribute-backed identifier
 * without re-implementing the reflection logic in each subclass.
 *
 * @param superclass - The base HTMLElement subclass to extend.
 * @returns A subclass that exposes a reflected `name` property.
 */
export const AsBlueElement = <T extends Constructable<HTMLElement>>(superclass: T): Constructable<BlueElement> & T =>
    class extends superclass implements BlueElement {
        get name(): string {
            return this.getAttribute(NAME) ?? '';
        }

        set name(newName: string) {
            if (newName) {
                this.setAttribute(NAME, newName);
            }
        }
    };
