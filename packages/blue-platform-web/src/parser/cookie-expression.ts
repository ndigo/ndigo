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
import { char, everyCharUntil, regex, sepByN, sequenceOf, str, takeRight } from '@blue/parser';
import { fromPairs } from '@blue/util';

const
    validCharacters = /^[^;,\s]*/,
    percentEncoded = /(%[0-9A-Za-z]{2})+/g,
    percentDecode = ( value: string ): string => value.replace( percentEncoded, decodeURIComponent ),
    equalsSign = char( '=' ),
    cookie = sequenceOf( [
        everyCharUntil( equalsSign ).map( percentDecode ),
        takeRight( equalsSign )( regex( validCharacters ) ).map( percentDecode )
    ] ),
    cookies = sepByN( 0 )( str( '; ' ) )( cookie ).map( fromPairs );

export default cookies;
