/**
 * The client-error contract: every client-facing class carries the
 * disposition, status, and problem type the adapters render. The checks are
 * structural, so duplicate package copies and serialized errors keep working.
 */
import { ApplicationError, FrameworkError, IllegalStateError, likeClientProblem } from '@ndigo/core';
import { ProblemTypes, ResponseStatuses } from '@ndigo/http';
import { NoHandlerFoundError, NoViewFoundError, ParameterBindingError } from '@ndigo/dispatcher';
import { NotAcceptableError } from '@ndigo/view';
import type { Route } from '@ndigo/router';
import { describe, expect, it } from 'vitest';
import { RequestLimitError } from '../src/http-request-limits';

const route = { path: '/orders/42' } as Route;

const clientCases = [
    {
        name: 'NoHandlerFoundError',
        error: new NoHandlerFoundError(route),
        status: ResponseStatuses.NOT_FOUND,
        problemType: ProblemTypes.notFound,
    },
    {
        name: 'NoViewFoundError',
        error: new NoViewFoundError('orders/show', route),
        status: ResponseStatuses.NOT_FOUND,
        problemType: ProblemTypes.notFound,
    },
    {
        name: 'NotAcceptableError',
        error: new NotAcceptableError('orders/show', []),
        status: ResponseStatuses.NOT_ACCEPTABLE,
        problemType: ProblemTypes.notAcceptable,
    },
    {
        name: 'ParameterBindingError',
        error: new ParameterBindingError('missing id', 'id'),
        status: ResponseStatuses.BAD_REQUEST,
        problemType: ProblemTypes.bindingFailed,
    },
    {
        name: 'RequestLimitError',
        error: new RequestLimitError(ResponseStatuses.REQUEST_TIMEOUT, ProblemTypes.requestTimeout, 'timed out'),
        status: ResponseStatuses.REQUEST_TIMEOUT,
        problemType: ProblemTypes.requestTimeout,
    },
];

describe('client error contract', () => {
    for (const clientCase of clientCases) {
        it(`${clientCase.name} carries its rendering contract`, () => {
            expect(clientCase.error.disposition).toBe('client');
            expect(clientCase.error.problemStatus).toBe(clientCase.status);
            expect(clientCase.error.problemType).toBe(clientCase.problemType);
            expect(clientCase.status.isClientErrorClass).toBe(true);
            expect(likeClientProblem(clientCase.error)).toBe(true);
        });
    }

    it('requires a status and a problem type for a client disposition', () => {
        expect(() => new FrameworkError('missing', { disposition: 'client' })).toThrow(TypeError);
        expect(
            () =>
                new FrameworkError('missing type', {
                    disposition: 'client',
                    problemStatus: ResponseStatuses.BAD_REQUEST,
                })
        ).toThrow(TypeError);
        expect(
            () =>
                new ApplicationError('missing status', {
                    disposition: 'client',
                    problemType: ProblemTypes.bindingFailed,
                })
        ).toThrow(TypeError);
    });

    it('defaults the disposition from the class lineage', () => {
        expect(new FrameworkError('framework').disposition).toBe('framework');
        expect(new ApplicationError('application').disposition).toBe('application');
        expect(new IllegalStateError('state').disposition).toBe('framework');
    });

    it('serializes the surface-independent classification, not the status', () => {
        const json = new NoViewFoundError('orders/show', route).toJSON();

        expect(json.disposition).toBe('client');
        expect(json.problemType).toBe(ProblemTypes.notFound);
        expect(json).not.toHaveProperty('problemStatus');
        expect(json).not.toHaveProperty('status');
    });

    it('rejects values that only look like a client problem', () => {
        expect(likeClientProblem(null)).toBe(false);
        expect(likeClientProblem(new FrameworkError('framework'))).toBe(false);
        expect(likeClientProblem({ disposition: 'client', message: 'missing status' })).toBe(false);
        expect(
            likeClientProblem({ disposition: 'client', problemStatus: { code: 400 }, message: 'missing type' })
        ).toBe(false);
    });
});
