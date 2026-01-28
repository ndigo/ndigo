/**
 * @author Jeff Rose
 */
import { AbstractLayout } from '../layout';
import { format } from 'date-fns';
const { defineProperty } = Reflect, regex = /%(-?[0-9]+)?(\.?[0-9]+)?([cdmnp%])(\{([^\}]+)\})?|([^%]+)/;
export class PatternLayout extends AbstractLayout {
    pattern;
    newline;
    categorySeparator;
    constructor(pattern) {
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
    format({ category, level, message, timestamp }) {
        let formatted = '', searchString = this.pattern, result;
        while ((result = regex.exec(searchString))) {
            const matchedString = result[0], padding = result[1], truncation = result[2], conversionCharacter = result[3], specifier = result[5], text = result[6];
            // Check if the pattern matched was just normal text
            if (text) {
                formatted += '' + text;
            }
            else {
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
                            const precision = parseInt(specifier, 10), parts = category.split(categorySeparator);
                            replacement =
                                precision >= parts.length
                                    ? loggerName
                                    : parts.slice(parts.length - precision).join(categorySeparator);
                        }
                        else {
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
                let l;
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
                    }
                    else {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGF0dGVybi1sYXlvdXQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJwYXR0ZXJuLWxheW91dC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7R0FFRztBQUdILE9BQU8sRUFBRSxjQUFjLEVBQUUsTUFBTSxXQUFXLENBQUM7QUFDM0MsT0FBTyxFQUFFLE1BQU0sRUFBRSxNQUFNLFVBQVUsQ0FBQztBQUVsQyxNQUFNLEVBQUUsY0FBYyxFQUFFLEdBQUcsT0FBTyxFQUM5QixLQUFLLEdBQUcsMkRBQTJELENBQUM7QUFFeEUsTUFBTSxPQUFPLGFBQWMsU0FBUSxjQUFjO0lBQ3BDLE9BQU8sQ0FBUztJQUN6QixPQUFPLENBQVM7SUFDaEIsaUJBQWlCLENBQVM7SUFFMUIsWUFBWSxPQUFlO1FBQ3ZCLEtBQUssRUFBRSxDQUFDO1FBRVIsY0FBYyxDQUFDLElBQUksRUFBRSxTQUFTLEVBQUU7WUFDNUIsS0FBSyxFQUFFLE9BQU87WUFDZCxZQUFZLEVBQUUsSUFBSTtZQUNsQixVQUFVLEVBQUUsS0FBSztZQUNqQixRQUFRLEVBQUUsS0FBSztTQUNsQixDQUFDLENBQUM7UUFDSCxjQUFjLENBQUMsSUFBSSxFQUFFLG1CQUFtQixFQUFFO1lBQ3RDLEtBQUssRUFBRSxHQUFHO1lBQ1YsWUFBWSxFQUFFLElBQUk7WUFDbEIsVUFBVSxFQUFFLEtBQUs7WUFDakIsUUFBUSxFQUFFLElBQUk7U0FDakIsQ0FBQyxDQUFDO1FBQ0gsY0FBYyxDQUFDLElBQUksRUFBRSxTQUFTLEVBQUU7WUFDNUIsS0FBSyxFQUFFLE1BQU07WUFDYixZQUFZLEVBQUUsSUFBSTtZQUNsQixVQUFVLEVBQUUsS0FBSztZQUNqQixRQUFRLEVBQUUsSUFBSTtTQUNqQixDQUFDLENBQUM7SUFDUCxDQUFDO0lBRUQsTUFBTSxDQUFDLEVBQUUsUUFBUSxFQUFFLEtBQUssRUFBRSxPQUFPLEVBQUUsU0FBUyxFQUFTO1FBQ2pELElBQUksU0FBUyxHQUFHLEVBQUUsRUFDZCxZQUFZLEdBQUcs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