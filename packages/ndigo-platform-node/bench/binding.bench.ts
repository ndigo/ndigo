/**
 * Body binding and Zod validation throughput on the Node platform.
 *
 * The body is pre-parsed into the route's `NodeRequest`, so these rows measure
 * binding and validation cost only — not `JSON.parse` or socket I/O. Valid and
 * invalid payloads are verified before timing.
 */
import { test } from 'vitest';
import { z } from 'zod';
import { bodyValue, validatedBy, MethodParameter, type ParameterExtractor } from '@ndigo/dispatcher';
import { NODE_REQUEST_ATTRIBUTE, type NodeRequest } from '../src/node-request';
import { NodeBodyValueMethodArgumentResolver } from '../src/body-argument-resolver';
import { assertEquivalent, benchName, sink } from '../../../benchmarks/lib/verify';

const BATCH = 1_000;
const retain = sink;
const resolver = new NodeBodyValueMethodArgumentResolver();

/** Mirrors `toMethodParameter` in `@ndigo/dispatcher`: extractor → resolved parameter. */
function parameterOf(extractor: ParameterExtractor): MethodParameter {
    return new MethodParameter(
        extractor.type,
        extractor.name,
        extractor.required,
        extractor.defaultValue,
        extractor.convertType,
        extractor.prefix,
        extractor.convert,
        'argument',
        extractor.target,
        extractor.schema
    );
}

const wholeBody = parameterOf(bodyValue());
const dottedBody = parameterOf(bodyValue('address.city'));
const validatedWhole = parameterOf(
    validatedBy(z.object({ title: z.string().min(1), done: z.coerce.boolean() }), bodyValue())
);
const validatedDotted = parameterOf(validatedBy(z.string().min(1), bodyValue('address.city')));

const smallBody = { title: 'buy milk', done: false };
const nestedBody = { address: { city: 'Springfield', zip: '12345' }, items: [{ id: 1 }, { id: 2 }] };
const invalidBody = { title: '', done: true };

function routeWith(body: unknown) {
    const request: Partial<NodeRequest> = { body: body as Record<string, unknown> };
    return {
        path: '/echo',
        params: null,
        data: {},
        attributes: { [NODE_REQUEST_ATTRIBUTE]: request },
    } as never;
}

const routeSmall = routeWith(smallBody);
const routeNested = routeWith(nestedBody);
const routeInvalid = routeWith(invalidBody);

test('body — whole-object bind', async ({ bench }) => {
    assertEquivalent('whole body bind', resolver.resolveArgument(wholeBody, routeSmall, null), smallBody);
    await bench(benchName('bind whole body', BATCH), () => {
        for (let i = 0; i < BATCH; i++) retain(resolver.resolveArgument(wholeBody, routeSmall, null));
    }).run();
});

test('body — dotted field read', async ({ bench }) => {
    assertEquivalent('dotted body read', resolver.resolveArgument(dottedBody, routeNested, null), 'Springfield');
    await bench(benchName('bind dotted body', BATCH), () => {
        for (let i = 0; i < BATCH; i++) retain(resolver.resolveArgument(dottedBody, routeNested, null));
    }).run();
});

test('validate — whole body via Zod', async ({ bench }) => {
    assertEquivalent('validated body', resolver.resolveArgument(validatedWhole, routeSmall, null), smallBody);
    await bench(benchName('validatedBy(Zod) — valid', BATCH), () => {
        for (let i = 0; i < BATCH; i++) retain(resolver.resolveArgument(validatedWhole, routeSmall, null));
    }).run();
    await bench(benchName('validatedBy(Zod) — invalid', BATCH), () => {
        for (let i = 0; i < BATCH; i++) {
            try {
                retain(resolver.resolveArgument(validatedWhole, routeInvalid, null));
            } catch {
                retain('invalid');
            }
        }
    }).run();
});

test('validate — dotted body via Zod', async ({ bench }) => {
    assertEquivalent(
        'validated dotted body',
        resolver.resolveArgument(validatedDotted, routeNested, null),
        'Springfield'
    );
    await bench(benchName('validatedBy(Zod) — dotted', BATCH), () => {
        for (let i = 0; i < BATCH; i++) retain(resolver.resolveArgument(validatedDotted, routeNested, null));
    }).run();
});
