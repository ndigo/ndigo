/**
 * @author Jeff Rose
 */
import { AbstractBatchAppender } from '../appender';
const defaults = {
    method: 'POST',
    timeout: -1,
};
export class FetchAppender extends AbstractBatchAppender {
    appending;
    url;
    options;
    constructor(url, options = {}) {
        super();
        this.appending = Promise.resolve(null);
        this.url = url;
        this.options = options;
    }
    appendBatch(entries) {
        const url = this.url, content = this.layout.formatBatch(entries), settings = Object.assign({}, defaults, this.options, {
            body: content,
            headers: new Headers({
                'Content-Type': this.layout.mediaType.withCharset('utf-8').toString(),
                'Content-Length': String(content.length),
            }),
        });
        this.appending = new Promise(function (resolve, reject) {
            const timeout = settings.timeout;
            let timedOut = false, timerId = null;
            if (timeout > 0) {
                timerId = window.setTimeout(function () {
                    timedOut = true;
                    reject(new Error(`Appender timed out`));
                }, timeout);
            }
            fetch(url, settings)
                .then(function (response) {
                timerId !== null && clearTimeout(timerId);
                !timedOut && resolve(response);
            })
                .catch(function (error) {
                if (timedOut) {
                    return;
                }
                reject(error);
            });
        });
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZmV0Y2gtYXBwZW5kZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvYXBwZW5kZXJzL2ZldGNoLWFwcGVuZGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOztHQUVHO0FBRUgsT0FBTyxFQUFFLHFCQUFxQixFQUFFLE1BQU0sYUFBYSxDQUFDO0FBT3BELE1BQU0sUUFBUSxHQUEwQjtJQUNwQyxNQUFNLEVBQUUsTUFBTTtJQUNkLE9BQU8sRUFBRSxDQUFDLENBQUM7Q0FDZCxDQUFDO0FBRUYsTUFBTSxPQUFPLGFBQWMsU0FBUSxxQkFBcUI7SUFDcEQsU0FBUyxDQUFvQjtJQUNwQixHQUFHLENBQVM7SUFDWixPQUFPLENBQXdCO0lBRXhDLFlBQVksR0FBVyxFQUFFLFVBQWlDLEVBQUU7UUFDeEQsS0FBSyxFQUFFLENBQUM7UUFDUixJQUFJLENBQUMsU0FBUyxHQUFHLE9BQU8sQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDdkMsSUFBSSxDQUFDLEdBQUcsR0FBRyxHQUFHLENBQUM7UUFDZixJQUFJLENBQUMsT0FBTyxHQUFHLE9BQU8sQ0FBQztJQUMzQixDQUFDO0lBRUQsV0FBVyxDQUFDLE9BQWdCO1FBQ3hCLE1BQU0sR0FBRyxHQUFHLElBQUksQ0FBQyxHQUFHLEVBQ2hCLE9BQU8sR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLFdBQVcsQ0FBQyxPQUFPLENBQUMsRUFDMUMsUUFBUSxHQUFHLE1BQU0sQ0FBQyxNQUFNLENBQUMsRUFBRSxFQUFFLFFBQVEsRUFBRSxJQUFJLENBQUMsT0FBTyxFQUFFO1lBQ2pELElBQUksRUFBRSxPQUFPO1lBQ2IsT0FBTyxFQUFFLElBQUksT0FBTyxDQUFDO2dCQUNqQixjQUFjLEVBQUUsSUFBSSxDQUFDLE1BQU0sQ0FBQyxTQUFTLENBQUMsV0FBVyxDQUFDLE9BQU8sQ0FBQyxDQUFDLFFBQVEsRUFBRTtnQkFDckUsZ0JBQWdCLEVBQUUsTUFBTSxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUM7YUFDM0MsQ0FBQztTQUNMLENBQUMsQ0FBQztRQUVQLElBQUksQ0FBQyxTQUFTLEdBQUcsSUFBSSxPQUFPLENBQVcsVUFBVSxPQUFPLEVBQUUsTUFBTTtZQUM1RCxNQUFNLE9BQU8sR0FBRyxRQUFRLENBQUMsT0FBTyxDQUFDO1lBQ2pDLElBQUksUUFBUSxHQUFHLEtBQUssRUFDaEIsT0FBTyxHQUFXLElBQUksQ0FBQztZQUUzQixJQUFJLE9BQU8sR0FBRyxDQUFDLEVBQUUsQ0FBQztnQkFDZCxPQUFPLEdBQUcsTUFBTSxDQUFDLFVBQVUsQ0FBQztvQkFDeEIsUUFBUSxHQUFHLElBQUksQ0FBQztvQkFDaEIsTUFBTSxDQUFDLElBQUksS0FBSyxDQUFDLG9CQUFvQixDQUFDLENBQUMsQ0FBQztnQkFDNUMsQ0FBQyxFQUFFLE9BQU8sQ0FBQyxDQUFDO1lBQ2hCLENBQUM7WUFFRCxLQUFLLENBQUMsR0FBRyxFQUFFLFFBQVEsQ0FBQztpQkFDZixJQUFJLENBQUMsVUFBVSxRQUFrQjtnQkFDOUIsT0FBTyxLQUFLLElBQUksSUFBSSxZQUFZLENBQUMsT0FBTyxDQUFDLENBQUM7Z0JBQzFDLENBQUMsUUFBUSxJQUFJLE9BQU8sQ0FBQyxRQUFRLENBQUMsQ0FBQztZQUNuQyxDQUFDLENBQUM7aUJBQ0QsS0FBSyxDQUFDLFVBQVUsS0FBWTtnQkFDekIsSUFBSSxRQUFRLEVBQUUsQ0FBQztvQkFDWCxPQUFPO2dCQUNYLENBQUM7Z0JBQ0QsTUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFDO1lBQ2xCLENBQUMsQ0FBQyxDQUFDO1FBQ1gsQ0FBQyxDQUFDLENBQUM7SUFDUCxDQUFDO0NBQ0oifQ==