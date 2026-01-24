/**
 * @author Jeff Rose
 */
import { createNull } from '@blue/core';
import cookieExpression from './parser/cookie-expression';
const { assign } = Object;
function init(converter) {
    const api = createNull();
    function set(key, value, attributes) {
        if (typeof document === 'undefined') {
            return;
        }
        attributes = assign({ path: '/' }, api.defaults, attributes);
        if (typeof attributes.expires === 'number') {
            attributes.expires = new Date(Date.now() * 1 + attributes.expires * 864e5);
        }
        // We're using "expires" because "max-age" is not supported by IE
        attributes.expires = attributes.expires ? attributes.expires.toUTCString() : '';
        try {
            const result = JSON.stringify(value);
            if (/^[\{\[]/.test(result)) {
                value = result;
            }
        }
        catch (e) { }
        value = converter.write
            ? converter.write(value, key)
            : encodeURIComponent(String(value)).replace(/%(23|24|26|2B|3A|3C|3E|3D|2F|3F|40|5B|5D|5E|60|7B|7D|7C)/g, decodeURIComponent);
        key = encodeURIComponent(String(key))
            .replace(/%(23|24|26|2B|5E|60|7C)/g, decodeURIComponent)
            .replace(/[\(\)]/g, escape);
        let stringifiedAttributes = '';
        for (const attributeName in attributes) {
            if (!attributes[attributeName]) {
                continue;
            }
            stringifiedAttributes += '; ' + attributeName;
            if (attributes[attributeName] === true) {
                continue;
            }
            // Considers RFC 6265 section 5.2:
            // ...
            // 3.  If the remaining unparsed-attributes contains a %x3B (";")
            //     character:
            // Consume the characters of the unparsed-attributes up to,
            // not including, the first %x3B (";") character.
            // ...
            stringifiedAttributes += '=' + attributes[attributeName].split(' ;')[0];
        }
        return (document.cookie = key + '=' + value + stringifiedAttributes);
    }
    function get(key, json) {
        const jar = cookieExpression.run(document.cookie);
        return key ? (json ? JSON.parse(jar[key]) : jar[key]) : jar;
    }
    api.set = set;
    api.get = (key) => get(key, false /* read as raw */);
    api.getJSON = (key) => get(key, true /* read as json */);
    api.remove = (key, attributes) => set(key, '', assign(attributes, { expires: -1 }));
    api.defaults = {};
    api.withConverter = init;
    return api;
}
export default init(function () { });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29va2llcy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NyYy9jb29raWVzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOztHQUVHO0FBRUgsT0FBTyxFQUFFLFVBQVUsRUFBeUIsTUFBTSxZQUFZLENBQUM7QUFDL0QsT0FBTyxnQkFBZ0IsTUFBTSw0QkFBNEIsQ0FBQztBQW9CMUQsTUFBTSxFQUFFLE1BQU0sRUFBRSxHQUFHLE1BQU0sQ0FBQztBQUUxQixTQUFTLElBQUksQ0FBQyxTQUFTO0lBQ25CLE1BQU0sR0FBRyxHQUFHLFVBQVUsRUFBRSxDQUFDO0lBRXpCLFNBQVMsR0FBRyxDQUFDLEdBQVcsRUFBRSxLQUFhLEVBQUUsVUFBVTtRQUMvQyxJQUFJLE9BQU8sUUFBUSxLQUFLLFdBQVcsRUFBRSxDQUFDO1lBQ2xDLE9BQU87UUFDWCxDQUFDO1FBRUQsVUFBVSxHQUFHLE1BQU0sQ0FBQyxFQUFFLElBQUksRUFBRSxHQUFHLEVBQUUsRUFBRSxHQUFHLENBQUMsUUFBUSxFQUFFLFVBQVUsQ0FBQyxDQUFDO1FBRTdELElBQUksT0FBTyxVQUFVLENBQUMsT0FBTyxLQUFLLFFBQVEsRUFBRSxDQUFDO1lBQ3pDLFVBQVUsQ0FBQyxPQUFPLEdBQUcsSUFBSSxJQUFJLENBQUMsSUFBSSxDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUMsR0FBRyxVQUFVLENBQUMsT0FBTyxHQUFHLEtBQUssQ0FBQyxDQUFDO1FBQy9FLENBQUM7UUFFRCxpRUFBaUU7UUFDakUsVUFBVSxDQUFDLE9BQU8sR0FBRyxVQUFVLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxVQUFVLENBQUMsT0FBTyxDQUFDLFdBQVcsRUFBRSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUM7UUFFaEYsSUFBSSxDQUFDO1lBQ0QsTUFBTSxNQUFNLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxLQUFLLENBQUMsQ0FBQztZQUNyQyxJQUFJLFNBQVMsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFD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