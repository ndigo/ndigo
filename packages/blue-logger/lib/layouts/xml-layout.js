/**
 * @author Jeff Rose
 */
import { MediaTypes } from '@blue/core';
import { NullLayout } from './null-layout';
const defineProperty = Reflect.defineProperty;
export class XMLLayout extends NullLayout {
    constructor() {
        super();
        defineProperty(this, 'mediaType', {
            value: MediaTypes.TEXT_XML,
            configurable: true,
            enumerable: false,
            writable: false,
        });
        defineProperty(this, 'batchFooter', {
            value: '',
            configurable: true,
            enumerable: false,
            writable: true,
        });
        defineProperty(this, 'batchHeader', {
            value: '',
            configurable: true,
            enumerable: false,
            writable: true,
        });
        defineProperty(this, 'batchSeparator', {
            value: '',
            configurable: true,
            enumerable: false,
            writable: true,
        });
    }
    format({ category, error, level, message, timestamp }) {
        return `${this.batchHeader}<Entry category="${category}" level="${level}" timestamp="${timestamp}">${error ? this.formatError(message[0]) : this.formatMessage(message)}</Entry>${this.batchFooter}`;
    }
    formatBatch(entries) {
        const formatted = this.formatEntries(entries);
        return `<Entries size="${entries.length}">${formatted.join(this.batchSeparator)}</Entries>`;
    }
    formatError(error) {
        // TODO escape error
        // TODO use stracktrace-js?
        return error ? `<Error name="${error.name}"><![CDATA[${error.message}]]></Error>` : '';
    }
    formatMessage(message) {
        // TODO escape message
        return `<Message><![CDATA[${message.join(' ')}]]></Message>`;
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoieG1sLWxheW91dC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9sYXlvdXRzL3htbC1sYXlvdXQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7O0dBRUc7QUFFSCxPQUFPLEVBQWEsVUFBVSxFQUFFLE1BQU0sWUFBWSxDQUFDO0FBRW5ELE9BQU8sRUFBRSxVQUFVLEVBQUUsTUFBTSxlQUFlLENBQUM7QUFFM0MsTUFBTSxjQUFjLEdBQUcsT0FBTyxDQUFDLGNBQWMsQ0FBQztBQUU5QyxNQUFNLE9BQU8sU0FBVSxTQUFRLFVBQVU7SUFNckM7UUFDSSxLQUFLLEVBQUUsQ0FBQztRQUVSLGNBQWMsQ0FBQyxJQUFJLEVBQUUsV0FBVyxFQUFFO1lBQzlCLEtBQUssRUFBRSxVQUFVLENBQUMsUUFBUTtZQUMxQixZQUFZLEVBQUUsSUFBSTtZQUNsQixVQUFVLEVBQUUsS0FBSztZQUNqQixRQUFRLEVBQUUsS0FBSztTQUNsQixDQUFDLENBQUM7UUFDSCxjQUFjLENBQUMsSUFBSSxFQUFFLGFBQWEsRUFBRTtZQUNoQyxLQUFLLEVBQUUsRUFBRTtZQUNULFlBQVksRUFBRSxJQUFJO1lBQ2xCLFVBQVUsRUFBRSxLQUFLO1lBQ2pCLFFBQVEsRUFBRSxJQUFJO1NBQ2pCLENBQUMsQ0FBQztRQUNILGNBQWMsQ0FBQyxJQUFJLEVBQUUsYUFBYSxFQUFFO1lBQ2hDLEtBQUssRUFBRSxFQUFFO1lBQ1QsWUFBWSxFQUFFLElBQUk7WUFDbEIsVUFBVSxFQUFFLEtBQUs7WUFDakIsUUFBUSxFQUFFLElBQUk7U0FDakIsQ0FBQyxDQUFDO1FBQ0gsY0FBYyxDQUFDLElBQUksRUFBRSxnQkFBZ0IsRUFBRTtZQUNuQyxLQUFLLEVBQUUsRUFBRTtZQUNULFlBQVksRUFBRSxJQUFJO1lBQ2xCLFVBQVUsRUFBRSxLQUFLO1lBQ2pCLFFBQVEsRUFBRSxJQUFJO1NBQ2pCLENBQUMsQ0FBQztJQUNQLENBQUM7SUFFRCxNQUFNLENBQUMsRUFBRSxRQUFRLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRSxPQUFPLEVBQUUsU0FBUyxFQUFTO1FBQ3hELE9BQU8sR0FBRyxJQUFJLENBQUMsV0FBVyxvQkFBb0IsUUFBUSxZQUFZLEtBQUssZ0JBQWdCLFNBQVMsS0FBSyxLQUFLLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBVSxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxhQUFhLENBQUMsT0FBTyxDQUFDLFdBQVcsSUFBSSxDQUFDLFdBQVcsRUFBRSxDQUFDO0lBQ2xOLENBQUM7SUFFRCxXQUFXLENBQUMsT0FBZ0I7UUFDeEIsTUFBTSxTQUFTLEdBQWEsSUFBSSxDQUFDLGFBQWEsQ0FBQyxPQUFPLENBQUMsQ0FBQztRQUN4RCxPQUFPLGtCQUFrQixPQUFPLENBQUMsTUFBTSxLQUFLLFNBQVMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLGNBQWMsQ0FBQyxZQUFZLENBQUM7SUFDaEcsQ0FBQztJQUVELFdBQVcsQ0FBQyxLQUFhO1FBQ3JCLG9CQUFvQjtRQUNwQiwyQkFBMkI7UUFDM0IsT0FBTyxLQUFLLENBQUMsQ0FBQyxDQUFDLGdCQUFnQixLQUFLLENBQUMsSUFBSSxjQUFjLEtBQUssQ0FBQyxPQUFPLGFBQWEsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDO0lBQzNGLENBQUM7SUFFRCxhQUFhLENBQUMsT0FBbUI7UUFDN0Isc0JBQXNCO1FBQ3RCLE9BQU8scUJBQXFCLE9BQU8sQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLGVBQWUsQ0FBQztJQUNqRSxDQUFDO0NBQ0oifQ==