/**
 * @author Jeff Rose
 */
import { AbstractAppender } from '../appender';
const { defineProperty } = Reflect;
export class BrowserConsoleAppender extends AbstractAppender {
    levels;
    levelMapping;
    constructor(levelMapping = {}) {
        super();
        defineProperty(this, 'levelMapping', {
            value: levelMapping,
            configurable: true,
            enumerable: false,
            writable: false,
        });
        defineProperty(this, 'levels', {
            value: ['debug', 'error', 'info', 'warn'],
            configurable: true,
            enumerable: false,
            writable: false,
        });
    }
    append(entry) {
        this.appendMessage(entry.level, this.layout.format(entry));
    }
    appendMessage(level, message) {
        let mappedLevel = this.levelMapping[level.name];
        if (!mappedLevel) {
            mappedLevel = this.levels.indexOf(level.name) !== -1 ? level.name : 'log';
        }
        switch (mappedLevel) {
            case 'debug':
                console.debug(message);
                break;
            case 'error':
                console.error(message);
                break;
            case 'info':
                console.info(message);
                break;
            case 'warn':
                console.warn(message);
                break;
            default:
                console.log(message);
                break;
        }
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYnJvd3Nlci1jb25zb2xlLWFwcGVuZGVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL2FwcGVuZGVycy9icm93c2VyLWNvbnNvbGUtYXBwZW5kZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7O0dBRUc7QUFFSCxPQUFPLEVBQUUsZ0JBQWdCLEVBQUUsTUFBTSxhQUFhLENBQUM7QUFJL0MsTUFBTSxFQUFFLGNBQWMsRUFBRSxHQUFHLE9BQU8sQ0FBQztBQUVuQyxNQUFNLE9BQU8sc0JBQXVCLFNBQVEsZ0JBQWdCO0lBQ3JDLE1BQU0sQ0FBVztJQUMzQixZQUFZLENBQUM7SUFFdEIsWUFBWSxZQUFZLEdBQUcsRUFBRTtRQUN6QixLQUFLLEVBQUUsQ0FBQztRQUVSLGNBQWMsQ0FBQyxJQUFJLEVBQUUsY0FBYyxFQUFFO1lBQ2pDLEtBQUssRUFBRSxZQUFZO1lBQ25CLFlBQVksRUFBRSxJQUFJO1lBQ2xCLFVBQVUsRUFBRSxLQUFLO1lBQ2pCLFFBQVEsRUFBRSxLQUFLO1NBQ2xCLENBQUMsQ0FBQztRQUVILGNBQWMsQ0FBQyxJQUFJLEVBQUUsUUFBUSxFQUFFO1lBQzNCLEtBQUssRUFBRSxDQUFDLE9BQU8sRUFBRSxPQUFPLEVBQUUsTUFBTSxFQUFFLE1BQU0sQ0FBQztZQUN6QyxZQUFZLEVBQUUsSUFBSTtZQUNsQixVQUFVLEVBQUUsS0FBSztZQUNqQixRQUFRLEVBQUUsS0FBSztTQUNsQixDQUFDLENBQUM7SUFDUCxDQUFDO0lBRUQsTUFBTSxDQUFDLEtBQVk7UUFDZixJQUFJLENBQUMsYUFBYSxDQUFDLEtBQUssQ0FBQyxLQUFLLEVBQUUsSUFBSSxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQztJQUMvRCxDQUFDO0lBRUQsYUFBYSxDQUFDLEtBQVksRUFBRSxPQUFlO1FBQ3ZDLElBQUksV0FBVyxHQUFHLElBQUksQ0FBQyxZQUFZLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDO1FBRWhELElBQUksQ0FBQyxXQUFXLEVBQUUsQ0FBQztZQUNmLFdBQVcsR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQztRQUM5RSxDQUFDO1FBRUQsUUFBUSxXQUFXLEVBQUUsQ0FBQztZQUNsQixLQUFLLE9BQU87Z0JBQ1IsT0FBTyxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsQ0FBQztnQkFDdkIsTUFBTTtZQUNWLEtBQUssT0FBTztnQkFDUixPQUFPLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxDQUFDO2dCQUN2QixNQUFNO1lBQ1YsS0FBSyxNQUFNO2dCQUNQLE9BQU8sQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUM7Z0JBQ3RCLE1BQU07WUFDVixLQUFLLE1BQU07Z0JBQ1AsT0FBTyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQztnQkFDdEIsTUFBTTtZQUNWO2dCQUNJLE9BQU8sQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLENBQUM7Z0JBQ3JCLE1BQU07UUFDZCxDQUFDO0lBQ0wsQ0FBQztDQUNKIn0=