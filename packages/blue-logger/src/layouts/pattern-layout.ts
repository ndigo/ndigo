/**
 * @author Jeff Rose
 */

import { Entry } from '../entry';
import { AbstractLayout } from '../layout';
import { format } from '@blue/util/date';

const { defineProperty } = Reflect,
    regex = /%(-?[0-9]+)?(\.?[0-9]+)?([cdmnp%])(\{([^\}]+)\})?|([^%]+)/;

export class PatternLayout extends AbstractLayout {
    readonly pattern: string;
    newline: string;
    categorySeparator: string;

    constructor(pattern: string) {
        super();

        defineProperty(this, 'pattern', {
            value: pattern,
            configurable: true,
            enumerable: false,
            writable: false,
        });
        defineProperty(this, 'categorySeparator', {
            value: '.',
            configurable: true,
            enumerable: false,
            writable: true,
        });
        defineProperty(this, 'newline', {
            value: '\r\n',
            configurable: true,
            enumerable: false,
            writable: true,
        });
    }

    format({ category, level, message, timestamp }: Entry): string {
        let formatted = '',
            searchString = this.pattern,
            result: RegExpExecArray;

        while ((result = regex.exec(searchString))) {
            const matchedString = result[0],
                padding = result[1],
                truncation = result[2],
                conversionCharacter = result[3],
                specifier = result[5],
                text = result[6];

            // Check if the pattern matched was just normal text
            if (text) {
                formatted += '' + text;
            } else {
                const { categorySeparator, newline } = this;

                // Create a raw replacement string based on the conversion
                // character and specifier
                let replacement = '';

                switch (conversionCharacter) {
                    case 'm': // Message
                        replacement = message.join(' ');
                        break;
                    case 'c': // Category
                        const loggerName = category;
                        if (specifier) {
                            const precision = parseInt(specifier, 10),
                                parts = category.split(categorySeparator);
                            replacement =
                                precision >= parts.length
                                    ? loggerName
                                    : parts.slice(parts.length - precision).join(categorySeparator);
                        } else {
                            replacement = loggerName;
                        }
                        break;
                    case 'd': // Date
                        replacement = format(new Date(timestamp), specifier || 'yyyy-MM-dd HH:mm:ss');
                        break;
                    case 'n': // New line
                        replacement = newline;
                        break;
                    case 'p': // Level
                        replacement = level.name;
                        break;
                    case '%': // Literal % signs
                        replacement = '%';
                        break;
                    default: // Should only happen if a new directive is added to the regex but not added to the case statement
                        replacement = matchedString;
                        break;
                }
                // Format the replacement according to any padding or
                // truncation specified
                let l: number;

                // Truncation
                if (truncation) {
                    l = parseInt(truncation.substr(1), 10);
                    const strLen = replacement.length;
                    if (l < strLen) {
                        replacement = replacement.substring(strLen - l, strLen);
                    }
                }

                // Padding
                if (padding) {
                    // Right padding
                    if (padding[0] === '-') {
                        l = parseInt(padding.substr(1), 10);
                        while (replacement.length < l) {
                            replacement += ' ';
                        }
                        // Left padding
                    } else {
                        l = parseInt(padding, 10);
                        while (replacement.length < l) {
                            replacement = ' ' + replacement;
                        }
                    }
                }

                formatted += replacement;
            }

            searchString = searchString.substr(result.index + result[0].length);
        }

        return formatted;
    }
}
