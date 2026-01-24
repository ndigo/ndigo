import { JSONValue, JSONObject, Null, Serializable, createNull } from '@blue/core';
import { AsEventEmitter, EventEmitter } from '@blue/context';
import { AsyncDestroyable, Initializable } from '@blue/factory';
import { forEachObjIndexed, curryN } from '@blue/util';

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

const { defineProperty, deleteProperty } = Reflect,
    initializeData = curryN(1, function (component, value, key) {
        component.model.set(key, value);
        defineProperty(component, key, {
            get: () => component.model.get(key, { isolate: true }),
            set: function () {},
            configurable: true,
            enumerable: true,
            writable: false,
        });
    });

let uuid = 0;

/**
 * @class module:component.GenericDomainComponent
 */
export class GenericDomainComponent extends AsEventEmitter(Null) implements DomainComponent {
    id: number;
    name: string;
    model: JSONObject;
    actions: DomainActions;
    settings: DomainSettings;
    states: DomainStates;
    destroyed: boolean;

    get [Symbol.toStringTag](): string {
        return `DomainComponent:${this.name}`;
    }

    set data(newData: DomainData) {
        const initData = initializeData(this);
        forEachObjIndexed(initData, newData);
        deleteProperty(this, 'data');
    }

    constructor() {
        super();
        const id = ++uuid;
        defineProperty(this, 'id', {
            get: () => id,
            configurable: true,
            enumerable: false,
        });
    }

    init(name: string): void {
        defineProperty(this, 'name', {
            get: () => name,
            configurable: true,
            enumerable: false,
        });
    }

    validate(property: string): void {
        throw new Error('Method not implemented.');
    }

    async destroy(): Promise<void> {
        throw new Error('Method not implemented.');
    }

    toJSON(): JSONObject {
        const json = createNull();

        json.name = this.name;
        json.id = this.id;

        return json;
    }

    toString(): string {
        return this.name;
    }
}
