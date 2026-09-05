import { describe, test, beforeEach, afterEach } from 'vitest';
import { AbstractDispatcher } from '../src/dispatcher';
import argumemtResolverContext from './assets/argument-resolver-context';

describe('ArgumentResolver', () => {
    const helloThereRequest = {
        id: 1,
        length: 2,
        path: '/hello/there',
        params: { id: '42' },
        raw: '/hello/there',
        data: { name: 'John' },
        0: { name: 'hello', raw: 'hello', data: null },
        1: { name: 'there', raw: 'there;name=Jim', data: { name: 'Jim' } },
    };

    describe('instance', () => {
        let dispatcher: AbstractDispatcher;

        beforeEach(() => {
            dispatcher = new AbstractDispatcher();
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
