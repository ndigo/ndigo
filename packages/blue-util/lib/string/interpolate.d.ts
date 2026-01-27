/**
 * @author Jeff Rose
 * @see {@link https://ramdajs.com/docs/}
 */
declare const interpolate: (template: string, replacements: string | any[] | {
    [key: string]: any;
}, syntax?: RegExp) => string;
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
//# sourceMappingURL=interpolate.d.ts.map