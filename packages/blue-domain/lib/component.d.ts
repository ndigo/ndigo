import { JSONValue, JSONObject, Null, Serializable } from '@blue/core';
import { EventEmitter } from '@blue/context';
import { AsyncDestroyable, Initializable } from '@blue/factory';
export type DomainActions = {
    [action: string]: (data: JSONObject) => void;
};
export type DomainData = {
    [property: string]: JSONValue;
};
export type DomainSettings = {
    [setting: string]: JSONValue;
};
export type DomainStates = {
    [state: string]: JSONValue;
};
export interface DomainComponent extends Initializable, EventEmitter, AsyncDestroyable, Serializable {
    id: number;
    name: string;
    model: JSONObject;
    actions: DomainActions;
    data: DomainData;
    settings: DomainSettings;
    states: DomainStates;
    validate(property: string): void;
}
declare const GenericDomainComponent_base: import("@blue/core").Constructable<EventEmitter> & typeof Null;
/**
 * @class module:component.GenericDomainComponent
 */
export declare class GenericDomainComponent extends GenericDomainComponent_base implements DomainComponent {
    id: number;
    name: string;
    model: JSONObject;
    actions: DomainActions;
    settings: DomainSettings;
    states: DomainStates;
    destroyed: boolean;
    get [Symbol.toStringTag](): string;
    set data(newData: DomainData);
    constructor();
    init(name: string): void;
    validate(property: string): void;
    destroy(): Promise<void>;
    toJSON(): JSONObject;
    toString(): string;
}
export {};
//# sourceMappingURL=component.d.ts.map