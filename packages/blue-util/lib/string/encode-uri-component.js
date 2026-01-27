/**
 * @author Jeff Rose
 * @see {@link https://github.com/kevva/strict-uri-encode}
 * @see {@link https://tools.ietf.org/html/rfc3986}
 */
const charMatcher = /[!'()*]/g, hexEncode = (value) => `%${value.charCodeAt(0).toString(16).toUpperCase()}`, strictEncodeURIComponent = (value) => encodeURIComponent(value).replace(charMatcher, hexEncode);
/**
 * A stricter URI encode adhering to {@link https://tools.ietf.org/html/rfc3986|RFC 3986}
 * @param {string} value A string value
 * @returns {string} The encoded string
 * @example
 * encodeURIComponent( 'unicorn!foobar' );
 * //=> 'unicorn%21foobar'
 * encodeURIComponent( 'unicorn*foobar' );
 * //=> 'unicorn%2Afoobar'
 * @category String
 */
export default strictEncodeURIComponent;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZW5jb2RlLXVyaS1jb21wb25lbnQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvc3RyaW5nL2VuY29kZS11cmktY29tcG9uZW50LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7O0dBSUc7QUFFSCxNQUFNLFdBQVcsR0FBRyxVQUFVLEVBQzFCLFNBQVMsR0FBRyxDQUFDLEtBQWEsRUFBVSxFQUFFLENBQUMsSUFBSSxLQUFLLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxFQUFFLENBQUMsQ0FBQyxXQUFXLEVBQUUsRUFBRSxFQUMzRix3QkFBd0IsR0FBRyxDQUFDLEtBQWEsRUFBVSxFQUFFLENBQUMsa0JBQWtCLENBQUMsS0FBSyxDQUFDLENBQUMsT0FBTyxDQUFDLFdBQVcsRUFBRSxTQUFTLENBQUMsQ0FBQztBQUVwSDs7Ozs7Ozs7OztHQVVHO0FBQ0gsZUFBZSx3QkFBd0IsQ0FBQyJ9