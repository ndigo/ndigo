import { SpanKind } from '@opentelemetry/api';
import * as dispatcher from '@blue/dispatcher';
import { Route } from '@blue/router';
import { BaseBlueInstrumentation } from '../base';

/**
 * An OpenTelemetry instrumentation for the `@blue/dispatcher` package.
 *
 * This instrumentation automatically creates spans for the `dispatch` method,
 * providing visibility into route dispatching processes.
 */
export class DispatcherInstrumentation extends BaseBlueInstrumentation {
    constructor() {
        super('dispatcher');
    }

    enable(): void {
        this._wrap(
            (dispatcher as any).BrowserDispatcher.prototype,
            'dispatch',
            this._patchAsync({
                name: 'Dispatcher.dispatch',
                kind: SpanKind.SERVER,
                attributes: (_instance: any, args: any[]) => ({
                    'route.path': (args[0] as Route).path,
                }),
            })
        );
    }

    disable(): void {
        this._unwrap((dispatcher as any).BrowserDispatcher.prototype, 'dispatch');
    }
}
