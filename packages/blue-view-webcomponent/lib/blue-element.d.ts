/**
 * @author Jeff Rose
 */
import { Constructable } from '@blue/core';
interface BlueElement {
    name: string;
}
export declare const AsBlueElement: <T extends Constructable<HTMLElement>>(superclass: T) => Constructable<BlueElement> & T;
export {};
//# sourceMappingURL=blue-element.d.ts.map