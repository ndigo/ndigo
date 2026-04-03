/**
 * @author Jeff Rose
 */
import '@tsmetadata/polyfill';
import { getSymbolMetadata } from '@blue/core';
import { CompoundModel } from '@blue/reactive';

const BIND_MODEL_METADATA_PREFIX = 'wicket:bindModel:';
const COMPOUND_MODEL_KEY = Symbol('wicket:compoundModel');

/**
 * Declares a field-level model binding for child components.
 *
 * The decorator stores metadata for reflection and registers an initializer
 * that binds the decorated child component to a property model derived from
 * the container's compound model.
 *
 * @param propertyPath - Dot-separated property path (for example, `'name'` or `'address.city'`).
 * @returns A field decorator that wires child model binding at initialization time.
 */
export function bindModel(propertyPath: string) {
    return function (value: undefined, context: ClassFieldDecoratorContext): void {
        void value;
        context.metadata[`${BIND_MODEL_METADATA_PREFIX}${String(context.name)}`] = propertyPath;

        context.addInitializer(function (this: any) {
            const child = this[context.name];
            if (child == null) {
                return;
            }

            const compoundModel: CompoundModel<unknown> =
                this[COMPOUND_MODEL_KEY] ?? (this[COMPOUND_MODEL_KEY] = new CompoundModel(this.model));

            child.model = compoundModel.getChildModel(propertyPath);
        });
    };
}

/**
 * Reads model-binding metadata for a class constructor or instance.
 *
 * @param target - Class constructor or instance.
 * @returns Map of field names to property paths.
 */
export function getModelBindings(target: any): Map<string, string> {
    const metadata = getSymbolMetadata(target);
    const bindings = new Map<string, string>();

    for (const key in metadata) {
        if (!key.startsWith(BIND_MODEL_METADATA_PREFIX)) {
            continue;
        }

        const fieldName = key.slice(BIND_MODEL_METADATA_PREFIX.length);
        const mappedPropertyPath = metadata[key];

        if (typeof mappedPropertyPath === 'string') {
            bindings.set(fieldName, mappedPropertyPath);
        }
    }

    return bindings;
}

/**
 * Checks whether any `@bindModel` bindings exist on a class or instance.
 *
 * @param target - Class constructor or instance.
 * @returns `true` when at least one model binding exists.
 */
export function hasModelBindings(target: any): boolean {
    return getModelBindings(target).size > 0;
}
