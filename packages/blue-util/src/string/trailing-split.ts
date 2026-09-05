/**
 * Splits a string into an array of strings based on the given separator.
 * @param {string} separator
 * @param {string} text
 * @returns {Array<external:string>}
 * @category String
 * @example
 * const trailingSplitOnPipe = trailingSplit( "|" );
 * trailingSplitOnPipe( "a|b|c|" );
 * //=> [ "a", "b", "c" ]
 * trailingSplit( ",", "a,b,c," );
 * //=> [ "a", "b", "c" ]
 */
function trailingSplit(separator: string, text: string): string[];
function trailingSplit(separator: string): (text: string) => string[];
function trailingSplit(separator: string, text?: string): string[] | ((text: string) => string[]) {
    const impl = (t: string): string[] => {
        t = t.trim();

        const length = t.length;

        if (length && t.indexOf(separator) !== -1) {
            const tail = length - 1,
                isSeparatorTrailing = t[tail] === separator,
                isEmptyString = isSeparatorTrailing && t[length - 2] === separator;
            return (isSeparatorTrailing && !isEmptyString ? t.slice(0, tail) : t).split(separator);
        }

        return [t];
    };

    if (arguments.length >= 2) {
        return impl(text!);
    }
    return impl;
}

export default trailingSplit;
