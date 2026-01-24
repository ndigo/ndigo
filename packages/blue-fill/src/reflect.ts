/**
 * @author Jeff Rose
 */

import fill from './fill';

const modules: Promise<any>[] = [];

fill(
    'reflect',
    () => modules.push(import('core-js/actual/reflect/index')),
    function () {
        fill('reflect_apply', () => modules.push(import('core-js/actual/reflect/apply')));
        fill('reflect_construct', () => modules.push(import('core-js/actual/reflect/construct')));
        fill('reflect_defineproperty', () => modules.push(import('core-js/actual/reflect/define-property')));
        fill('reflect_deleteproperty', () => modules.push(import('core-js/actual/reflect/delete-property')));
        fill('reflect_get', () => modules.push(import('core-js/actual/reflect/get')));
        fill('reflect_getownpropertydescriptor', () =>
            modules.push(import('core-js/actual/reflect/get-own-property-descriptor'))
        );
        fill('reflect_getprototypeof', () => modules.push(import('core-js/actual/reflect/get-prototype-of')));
        fill('reflect_has', () => modules.push(import('core-js/actual/reflect/has')));
        fill('reflect_isextensible', () => modules.push(import('core-js/actual/reflect/is-extensible')));
        fill('reflect_ownkeys', () => modules.push(import('core-js/actual/reflect/own-keys')));
        fill('reflect_preventextensions', () => modules.push(import('core-js/actual/reflect/prevent-extensions')));
        fill('reflect_set', () => modules.push(import('core-js/actual/reflect/set')));
        fill('reflect_setprototypeof', () => modules.push(import('core-js/actual/reflect/set-prototype-of')));
    }
);

// @ts-ignore: ¯\_(ツ)_/¯
fill('reflect_metadata_api', () => modules.push(import('../node_modules/reflect-metadata/Reflect')));

export default modules.length ? Promise.all(modules) : Promise.resolve();
