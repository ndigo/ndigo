/**
 * @author Jeff Rose
 */
import { MediaTypes } from '@blue/core';
export class AbstractLayout {
    mediaType;
    constructor() {
        this.mediaType = MediaTypes.TEXT_PLAIN;
    }
}
export class AbstractBatchLayout extends AbstractLayout {
    batchFooter;
    batchHeader;
    batchSeparator;
    constructor() {
        super();
        this.batchFooter = '';
        this.batchHeader = '';
        this.batchSeparator = '';
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibGF5b3V0LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL2xheW91dC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7R0FFRztBQUdILE9BQU8sRUFBYSxVQUFVLEVBQUUsTUFBTSxZQUFZLENBQUM7QUFnQm5ELE1BQU0sT0FBZ0IsY0FBYztJQUNoQyxTQUFTLENBQVk7SUFFckI7UUFDSSxJQUFJLENBQUMsU0FBUyxHQUFHLFVBQVUsQ0FBQyxVQUFVLENBQUM7SUFDM0MsQ0FBQztDQUdKO0FBRUQsTUFBTSxPQUFnQixtQkFBb0IsU0FBUSxjQUFjO0lBQzVELFdBQVcsQ0FBUztJQUNwQixXQUFXLENBQVM7SUFDcEIsY0FBYyxDQUFTO0lBRXZCO1FBQ0ksS0FBSyxFQUFFLENBQUM7UUFDUixJQUFJLENBQUMsV0FBVyxHQUFHLEVBQUUsQ0FBQztRQUN0QixJQUFJLENBQUMsV0FBVyxHQUFHLEVBQUUsQ0FBQztRQUN0QixJQUFJLENBQUMsY0FBYyxHQUFHLEVBQUUsQ0FBQztJQUM3QixDQUFDO0NBR0oifQ==