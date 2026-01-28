/**
 * @author Jeff Rose
 */
import { AbstractBatchLayout } from '../layout';
export class NullLayout extends AbstractBatchLayout {
    constructor() {
        super();
        Reflect.defineProperty(this, 'batchSeparator', {
            value: ',',
            configurable: true,
            enumerable: false,
            writable: true,
        });
    }
    format(entry) {
        return entry.message.join(' ');
    }
    formatBatch(entries) {
        const formatted = this.formatEntries(entries);
        return `${this.batchHeader}${formatted.join(this.batchSeparator)}${this.batchFooter}`;
    }
    formatEntries(entries) {
        const length = entries.length, formatted = new Array(length);
        let index = 0;
        for (; index < length; index++) {
            formatted[index] = this.format(entries[index]);
        }
        return formatted;
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibnVsbC1sYXlvdXQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJudWxsLWxheW91dC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7R0FFRztBQUdILE9BQU8sRUFBRSxtQkFBbUIsRUFBRSxNQUFNLFdBQVcsQ0FBQztBQUVoRCxNQUFNLE9BQU8sVUFBVyxTQUFRLG1CQUFtQjtJQUcvQztRQUNJLEtBQUssRUFBRSxDQUFDO1FBRVIsT0FBTyxDQUFDLGNBQWMsQ0FBQyxJQUFJLEVBQUUsZ0JBQWdCLEVBQUU7WUFDM0MsS0FBSyxFQUFFLEdBQUc7WUFDVixZQUFZLEVBQUUsSUFBSTtZQUNsQixVQUFVLEVBQUUsS0FBSztZQUNqQixRQUFRLEVBQUUsSUFBSTtTQUNqQixDQUFDLENBQUM7SUFDUCxDQUFDO0lBRUQsTUFBTSxDQUFDLEtBQVk7UUFDZixPQUFPLEtBQUssQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDO0lBQ25DLENBQUM7SUFFRCxXQUFXLENBQUMsT0FBZ0I7UUFDeEIsTUFBTSxTQUFTLEdBQUcsSUFBSSxDQUFDLGFBQWEsQ0FBQyxPQUFPLENBQUMsQ0FBQztRQUM5QyxPQUFPLEdBQUcsSUFBSSxDQUFDLFdBQVcsR0FBRyxTQUFTLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxjQUFjLENBQUMsR0FBRyxJQUFJLENBQUMsV0FBVyxFQUFFLENBQUM7SUFDMUYsQ0FBQztJQUVTLGFBQWEsQ0FBQyxPQUFnQjtRQUNwQyxNQUFNLE1BQU0sR0FBRyxPQUFPLENBQUMsTUFBTSxFQUN6QixTQUFTLEdBQWEsSUFBSSxLQUFLLENBQUMsTUFBTSxDQUFDLENBQUM7UUFDNUMsSUFBSSxLQUFLLEdBQUcsQ0FBQyxDQUFDO1FBRWQsT0FBTyxLQUFLLEdBQUcsTUFBTSxFQUFFLEtBQUssRUFBRSxFQUFFLENBQUM7WUFDN0IsU0FBUyxDQUFDLEtBQUssQ0FBQyxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUM7UUFDbkQsQ0FBQztRQUVELE9BQU8sU0FBUyxDQUFDO0lBQ3JCLENBQUM7Q0FDSiJ9