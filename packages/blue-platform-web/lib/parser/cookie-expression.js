/**
 * @author Jeff Rose
 * @see {@link https://stackoverflow.com/questions/1969232/allowed-characters-in-cookies}
 * @see {@link https://curl.haxx.se/rfc/cookie_spec.html}
 * @see {@link https://www.ietf.org/rfc/rfc2109.txt}
 * @see {@link https://www.ietf.org/rfc/rfc2616.txt}
 * @see {@link https://www.ietf.org/rfc/rfc2965.txt}
 * @see {@link https://www.ietf.org/rfc/rfc6265.txt}
 * @see {@link https://github.com/francisrstokes/arcsecond}
 * @see {@link https://ramdajs.com/docs/#fromPairs}
 */
import { char, everyCharUntil, regex, sepBy, sequenceOf, str, takeRight } from 'arcsecond';
import { fromPairs } from '@blue/util';
const validCharacters = /^[^;,\s]*/, percentEncoded = /(%[0-9A-Za-z]{2})+/g, percentDecode = (value) => value.replace(percentEncoded, decodeURIComponent), equalsSign = char('='), cookie = sequenceOf([
    everyCharUntil(equalsSign).map(percentDecode),
    takeRight(equalsSign)(regex(validCharacters)).map(percentDecode),
]), cookies = sepBy(str('; '))(cookie).map(fromPairs);
export default cookies;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29va2llLWV4cHJlc3Npb24uanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvcGFyc2VyL2Nvb2tpZS1leHByZXNzaW9uLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7Ozs7O0dBVUc7QUFDSCxPQUFPLEVBQVUsSUFBSSxFQUFFLGNBQWMsRUFBRSxLQUFLLEVBQUUsS0FBSyxFQUFFLFVBQVUsRUFBRSxHQUFHLEVBQUUsU0FBUyxFQUFFLE1BQU0sV0FBVyxDQUFDO0FBQ25HLE9BQU8sRUFBRSxTQUFTLEVBQUUsTUFBTSxZQUFZLENBQUM7QUFFdkMsTUFBTSxlQUFlLEdBQUcsV0FBVyxFQUMvQixjQUFjLEdBQUcscUJBQXFCLEVBQ3RDLGFBQWEsR0FBRyxDQUFDLEtBQWEsRUFBVSxFQUFFLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxjQUFjLEVBQUUsa0JBQWtCLENBQUMsRUFDNUYsVUFBVSxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsRUFDdEIsTUFBTSxHQUFHLFVBQVUsQ0FBQztJQUNoQixjQUFjLENBQUMsVUFBVSxDQUFDLENBQUMsR0FBRyxDQUFDLGFBQWEsQ0FBQztJQUM3QyxTQUFTLENBQUMsVUFBVSxDQUFDLENBQUMsS0FBSyxDQUFDLGVBQWUsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLGFBQWEsQ0FBQztDQUNuRSxDQUFDLEVBQ0YsT0FBTyxHQUFHLEtBQUssQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxHQUFHLENBQUMsU0FBZ0IsQ0FBQyxDQUFDO0FBRTdELGVBQWUsT0FBTyxDQUFDIn0=