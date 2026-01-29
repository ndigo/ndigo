/**
 * @author Jeff Rose
 */
import { anyPass } from '@blue/util/logic';
import { is, like } from '@blue/util/types';
const isResponse = is(Response);
export const likeResponse = anyPass([
    isResponse,
    like({
        body: ReadableStream,
        bodyUsed: Boolean,
        headers: Headers,
        ok: Boolean,
        redirected: Boolean,
        status: Number,
        statusText: String,
        //trailer: Promise,
        type: String,
        url: String,
        clone: Function,
        arrayBuffer: Function,
        blob: Function,
        formData: Function,
        json: Function,
        text: Function,
    }),
]);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibGlrZS1yZXNwb25zZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NyYy9saWtlLXJlc3BvbnNlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOztHQUVHO0FBRUgsT0FBTyxFQUFFLE9BQU8sRUFBRSxNQUFNLGtCQUFrQixDQUFDO0FBQzNDLE9BQU8sRUFBRSxFQUFFLEVBQUUsSUFBSSxFQUFFLE1BQU0sa0JBQWtCLENBQUM7QUFFNUMsTUFBTSxVQUFVLEdBQUcsRUFBRSxDQUFDLFFBQVEsQ0FBaUMsQ0FBQztBQUVoRSxNQUFNLENBQUMsTUFBTSxZQUFZLEdBQUcsT0FBTyxDQUFDO0lBQ2hDLFVBQVU7SUFDVixJQUFJLENBQUM7UUFDRCxJQUFJLEVBQUUsY0FBYztRQUNwQixRQUFRLEVBQUUsT0FBTztRQUNqQixPQUFPLEVBQUUsT0FBTztRQUNoQixFQUFFLEVBQUUsT0FBTztRQUNYLFVBQVUsRUFBRSxPQUFPO1FBQ25CLE1BQU0sRUFBRSxNQUFNO1FBQ2QsVUFBVSxFQUFFLE1BQU07UUFDbEIsbUJBQW1CO1FBQ25CLElBQUksRUFBRSxNQUFNO1FBQ1osR0FBRyxFQUFFLE1BQU07UUFDWCxLQUFLLEVBQUUsUUFBUTtRQUNmLFdBQVcsRUFBRSxRQUFRO1FBQ3JCLElBQUksRUFBRSxRQUFRO1FBQ2QsUUFBUSxFQUFFLFFBQVE7UUFDbEIsSUFBSSxFQUFFLFFBQVE7UUFDZCxJQUFJLEVBQUUsUUFBUTtLQUNqQixDQUFDO0NBQ0wsQ0FBaUMsQ0FBQyJ9