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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYnJvd3Nlci1jb25zb2xlLWFwcGVuZGVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiYnJvd3Nlci1jb25zb2xlLWFwcGVuZGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOztHQUVHO0FBRUgsT0FBTyxFQUFFLGdCQUFnQixFQUFFLE1BQU0sYUFBYSxDQUFDO0FBSS9DLE1BQU0sRUFBRSxjQUFjLEVBQUUsR0FBRyxPQUFPLENBQUM7QUFFbkMsTUFBTSxPQUFPLHNCQUF1QixTQUFRLGdCQUFnQjtJQUNyQyxNQUFNLENBQVc7SUFDM0IsWUFBWSxDQUFDO0lBRXRCLFlBQVksWUFBWSxHQUFHLEVBQUU7UUFDekIsS0FBSyxFQUFFLENBQUM7UUFFUixjQUFjLENBQUMsSUFBSSxFQUFFLGNBQWMsRUFBRTtZQUNqQyxLQUFLLEVBQUUsWUFBWTtZQUNuQixZQUFZLEVBQUUsSUFBSTtZQUNsQixVQUFVLEVBQUUsS0FBSztZQUNqQixRQUFRLEVBQUUsS0FBSztTQUNsQixDQUFDLENBQUM7UUFFSCxjQUFjLENBQUMsSUFBSSxFQUFFLFFBQVEsRUFBRTtZQUMzQixLQUFLLEVBQUUsQ0FBQyxPQUFPLEVBQUUsT0FBTyxFQUFFLE1BQU0sRUFBRSxNQUFNLENBQUM7WUFDekMsWUFBWSxFQUFFLElBQUk7WUFDbEIsVUFBVSxFQUFFLEtBQUs7WUFDakIsUUFBUSxFQUFFLEtBQUs7U0FDbEIsQ0FBQyxDQUFDO0lBQ1AsQ0FBQztJQUVELE1BQU0sQ0FBQyxLQUFZO1FBQ2YsSUFBSSxDQUFDLGFBQWEsQ0FBQyxLQUFLLENBQUMsS0FBSyxFQUFFLElBQUksQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUM7SUFDL0QsQ0FBQztJQUVELGFBQWEsQ0FBQyxLQUFZLEVBQUUsT0FBZTtRQUN2QyxJQUFJLFdBQVcsR0FBRyxJQUFJLENBQUMsWUFBWSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUVoRCxJQUFJLENBQUMsV0FBVyxFQUFFLENBQUM7WUFDZixXQUFXLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUM7UUFDOUUsQ0FBQztRQUVELFFBQVEsV0FBVyxFQUFFLENBQUM7WUFDbEIsS0FBSyxPQUFPO2dCQUNSLE9BQU8sQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLENBQUM7Z0JBQ3ZCLE1BQU07WUFDVixLQUFLLE9BQU87Z0JBQ1IsT0FBTyxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsQ0FBQztnQkFDdkIsTUFBTTtZQUNWLEtBQUssTUFBTTtnQkFDUCxPQUFPLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDO2dCQUN0QixNQUFNO1lBQ1YsS0FBSyxNQUFNO2dCQUNQLE9BQU8sQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUM7Z0JBQ3RCLE1BQU07WUFDVjtnQkFDSSxPQUFPLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxDQUFDO2dCQUNyQixNQUFNO1FBQ2QsQ0FBQztJQUNMLENBQUM7Q0FDSiJ9