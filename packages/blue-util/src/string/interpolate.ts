/**
 * @author Jeff Rose
 * @see {@link https://ramdajs.com/docs/}
 */

import { defaultTo, path, pipe, split } from 'ramda';

const stache = /\{\{([^\}]+)\}\}/g, //mustache-like
    defaultToEmptyString = defaultTo(''),
    splitOnDot = split('.'),
    interpolate = (
        template: string,
        replacements: string | any[] | { [key: string]: any },
        syntax: RegExp = stache
    ): string => {
        const replacer = (match: string, value: string) => defaultToEmptyString(path(splitOnDot(value), replacements)) as string;
        return pipe(defaultToEmptyString, (val: string): string => val.replace(syntax, replacer))(template);
    };

/**
 * String interpolation. Format/replace tokens with object properties.
 * @param {string} template
 * @param {Object} replacements
 * @param {string} [syntax]
 * @returns {string}
 * @example
 * let tmpl;
 *
 * tmpl = 'Hello {{name}}!';
 * interpolate( tmpl, { name: 'World' } );       // "Hello World!"
 * interpolate( tmpl, { name: 'Lorem Ipsum' } ); // "Hello Lorem Ipsum!"
 *
 * tmpl = 'Hello {{name.first}}!';
 * interpolate( tmpl, { name: { first: 'Lorem' } } ); // "Hello Lorem!"
 */
export default interpolate;
