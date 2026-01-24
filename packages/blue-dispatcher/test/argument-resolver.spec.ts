import { describe, test, beforeEach, afterEach } from 'vitest';
import { BrowserDispatcher } from '../src/dispatcher';
import argumemtResolverContext from './assets/argument-resolver-context';

describe('ArgumentResolver', () => {
    const helloThereRequest = {
        path: '/hello/there',
        data: { name: 'John' },
        0: { name: 'hello' },
        1: { name: 'there', data: { name: 'Jim' } },
    };

    describe('instance', () => {
        let dispatcher: BrowserDispatcher;

        beforeEach(() => {
            dispatcher = new BrowserDispatcher();
            dispatcher.initStrategies(argumemtResolverContext);
        });

        afterEach(() => {
            dispatcher = undefined as any;
        });

        test('it should init resolve query arguments', () => {
            return dispatcher.dispatch(helloThereRequest);
        });
    });
});
