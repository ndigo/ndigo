/**
 * @author Jeff Rose
 */
import { Level } from '../level';
import { AbstractLogger } from '../logger';
const defineProperty = Reflect.defineProperty;
export class SimpleLogger extends AbstractLogger {
    appenders;
    constructor(name, appenders = []) {
        super();
        defineProperty(this, 'name', {
            value: name,
            configurable: true,
            enumerable: false,
            writable: false,
        });
        defineProperty(this, 'appenders', {
            value: appenders,
            configurable: true,
            enumerable: false,
            writable: false,
        });
        this.threshold = Level.ALL;
    }
    addAppender(appender) {
        this.appenders.push(appender);
    }
    clearAppenders() {
        let index = this.appenders.length;
        while (index--) {
            this.appenders.pop();
        }
    }
    _logEntry(entry) {
        const length = this.appenders.length;
        let index = 0;
        for (; index < length; index++) {
            this.appenders[index].append(entry);
        }
    }
    removeAppender(appender) {
        const index = this.appenders.indexOf(appender);
        if (index !== -1) {
            this.appenders.splice(index, 1);
        }
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2ltcGxlLWxvZ2dlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9sb2dnZXJzL3NpbXBsZS1sb2dnZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7O0dBRUc7QUFJSCxPQUFPLEVBQUUsS0FBSyxFQUFFLE1BQU0sVUFBVSxDQUFDO0FBQ2pDLE9BQU8sRUFBRSxjQUFjLEVBQUUsTUFBTSxXQUFXLENBQUM7QUFFM0MsTUFBTSxjQUFjLEdBQUcsT0FBTyxDQUFDLGNBQWMsQ0FBQztBQUU5QyxNQUFNLE9BQU8sWUFBYSxTQUFRLGNBQWM7SUFFbkMsU0FBUyxDQUFhO0lBRy9CLFlBQVksSUFBWSxFQUFFLFlBQXdCLEVBQUU7UUFDaEQsS0FBSyxFQUFFLENBQUM7UUFFUixjQUFjLENBQUMsSUFBSSxFQUFFLE1BQU0sRUFBRTtZQUN6QixLQUFLLEVBQUUsSUFBSTtZQUNYLFlBQVksRUFBRSxJQUFJO1lBQ2xCLFVBQVUsRUFBRSxLQUFLO1lBQ2pCLFFBQVEsRUFBRSxLQUFLO1NBQ2xCLENBQUMsQ0FBQztRQUNILGNBQWMsQ0FBQyxJQUFJLEVBQUUsV0FBVyxFQUFFO1lBQzlCLEtBQUssRUFBRSxTQUFTO1lBQ2hCLFlBQVksRUFBRSxJQUFJO1lBQ2xCLFVBQVUsRUFBRSxLQUFLO1lBQ2pCLFFBQVEsRUFBRSxLQUFLO1NBQ2xCLENBQUMsQ0FBQztRQUVILElBQUksQ0FBQyxTQUFTLEdBQUcsS0FBSyxDQUFDLEdBQUcsQ0FBQztJQUMvQixDQUFDO0lBRUQsV0FBVyxDQUFDLFFBQWtCO1FBQzFCLElBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDO0lBQ2xDLENBQUM7SUFFRCxjQUFjO1FBQ1YsSUFBSSxLQUFLLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxNQUFNLENBQUM7UUFDbEMsT0FBTyxLQUFLLEVBQUUsRUFBRSxDQUFDO1lBQ2IsSUFBSSxDQUFDLFNBQVMsQ0FBQyxHQUFHLEVBQUUsQ0FBQztRQUN6QixDQUFDO0lBQ0wsQ0FBQztJQUVTLFNBQVMsQ0FBQyxLQUFZO1FBQzVCLE1BQU0sTUFBTSxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsTUFBTSxDQUFDO1FBQ3JDLElBQUksS0FBSyxHQUFHLENBQUMsQ0FBQztRQUNkLE9BQU8sS0FBSyxHQUFHLE1BQU0sRUFBRSxLQUFLLEVBQUUsRUFBRSxDQUFDO1lBQzdCLElBQUksQ0FBQyxTQUFTLENBQUMsS0FBSyxDQUFDLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFDO1FBQ3hDLENBQUM7SUFDTCxDQUFDO0lBRUQsY0FBYyxDQUFDLFFBQWtCO1FBQzdCLE1BQU0sS0FBSyxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsT0FBTyxDQUFDLFFBQVEsQ0FBQyxDQUFDO1FBQy9DLElBQUksS0FBSyxLQUFLLENBQUMsQ0FBQyxFQUFFLENBQUM7WUFDZixJQUFJLENBQUMsU0FBUyxDQUFDLE1BQU0sQ0FBQyxLQUFLLEVBQUUsQ0FBQyxDQUFDLENBQUM7UUFDcEMsQ0FBQztJQUNMLENBQUM7Q0FDSiJ9