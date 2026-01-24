/**
 * @author Jeff Rose
 */
import { createNull, MediaTypes } from '@blue/core';
import { toQueryString } from '@blue/router';
import { NullLayout } from '@blue/logger';
export class HTTPPostLayout extends NullLayout {
    constructor() {
        super();
        Reflect.defineProperty(this, 'mediaType', {
            value: MediaTypes.MULTIPART_FORM_DATA,
            configurable: true,
            enumerable: false,
            writable: false,
        });
    }
    format(entry) {
        const data = createNull();
        data.category = entry.category;
        data.level = entry.level.toString();
        data.message = entry.message.join(' ');
        data.timestamp = entry.timestamp;
        if (entry.error) {
            const error = entry.message[0];
            data.errorName = error.name;
            data.errorMessage = error.message;
        }
        return toQueryString(data);
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaHR0cC1wb3N0LWxheW91dC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9sb2dnZXIvaHR0cC1wb3N0LWxheW91dC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7R0FFRztBQUVILE9BQU8sRUFBRSxVQUFVLEVBQWEsVUFBVSxFQUFjLE1BQU0sWUFBWSxDQUFDO0FBQzNFLE9BQU8sRUFBRSxhQUFhLEVBQUUsTUFBTSxjQUFjLENBQUM7QUFDN0MsT0FBTyxFQUFTLFVBQVUsRUFBRSxNQUFNLGNBQWMsQ0FBQztBQUVqRCxNQUFNLE9BQU8sY0FBZSxTQUFRLFVBQVU7SUFHMUM7UUFDSSxLQUFLLEVBQUUsQ0FBQztRQUVSLE9BQU8sQ0FBQyxjQUFjLENBQUMsSUFBSSxFQUFFLFdBQVcsRUFBRTtZQUN0QyxLQUFLLEVBQUUsVUFBVSxDQUFDLG1CQUFtQjtZQUNyQyxZQUFZLEVBQUUsSUFBSTtZQUNsQixVQUFVLEVBQUUsS0FBSztZQUNqQixRQUFRLEVBQUUsS0FBSztTQUNsQixDQUFDLENBQUM7SUFDUCxDQUFDO0lBRUQsTUFBTSxDQUFDLEtBQVk7UUFDZixNQUFNLElBQUksR0FBZSxVQUFVLEVBQUUsQ0FBQztRQUV0QyxJQUFJLENBQUMsUUFBUSxHQUFHLEtBQUssQ0FBQyxRQUFRLENBQUM7UUFDL0IsSUFBSSxDQUFDLEtBQUssR0FBRyxLQUFLLENBQUMsS0FBSyxDQUFDLFFBQVEsRUFBRSxDQUFDO1FBQ3BDLElBQUksQ0FBQyxPQUFPLEdBQUcsS0FBSyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUM7UUFDdkMsSUFBSSxDQUFDLFNBQVMsR0FBRyxLQUFLLENBQUMsU0FBUyxDQUFDO1FBRWpDLElBQUksS0FBSyxDQUFDLEtBQUssRUFBRSxDQUFDO1lBQ2QsTUFBTSxLQUFLLEdBQUcsS0FBSyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQVUsQ0FBQztZQUN4QyxJQUFJLENBQUMsU0FBUyxHQUFHLEtBQUssQ0FBQyxJQUFJLENBQUM7WUFDNUIsSUFBSSxDQUFDLFlBQVksR0FBRyxLQUFLLENBQUMsT0FBTyxDQUFDO1FBQ3RDLENBQUM7UUFFRCxPQUFPLGFBQWEsQ0FBQyxJQUFJLENBQUMsQ0FBQztJQUMvQixDQUFDO0NBQ0oifQ==