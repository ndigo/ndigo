/**
 * @author Jeff Rose
 */
import { createNull, MediaTypes } from '@blue/core';
import { NullLayout } from './null-layout';
const defineProperty = Reflect.defineProperty;
export class JSONLayout extends NullLayout {
    constructor() {
        super();
        defineProperty(this, 'mediaType', {
            value: MediaTypes.APPLICATION_JSON,
            configurable: true,
            enumerable: false,
            writable: false,
        });
        defineProperty(this, 'batchFooter', {
            value: ']',
            configurable: true,
            enumerable: false,
            writable: false,
        });
        defineProperty(this, 'batchHeader', {
            value: '[',
            configurable: true,
            enumerable: false,
            writable: false,
        });
        defineProperty(this, 'batchSeparator', {
            value: ',',
            configurable: true,
            enumerable: false,
            writable: false,
        });
    }
    format(entry) {
        const formatted = Object.assign(createNull(), entry);
        formatted.message = entry.message.join(' ');
        return JSON.stringify(formatted);
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoianNvbi1sYXlvdXQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvbGF5b3V0cy9qc29uLWxheW91dC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7R0FFRztBQUVILE9BQU8sRUFBRSxVQUFVLEVBQWEsVUFBVSxFQUFjLE1BQU0sWUFBWSxDQUFDO0FBRTNFLE9BQU8sRUFBRSxVQUFVLEVBQUUsTUFBTSxlQUFlLENBQUM7QUFFM0MsTUFBTSxjQUFjLEdBQUcsT0FBTyxDQUFDLGNBQWMsQ0FBQztBQUU5QyxNQUFNLE9BQU8sVUFBVyxTQUFRLFVBQVU7SUFNdEM7UUFDSSxLQUFLLEVBQUUsQ0FBQztRQUVSLGNBQWMsQ0FBQyxJQUFJLEVBQUUsV0FBVyxFQUFFO1lBQzlCLEtBQUssRUFBRSxVQUFVLENBQUMsZ0JBQWdCO1lBQ2xDLFlBQVksRUFBRSxJQUFJO1lBQ2xCLFVBQVUsRUFBRSxLQUFLO1lBQ2pCLFFBQVEsRUFBRSxLQUFLO1NBQ2xCLENBQUMsQ0FBQztRQUNILGNBQWMsQ0FBQyxJQUFJLEVBQUUsYUFBYSxFQUFFO1lBQ2hDLEtBQUssRUFBRSxHQUFHO1lBQ1YsWUFBWSxFQUFFLElBQUk7WUFDbEIsVUFBVSxFQUFFLEtBQUs7WUFDakIsUUFBUSxFQUFFLEtBQUs7U0FDbEIsQ0FBQyxDQUFDO1FBQ0gsY0FBYyxDQUFDLElBQUksRUFBRSxhQUFhLEVBQUU7WUFDaEMsS0FBSyxFQUFFLEdBQUc7WUFDVixZQUFZLEVBQUUsSUFBSTtZQUNsQixVQUFVLEVBQUUsS0FBSztZQUNqQixRQUFRLEVBQUUsS0FBSztTQUNsQixDQUFDLENBQUM7UUFDSCxjQUFjLENBQUMsSUFBSSxFQUFFLGdCQUFnQixFQUFFO1lBQ25DLEtBQUssRUFBRSxHQUFHO1lBQ1YsWUFBWSxFQUFFLElBQUk7WUFDbEIsVUFBVSxFQUFFLEtBQUs7WUFDakIsUUFBUSxFQUFFLEtBQUs7U0FDbEIsQ0FBQyxDQUFDO0lBQ1AsQ0FBQztJQUVELE1BQU0sQ0FBQyxLQUFZO1FBQ2YsTUFBTSxTQUFTLEdBQWUsTUFBTSxDQUFDLE1BQU0sQ0FBQyxVQUFVLEVBQUUsRUFBRSxLQUFLLENBQUMsQ0FBQztRQUNqRSxTQUFTLENBQUMsT0FBTyxHQUFHLEtBQUssQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBQzVDLE9BQU8sSUFBSSxDQUFDLFNBQVMsQ0FBQyxTQUFTLENBQUMsQ0FBQztJQUNyQyxDQUFDO0NBQ0oifQ==