import { JSONValue, JSONObject, Serializable, createNull } from '@blue/core';
import { Emitter, EventEmitter } from '@blue/context';
import { AsyncDestroyable, Initializable } from '@blue/factory';
import { z } from 'zod';

/**
 * Maps action names to handlers that receive domain data payloads.
 */
export type DomainActions = {
    [action: string]: (data: JSONObject) => void;
};

/**
 * Stores JSON-compatible data exposed by a domain component.
 */
export type DomainData = {
    [property: string]: JSONValue;
};

/**
 * Stores configuration values that affect how a domain component behaves.
 */
export type DomainSettings = {
    [setting: string]: JSONValue;
};

/**
 * Stores named state values for a domain component.
 */
export type DomainStates = {
    [state: string]: JSONValue;
};

/**
 * Represents a serializable, event-driven domain component with lifecycle hooks.
 */
export interface DomainComponent extends Initializable, EventEmitter, AsyncDestroyable, Serializable {
    id: number;
    name: string;
    model: JSONObject;
    actions: DomainActions;
    data: DomainData;
    settings: DomainSettings;
    states: DomainStates;

    /**
     * Validates a component property before it is used or persisted.
     *
     * The validation is Zod-backed: subclasses declare validation schemas per
     * group (see `validationSchemas`) and `validate()` runs `safeParse` over
     * the selected groups.
     *
     * @param options - Validation options (group selection).
     */
    validate(options?: ComponentValidationOptions): ComponentValidationResult;
}

/**
 * Options for {@link DomainComponent.validate}.
 */
export interface ComponentValidationOptions {
    /** Validation groups to run. Defaults to all declared groups. */
    groups?: string[];
}

/**
 * Result of {@link DomainComponent.validate}.
 */
export interface ComponentValidationResult {
    isValid: boolean;
    failedProperties: Set<string>;
}

const { defineProperty, deleteProperty } = Reflect,
    initializeData = (component: GenericDomainComponent) => (value: any, key: string) => {
        defineProperty(component, key, {
            get: () => (component.model as any).get(key, { isolate: true }),
            set: function () {
                (component.model as any).set(key, arguments[0]);
            },
            configurable: true,
            enumerable: true,
            writable: false,
        });
    };

let uuid = 0;

export class GenericDomainComponent extends Emitter implements DomainComponent {
    id!: number;
    name!: string;
    model!: JSONObject;
    actions!: DomainActions;
    settings!: DomainSettings;
    states!: DomainStates;

    /**
     * Zod validation schemas keyed by group name. Subclasses override this to
     * declare field constraints; `validate()` runs the selected groups.
     *
     * @example
     * ```ts
     * class ProfileComponent extends GenericDomainComponent {
     *   username: string = '';
     *
     *   get validationSchemas(): Record<string, z.ZodType> {
     *     return { create: z.object({ username: z.string().regex(/^[a-z]+$/) }) };
     *   }
     * }
     * ```
     */
    get validationSchemas(): Record<string, z.ZodType> {
        return {};
    }

    /**
     * Runs the Zod schemas for the selected groups and reports failures.
     *
     * @param options - Optional group selection; defaults to all groups.
     * @returns Whether the component is valid and the set of failed fields.
     */
    validate(options: ComponentValidationOptions = {}): ComponentValidationResult {
        const groups = options.groups?.length ? options.groups : Object.keys(this.validationSchemas);
        const failedProperties = new Set<string>();

        for (const group of groups) {
            const schema = this.validationSchemas[group];
            if (!schema) {
                continue;
            }
            const result = schema.safeParse(this);
            if (!result.success) {
                for (const issue of result.error.issues) {
                    failedProperties.add(issue.path.join('.') || group);
                }
            }
        }

        return { isValid: failedProperties.size === 0, failedProperties };
    }

    get [Symbol.toStringTag](): string {
        return `DomainComponent:${this.name}`;
    }

    /**
     * Assigns initial data by mirroring model values onto the component instance.
     *
     * @param newData - Initial domain data to attach.
     */
    set data(newData: DomainData) {
        const initData = initializeData(this);
        Object.entries(newData).forEach(([key, value]) => initData(value, key));
        deleteProperty(this, 'data');
    }

    /**
     * Creates a new component instance with a unique identifier.
     */
    constructor() {
        super();
        const id = ++uuid;
        defineProperty(this, 'id', {
            get: () => id,
            configurable: true,
            enumerable: false,
        });
        this.model = Object.assign(createNull(), {
            get(key: string, options: { isolate?: boolean } = {}): any {
                const value = (this as any)[key];
                return options.isolate && value && typeof value === 'object'
                    ? JSON.parse(JSON.stringify(value))
                    : value;
            },
            set(key: string, value: any): void {
                (this as any)[key] = value;
            },
        }) as any;
        this.actions = {};
        this.settings = {};
        this.states = {};
    }

    /**
     * Sets the component name after construction.
     *
     * @param name - Human-readable component name.
     */
    init(name: string): void {
        defineProperty(this, 'name', {
            get: () => name,
            configurable: true,
            enumerable: false,
        });
    }

    /**
     * Destroys the component and releases any associated resources.
     *
     * @returns A promise that resolves when destruction is complete.
     */
    async destroy(): Promise<void> {
        if (!this.destroyed) {
            this.emit('destroy');
            super.destroy(); // Emitter.destroy() → clears all listeners and sets destroyed=true
        }
    }

    /**
     * Serializes the component to a JSON-compatible object.
     *
     * @returns A JSON object containing the component identity.
     */
    toJSON(): JSONObject {
        const json = createNull();

        json.name = this.name;
        json.id = this.id;

        return json;
    }

    /**
     * Returns the component name for string coercion.
     *
     * @returns The component name.
     */
    toString(): string {
        return this.name;
    }
}
