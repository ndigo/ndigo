/**
 * @author Jeff Rose
 */
import { Null, likeComparator } from '@blue/core';
import { AsLevelComparator, Level } from './level';
import { newEntry } from './entry';
import { allPass } from '@blue/util/logic';
import { like } from '@blue/util/types';
const { defineProperty } = Reflect;
export class AbstractLogger extends AsLevelComparator(Null) {
    name;
    threshold;
    get [Symbol.toStringTag]() {
        return 'Logger';
    }
    constructor(name = null) {
        super();
        defineProperty(this, 'name', {
            value: name,
            configurable: false,
            enumerable: true,
            writable: true,
        });
        this.threshold = Level.ALL;
    }
    log(level, message) {
        if (this.compare(this.threshold, level) >= 0) {
            const entry = newEntry(this.name, level, message);
            this._logEntry(entry);
        }
    }
}
export const likeLogger = allPass([likeComparator, like({ threshold: Level, log: Function })]);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibG9nZ2VyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL2xvZ2dlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7R0FFRztBQUVILE9BQU8sRUFBRSxJQUFJLEVBQUUsY0FBYyxFQUFFLE1BQU0sWUFBWSxDQUFDO0FBQ2xELE9BQU8sRUFBRSxpQkFBaUIsRUFBRSxLQUFLLEVBQW1CLE1BQU0sU0FBUyxDQUFDO0FBQ3BFLE9BQU8sRUFBbUIsUUFBUSxFQUFFLE1BQU0sU0FBUyxDQUFDO0FBQ3BELE9BQU8sRUFBRSxPQUFPLEVBQUUsTUFBTSxrQkFBa0IsQ0FBQztBQUMzQyxPQUFPLEVBQUUsSUFBSSxFQUFFLE1BQU0sa0JBQWtCLENBQUM7QUFvQnhDLE1BQU0sRUFBRSxjQUFjLEVBQUUsR0FBRyxPQUFPLENBQUM7QUFFbkMsTUFBTSxPQUFnQixjQUFlLFNBQVEsaUJBQWlCLENBQUMsSUFBSSxDQUFDO0lBQ3ZELElBQUksQ0FBUztJQUN0QixTQUFTLENBQVE7SUFFakIsSUFBSSxDQUFDLE1BQU0sQ0FBQyxXQUFXLENBQUM7UUFDcEIsT0FBTyxRQUFRLENBQUM7SUFDcEIsQ0FBQztJQUVELFlBQVksT0FBZSxJQUFJO1FBQzNCLEtBQUssRUFBRSxDQUFDO1FBQ1IsY0FBYyxDQUFDLElBQUksRUFBRSxNQUFNLEVBQUU7WUFDekIsS0FBSyxFQUFFLElBQUk7WUFDWCxZQUFZLEVBQUUsS0FBSztZQUNuQixVQUFVLEVBQUUsSUFBSTtZQUNoQixRQUFRLEVBQUUsSUFBSTtTQUNqQixDQUFDLENBQUM7UUFDSCxJQUFJLENBQUMsU0FBUyxHQUFHLEtBQUssQ0FBQyxHQUFHLENBQUM7SUFDL0IsQ0FBQztJQUVELEdBQUcsQ0FBQyxLQUFZLEVBQUUsT0FBbUI7UUFDakMsSUFBSyxJQUFZLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxTQUFTLEVBQUUsS0FBSyxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUM7WUFDcEQsTUFBTSxLQUFLLEdBQVUsUUFBUSxDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUUsS0FBSyxFQUFFLE9BQU8sQ0FBQyxDQUFDO1lBRXpELElBQUksQ0FBQyxTQUFTLENBQUMsS0FBSyxDQUFDLENBQUM7UUFDMUIsQ0FBQztJQUNMLENBQUM7Q0FHSjtBQUVELE1BQU0sQ0FBQyxNQUFNLFVBQVUsR0FBRyxPQUFPLENBQUMsQ0FBQyxjQUFjLEVBQUUsSUFBSSxDQUFDLEVBQUUsU0FBUyxFQUFFLEtBQUssRUFBRSxHQUFHLEVBQUUsUUFBUSxFQUFFLENBQVEsQ0FBQyxDQUVoRixDQUFDIn0=