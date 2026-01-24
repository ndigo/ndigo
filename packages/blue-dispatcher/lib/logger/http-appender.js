/**
 * @author Jeff Rose
 */
import { AbstractBatchAppender } from '@blue/logger';
import { HTTPHeaders } from '@blue/http';
import { $aware } from '@blue/factory';
const { CONTENT_LENGTH, CONTENT_TYPE } = HTTPHeaders, { assign } = Object, { defineProperty } = Reflect, defaults = {
    method: 'POST',
    timeout: -1,
};
export class HTTPAppender extends AbstractBatchAppender {
    #http;
    appending;
    url;
    settings;
    get [$aware]() {
        return true;
    }
    constructor(url, init = defaults) {
        super();
        this.appending = Promise.resolve(null);
        defineProperty(this, 'url', {
            value: url,
            configurable: true,
            enumerable: true,
            writable: false,
        });
        defineProperty(this, 'settings', {
            value: init === defaults ? assign({}, init) : assign({}, defaults, init),
            configurable: true,
            enumerable: true,
            writable: false,
        });
    }
    appendBatch(entries) {
        const appender = this, content = this.layout.formatBatch(entries), settings = assign({}, this.settings, {
            body: content,
            headers: new Headers(),
        });
        CONTENT_TYPE.set(settings.headers, this.layout.mediaType.withCharset('utf-8'));
        CONTENT_LENGTH.set(settings.headers, content.length);
        this.appending = new Promise(function (resolve, reject) {
            const timeout = settings.timeout;
            let timedOut = false, timerId = null;
            if (timeout > 0) {
                timerId = window.setTimeout(function () {
                    timedOut = true;
                    reject(new Error(`Appender timed out`));
                }, timeout);
            }
            this.#http
                .request(appender.url, settings)
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
    setHTTP(http) {
        this.#http = http;
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaHR0cC1hcHBlbmRlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9sb2dnZXIvaHR0cC1hcHBlbmRlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7R0FFRztBQUVILE9BQU8sRUFBRSxxQkFBcUIsRUFBUyxNQUFNLGNBQWMsQ0FBQztBQUM1RCxPQUFPLEVBQWdDLFdBQVcsRUFBRSxNQUFNLFlBQVksQ0FBQztBQUN2RSxPQUFPLEVBQUUsTUFBTSxFQUFFLE1BQU0sZUFBZSxDQUFDO0FBSXZDLE1BQU0sRUFBRSxjQUFjLEVBQUUsWUFBWSxFQUFFLEdBQUcsV0FBVyxFQUNoRCxFQUFFLE1BQU0sRUFBRSxHQUFHLE1BQU0sRUFDbkIsRUFBRSxjQUFjLEVBQUUsR0FBRyxPQUFPLEVBQzVCLFFBQVEsR0FBcUI7SUFDekIsTUFBTSxFQUFFLE1BQU07SUFDZCxPQUFPLEVBQUUsQ0FBQyxDQUFDO0NBQ2QsQ0FBQztBQUVOLE1BQU0sT0FBTyxZQUFhLFNBQVEscUJBQXFCO0lBQ25ELEtBQUssQ0FBTztJQUNaLFNBQVMsQ0FBb0I7SUFDcEIsR0FBRyxDQUFTO0lBQ1osUUFBUSxDQUFtQjtJQUVwQyxJQUFJLENBQUMsTUFBTSxDQUFDO1FBQ1IsT0FBTyxJQUFJLENBQUM7SUFDaEIsQ0FBQztJQUVELFlBQVksR0FBVyxFQUFFLE9BQXlCLFFBQVE7UUFDdEQsS0FBSyxFQUFFLENBQUM7UUFDUixJQUFJLENBQUMsU0FBUyxHQUFHLE9BQU8sQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUM7UUFFdkMsY0FBYyxDQUFDLElBQUksRUFBRSxLQUFLLEVBQUU7WUFDeEIsS0FBSyxFQUFFLEdBQUc7WUFDVixZQUFZLEVBQUUsSUFBSTtZQUNsQixVQUFVLEVBQUUsSUFBSTtZQUNoQixRQUFRLEVBQUUsS0FBSztTQUNsQixDQUFDLENBQUM7UUFDSCxjQUFjLENBQUMsSUFBSSxFQUFFLFVBQVUsRUFBRTtZQUM3QixLQUFLLEVBQUUsSUFBSSxLQUFLLFFBQVEsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLEVBQUUsRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLEVBQUUsRUFBRSxRQUFRLEVBQUUsSUFBSSxDQUFDO1lBQ3hFLFlBQVksRUFBRSxJQUFJO1lBQ2xCLFVBQVUsRUFBRSxJQUFJO1lBQ2hCLFFBQVEsRUFBRSxLQUFLO1NBQ2xCLENBQUMsQ0FBQztJQUNQLENBQUM7SUFFRCxXQUFXLENBQUMsT0FBZ0I7UUFDeEIsTUFBTSxRQUFRLEdBQWlCLElBQUksRUFDL0IsT0FBTyxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsV0FBVyxDQUFDLE9BQU8sQ0FBQyxFQUMxQyxRQUFRLEdBQUcsTUFBTSxDQUFDLEVBQUUsRUFBRSxJQUFJLENBQUMsUUFBUSxFQUFFO1lBQ2pDLElBQUksRUFBRSxPQUFPO1lBQ2IsT0FBTyxFQUFFLElBQUksT0FBTyxFQUFFO1NBQ3pCLENBQUMsQ0FBQztRQUVQLFlBQVksQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLE9BQU8sRUFBRSxJQUFJLENBQUMsTUFBTSxDQUFDLFNBQVMsQ0FBQyxXQUFXLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQztRQUMvRSxjQUFjLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQyxPQUFPLEVBQUUsT0FBTyxDQUFDLE1BQU0sQ0FBQyxDQUFDO1FBRXJELElBQUksQ0FBQyxTQUFTLEdBQUcsSUFBSSxPQUFPLENBQVcsVUFBVSxPQUFPLEVBQUUsTUFBTTtZQUM1RCxNQUFNLE9BQU8sR0FBRyxRQUFRLENBQUMsT0FBTyxDQUFDO1lBQ2pDLElBQUksUUFBUSxHQUFHLEtBQUssRUFDaEIsT0FBTyxHQUFXLElBQUksQ0FBQztZQUUzQixJQUFJLE9BQU8sR0FBRyxDQUFDLEVBQUUsQ0FBQztnQkFDZCxPQUFPLEdBQUcsTUFBTSxDQUFDLFVBQVUsQ0FBQztvQkFDeEIsUUFBUSxHQUFHLElBQUksQ0FBQztvQkFDaEIsTUFBTSxDQUFDLElBQUksS0FBSyxDQUFDLG9CQUFvQixDQUFDLENBQUMsQ0FBQztnQkFDNUMsQ0FBQyxFQUFFLE9BQU8sQ0FBQyxDQUFDO1lBQ2hCLENBQUM7WUFFRCxJQUFJLENBQUMsS0FBSztpQkFDTCxPQUFPLENBQUMsUUFBUSxDQUFDLEdBQUcsRUFBRSxRQUFRLENBQUM7aUJBQy9CLElBQUksQ0FBQyxVQUFVLFFBQWtCO2dCQUM5QixPQUFPLEtBQUssSUFBSSxJQUFJLFlBQVksQ0FBQyxPQUFPLENBQUMsQ0FBQztnQkFDMUMsQ0FBQyxRQUFRLElBQUksT0FBTyxDQUFDLFFBQVEsQ0FBQyxDQUFDO1lBQ25DLENBQUMsQ0FBQztpQkFDRCxLQUFLLENBQUMsVUFBVSxLQUFZO2dCQUN6QixJQUFJLFFBQVEsRUFBRSxDQUFDO29CQUNYLE9BQU87Z0JBQ1gsQ0FBQztnQkFDRCxNQUFNLENBQUMsS0FBSyxDQUFDLENBQUM7WUFDbEIsQ0FBQyxDQUFDLENBQUM7UUFDWCxDQUFDLENBQUMsQ0FBQztJQUNQLENBQUM7SUFFRCxPQUFPLENBQUMsSUFBVTtRQUNkLElBQUksQ0FBQyxLQUFLLEdBQUcsSUFBSSxDQUFDO0lBQ3RCLENBQUM7Q0FDSiJ9