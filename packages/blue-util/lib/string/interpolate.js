/**
 * @author Jeff Rose
 * @see {@link https://ramdajs.com/docs/}
 */
import { defaultTo, path, pipe, split } from 'ramda';
const stache = /\{\{([^\}]+)\}\}/g, //mustache-like
defaultToEmptyString = defaultTo(''), splitOnDot = split('.'), interpolate = (template, replacements, syntax = stache) => {
    const replacer = (match, value) => defaultToEmptyString(path(splitOnDot(value), replacements));
    return pipe(defaultToEmptyString, (val) => val.replace(syntax, replacer))(template);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW50ZXJwb2xhdGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvc3RyaW5nL2ludGVycG9sYXRlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7R0FHRztBQUVILE9BQU8sRUFBRSxTQUFTLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxLQUFLLEVBQUUsTUFBTSxPQUFPLENBQUM7QUFFckQsTUFBTSxNQUFNLEdBQUcsbUJBQW1CLEVBQUUsZUFBZTtBQUMvQyxvQkFBb0IsR0FBRyxTQUFTLENBQUMsRUFBRSxDQUFDLEVBQ3BDLFVBQVUsR0FBRyxLQUFLLENBQUMsR0FBRyxDQUFDLEVBQ3ZCLFdBQVcsR0FBRyxDQUNWLFFBQWdCLEVBQ2hCLFlBQXFELEVBQ3JELFNBQWlCLE1BQU0sRUFDakIsRUFBRTtJQUNSLE1BQU0sUUFBUSxHQUFHLENBQUMsS0FBSyxFQUFFLEtBQUssRUFBRSxFQUFFLENBQUMsb0JBQW9CLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxLQUFLLENBQUMsRUFBRSxZQUFZLENBQUMsQ0FBVyxDQUFDO0lBQ3pHLE9BQU8sSUFBSSxDQUFDLG9CQUFvQixFQUFFLENBQUMsR0FBVyxFQUFVLEVBQUUsQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLE1BQU0sRUFBRSxRQUFRLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxDQUFDO0FBQ3hHLENBQUMsQ0FBQztBQUVOOzs7Ozs7Ozs7Ozs7Ozs7R0FlRztBQUNILGVBQWUsV0FBVyxDQUFDIn0=