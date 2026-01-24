import { Constructable } from '@blue/core';
import { DomainComponent } from './component';

export const MyComponent = <T extends Constructable<DomainComponent>>(
    superclass: T
): Constructable<DomainComponent> & T =>
    class extends superclass {
        onInit() {}

        onDestroy() {}
    };

export class MyOtherComponent {}

export const MyOther = (context) => {
    console.log();
    return class {};
};
