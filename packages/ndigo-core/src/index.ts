/**
 * Core primitives, containers, and patterns for the Ndigo framework.
 */
/**
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/arguments}
 */

/**
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array}
 */

/**
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Indexed_collections}
 */

/**
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Boolean}
 * @see {@link https://developer.mozilla.org/en-US/docs/Glossary/Primitive}
 */

/**
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/BigInt}
 * @see {@link https://developer.mozilla.org/en-US/docs/Glossary/Primitive}
 */

/**
 * @see {@link https://github.com/tc39/proposal-decorators}
 * @see {@link https://codeburst.io/decorate-your-code-with-typescript-decorators-5be4a4ffecb4}
 */

/**
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date}
 */

/**
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Error}
 */

/**
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function}
 */

/**
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Iteration_protocols#The_iterable_protocol}
 */

/**
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Iteration_protocols#The_iterator_protocol}
 */

/**
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Iteration_protocols#The_iterator_protocol}
 */

/**
 * @returns
 */

/**
 * @see {@link https://github.com/tc39/proposal-decorators}
 * @see {@link https://codeburst.io/decorate-your-code-with-typescript-decorators-5be4a4ffecb4}
 */

/**
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number}
 * @see {@link https://developer.mozilla.org/en-US/docs/Glossary/Primitive}
 * @see {@link https://www.typescriptlang.org/docs/handbook/basic-types.html#number}
 */

/**
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/null}
 * @see {@link https://developer.mozilla.org/en-US/docs/Glossary/Primitive}
 * @see {@link https://www.typescriptlang.org/docs/handbook/basic-types.html#null-and-undefined}
 */

/**
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map}
 */

/**
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object}
 */

/**
 * @see {@link https://github.com/tc39/proposal-decorators}
 * @see {@link https://codeburst.io/decorate-your-code-with-typescript-decorators-5be4a4ffecb4}
 */

/**
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise}
 */

/**
 * @see {@link https://github.com/tc39/proposal-decorators}
 * @see {@link https://codeburst.io/decorate-your-code-with-typescript-decorators-5be4a4ffecb4}
 */

/**
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/defineProperty}
 */

/**
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/defineProperties}
 */

/**
 * @see {@link external#number}
 * @see {@link external#string}
 * @see {@link external#symbol}
 */

/**
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy}
 */

/**
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy/Proxy#handler_functions}
 */

/**
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/RegExp}
 */

/**
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Set}
 */

/**
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String}
 * @see {@link https://developer.mozilla.org/en-US/docs/Glossary/Primitive}
 * @see {@link https://www.typescriptlang.org/docs/handbook/basic-types.html#string}
 */

/**
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Symbol}
 * @see {@link https://developer.mozilla.org/en-US/docs/Glossary/Primitive}
 */

/**
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/undefined}
 * @see {@link https://developer.mozilla.org/en-US/docs/Glossary/Primitive}
 * @see {@link https://www.typescriptlang.org/docs/handbook/basic-types.html#null-and-undefined}
 */

/**
 * @see {@link https://www.typescriptlang.org/docs/handbook/basic-types.html#void}
 */

/**
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/WeakMap}
 */

/**
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/WeakSet}
 */

/**
 * @see {@link https://developer.mozilla.org/en-US/docs/Glossary/Global_object}
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/Window}
 */

/**
 * @see {@link https://developer.mozilla.org/en-US/docs/Glossary/Global_object}
 * @see {@link https://nodejs.org/api/globals.html#globals_global}
 */

/**
 * @see {@link https://www.typescriptlang.org/docs/handbook/utility-types.html#recordkeystype}
 */

import './ndigo.js';
import * as MediaTypes from './media-types.js';

export { MediaTypes };
export * from './ring-buffer.js';
export * from './comparable.js';
export * from './constructable.js';
export * from './data-binder.js';
export * from './enumerable.js';
export * from './equatable.js';
export * from './error.js';
export * from './feature-metric-recorder.js';
export * from './iterable.js';
export * from './matchable.js';
export * from './metadata.js';
export * from './server-sent-event.js';
export { default as MediaType, parseMediaType } from './media-type.js';
export * from './multi-value-map.js';
export * from './null.js';
export * from './path-matcher.js';
export * from './parser.js';
export * from './converter.js';
export * from './formatter.js';
export * from './primitive.js';
export * from './property-value.js';
export * from './serializable.js';
export * from './shared.js';
export * from './conditional.js';
export * from './profile.js';
export * from './profile-expression.js';
export * from './tree-node.js';
export { default as WildcardExp } from './wildcard-exp.js';
export { KeypathConverter } from './keypath-converter.js';
export { WildcardConverter } from './wildcard-converter.js';
export type { KeypathToken } from './keypath-converter.js';
export { parseUrlGlob } from './url-glob.js';
export * from './radix-tree.js';
