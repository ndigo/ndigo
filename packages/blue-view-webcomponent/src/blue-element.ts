/**
 * @author Jeff Rose
 */

import { Constructable } from '@blue/core';

interface BlueElement {
    name: string;
}

const NAME = 'name';

export const AsBlueElement = <T extends Constructable<HTMLElement>>( superclass: T ): Constructable<BlueElement> & T => class extends superclass implements BlueElement {
    get name(): string {
        return this.getAttribute( NAME );
    }

    set name( newName: string ){
        newName && this.setAttribute( NAME, newName );
    }
};
