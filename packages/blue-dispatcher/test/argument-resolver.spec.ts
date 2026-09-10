import { describe, test, beforeEach, afterEach } from 'vitest';
import { AbstractDispatcher } from '../src/dispatcher';
import argumemtResolverContext from './assets/argument-resolver-context';
import { Route } from '@blue/router';

describe('ArgumentResolver', () => {
    // Mirrors the segment-shaped Route produced by the router for /hello/there.
    const helloThereRequest: Route = {
        id: 1,
        length: 2,
        path: '/hello/there',
        params: { id: '42' },
        raw: '/hello/there',
        data: { name: 'John' },
        attributes: {},
        0: { name: 'hello', raw: 'hello', data: null },
        1: { name: 'there', raw: 'there;name=Jim', data: { name: 'Jim' } },
    } as unknown as Route;

    describe('instance', () => {
        let dispatcher: AbstractDispatcher;

        beforeEach(() => {
            dispatcher = new AbstractDispatcher();
            dispatcher.initStrategies(argumemtResolverContext);
        });

        afterEach(() => {
            dispatcher = undefined as unknown as AbstractDispatcher;
        });

        test('it should init resolve query arguments', () => {
            return dispatcher.dispatch(helloThereRequest);
        });
    });
});
