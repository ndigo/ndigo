import { Constructable } from '@blue/core';
import { DomainComponent } from './component';
export declare const MyComponent: <T extends Constructable<DomainComponent>>(superclass: T) => Constructable<DomainComponent> & T;
export declare class MyOtherComponent {
}
export declare const MyOther: (context: any) => {
    new (): {};
};
//# sourceMappingURL=example.d.ts.map