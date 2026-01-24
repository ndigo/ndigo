/**
 * @author Jeff Rose
 */

import { AbstractBatchAppender, Entry } from '@blue/logger';
import { TimeoutInit, HTTPAware, HTTP, HTTPHeaders } from '@blue/http';
import { $aware } from '@blue/factory';

export type HTTPAppenderInit = TimeoutInit;

const { CONTENT_LENGTH, CONTENT_TYPE } = HTTPHeaders,
    { assign } = Object,
    { defineProperty } = Reflect,
    defaults: HTTPAppenderInit = {
        method: 'POST',
        timeout: -1,
    };

export class HTTPAppender extends AbstractBatchAppender implements HTTPAware {
    #http: HTTP;
    appending: Promise<Response>;
    readonly url: string;
    readonly settings: HTTPAppenderInit;

    get [$aware](): boolean {
        return true;
    }

    constructor(url: string, init: HTTPAppenderInit = defaults) {
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

    appendBatch(entries: Entry[]): void {
        const appender: HTTPAppender = this,
            content = this.layout.formatBatch(entries),
            settings = assign({}, this.settings, {
                body: content,
                headers: new Headers(),
            });

        CONTENT_TYPE.set(settings.headers, this.layout.mediaType.withCharset('utf-8'));
        CONTENT_LENGTH.set(settings.headers, content.length);

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

            this.#http
                .request(appender.url, settings)
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

    setHTTP(http: HTTP): void {
        this.#http = http;
    }
}
