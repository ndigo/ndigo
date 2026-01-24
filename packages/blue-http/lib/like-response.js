/**
 * @author Jeff Rose
 */
import { anyPass, is, like } from '@blue/util';
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibGlrZS1yZXNwb25zZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NyYy9saWtlLXJlc3BvbnNlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOztHQUVHO0FBRUgsT0FBTyxFQUFFLE9BQU8sRUFBRSxFQUFFLEVBQUUsSUFBSSxFQUFFLE1BQU0sWUFBWSxDQUFDO0FBRS9DLE1BQU0sVUFBVSxHQUFHLEVBQUUsQ0FBQyxRQUFRLENBQWlDLENBQUM7QUFFaEUsTUFBTSxDQUFDLE1BQU0sWUFBWSxHQUFHLE9BQU8sQ0FBQztJQUNoQyxVQUFVO0lBQ1YsSUFBSSxDQUFDO1FBQ0QsSUFBSSxFQUFFLGNBQWM7UUFDcEIsUUFBUSxFQUFFLE9BQU87UUFDakIsT0FBTyxFQUFFLE9BQU87UUFDaEIsRUFBRSxFQUFFLE9BQU87UUFDWCxVQUFVLEVBQUUsT0FBTztRQUNuQixNQUFNLEVBQUUsTUFBTTtRQUNkLFVBQVUsRUFBRSxNQUFNO1FBQ2xCLG1CQUFtQjtRQUNuQixJQUFJLEVBQUUsTUFBTTtRQUNaLEdBQUcsRUFBRSxNQUFNO1FBQ1gsS0FBSyxFQUFFLFFBQVE7UUFDZixXQUFXLEVBQUUsUUFBUTtRQUNyQixJQUFJLEVBQUUsUUFBUTtRQUNkLFFBQVEsRUFBRSxRQUFRO1FBQ2xCLElBQUksRUFBRSxRQUFRO1FBQ2QsSUFBSSxFQUFFLFFBQVE7S0FDakIsQ0FBQztDQUNMLENBQWlDLENBQUMifQ==