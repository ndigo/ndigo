/**
 * @author Jeff Rose
 */

import { AbstractBatchAppender } from '../appender';
import { Entry } from '../entry';

export type FetchAppenderSettings = RequestInit & {
    timeout?: number;
};

const defaults: FetchAppenderSettings = {
    method: 'POST',
    timeout: -1,
};

export class FetchAppender extends AbstractBatchAppender {
    appending: Promise<Response>;
    readonly url: string;
    readonly options: FetchAppenderSettings;

    constructor(url: string, options: FetchAppenderSettings = {}) {
        super();
        this.appending = Promise.resolve(null);
        this.url = url;
        this.options = options;
    }

    appendBatch(entries: Entry[]): void {
        const url = this.url,
            content = this.layout.formatBatch(entries),
            settings = Object.assign({}, defaults, this.options, {
                body: content,
                headers: new Headers({
                    'Content-Type': this.layout.mediaType.withCharset('utf-8').toString(),
                    'Content-Length': String(content.length),
                }),
            });

        this.appending = new Promise<Response>(function (resolve, reject): void {
            const timeout = settings.timeout;
            let timedOut = false,
                timerId: number = null;

            if (timeout > 0) {
                timerId = window.setTimeout(function (): void {
                    timedOut = true;
                    reject(new Error(`Appender timed out`));
                }, timeout);
            }

            fetch(url, settings)
                .then(function (response: Response): void {
                    timerId !== null && clearTimeout(timerId);
                    !timedOut && resolve(response);
                })
                .catch(function (error: Error): void {
                    if (timedOut) {
                        return;
                    }
                    reject(error);
                });
        });
    }
}
