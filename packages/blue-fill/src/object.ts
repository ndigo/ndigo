/**
 * @author Jeff Rose
 */

import fill from './fill';

const modules: Promise<any>[] = [];

fill('es5_object', function () {
    fill('object_create', () => modules.push(import('core-js/actual/object/create')));
    fill('object_defineproperty', () => modules.push(import('core-js/actual/object/define-property')));
    fill('object_defineproperties', () => modules.push(import('core-js/actual/object/define-properties')));
    fill('object_freeze', () => modules.push(import('core-js/actual/object/freeze')));
    fill('object_getownpropertydescriptor', () =>
        modules.push(import('core-js/actual/object/get-own-property-descriptor'))
    );
    fill('object_getownpropertynames', () => modules.push(import('core-js/actual/object/get-own-property-names')));
    fill('object_getprototypeof', () => modules.push(import('core-js/actual/object/get-prototype-of')));
    fill('object_isextensible', () => modules.push(import('core-js/actual/object/is-extensible')));
    fill('object_isfrozen', () => modules.push(import('core-js/actual/object/is-frozen')));
    fill('object_issealed', () => modules.push(import('core-js/actual/object/is-sealed')));
    fill('object_keys', () => modules.push(import('core-js/actual/object/keys')));
    fill('object_preventextensions', () => modules.push(import('core-js/actual/object/prevent-extensions')));
    fill('object_seal', () => modules.push(import('core-js/actual/object/seal')));
});

fill('es6_object', function () {
    fill('object_assign', () => modules.push(import('core-js/actual/object/assign')));
    fill('object_is', () => modules.push(import('core-js/actual/object/is')));
    fill('object_setprototypeof', () => modules.push(import('core-js/actual/object/set-prototype-of')));
});

fill('es8_object', function () {
    fill('object_assign', () => modules.push(import('core-js/actual/object/entries')));
    fill('object_getownpropertydescriptors', () =>
        modules.push(import('core-js/actual/object/get-own-property-descriptors'))
    );
    fill('object_values', () => modules.push(import('core-js/actual/object/values')));
});

fill('es10_object', function () {
    fill('object_fromentries', () => modules.push(import('core-js/actual/object/from-entries')));
});

export default modules.length ? Promise.all(modules) : Promise.resolve();
