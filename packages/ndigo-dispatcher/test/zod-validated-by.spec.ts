/**
 * The AD-35 schema seam: `validatedBy` exposes the Zod schema on the
 * extractor and on the resolved {@link MethodParameter}, for generation-time
 * introspection (OpenAPI), without changing resolution behavior.
 */
import { describe, it, expect } from 'vitest';
import '@tsmetadata/polyfill';
import { z } from 'zod';
import { validatedBy, validatedBody, validatedQuery, validateParameters } from '../src/zod-validated-by';
import { bodyValue, queryValue, headerValue } from '../src/parameter-factories';
import { parameters, resolveParameters, getMethodParameter, storeResolvedParameters } from '../src/parameters';
import { postMapping } from '../src/http-method-mapping';
import { MethodParameter, MethodParameterType } from '../src/parameter-types';

const EchoSchema = z.object({ message: z.string().min(1), count: z.coerce.number().int() });

class EchoController {
    @postMapping('/echo')
    @parameters({ data: validatedBody(EchoSchema), trace: headerValue('x-trace') })
    echo(data: z.infer<typeof EchoSchema>, trace: string | undefined) {
        return { data, trace };
    }
}

describe('Zod schema seam (AD-35)', () => {
    describe('validatedBy', () => {
        it('attaches the caller schema to the returned extractor', () => {
            const extractor = validatedBy(EchoSchema, bodyValue('data'));
            expect(extractor.schema).toBe(EchoSchema);
            // No schema on raw extractors.
            expect(bodyValue('data').schema).toBeUndefined();
        });

        it('keeps validation wired through convert', () => {
            const extractor = validatedBy(EchoSchema, bodyValue('data'));
            expect(extractor.convert?.({ message: 'hi', count: '3' })).toEqual({ message: 'hi', count: 3 });
            expect(() => extractor.convert?.({ message: '', count: '3' })).toThrow(/message/);
        });

        it('validatedBody / validatedQuery carry the schema', () => {
            expect(validatedBody(EchoSchema).schema).toBe(EchoSchema);
            expect(validatedQuery(EchoSchema).schema).toBe(EchoSchema);
        });

        it('validateParameters attaches the schema to every mapped extractor', () => {
            const map = validateParameters(EchoSchema, {
                data: bodyValue(),
                lang: queryValue('lang'),
            });
            expect(map.data.schema).toBe(EchoSchema);
            expect(map.lang.schema).toBe(EchoSchema);
        });
    });

    describe('MethodParameter threading', () => {
        it('resolveParameters / getMethodParameter carry the schema + convert', () => {
            const resolved = resolveParameters(EchoController.prototype, 'echo', EchoController.prototype.echo);
            expect(resolved).toHaveLength(2);
            const [data, trace] = resolved;
            expect(data.type.toString()).toBe('body:value');
            expect(data.schema).toBe(EchoSchema);
            expect(trace.schema).toBeUndefined();
            // The mapping stores resolved parameters at registration; the
            // retrieval API must return exactly what was stored.
            storeResolvedParameters(EchoController.prototype, 'echo', resolved);
            expect(getMethodParameter(EchoController.prototype, 'echo')).toEqual(resolved);
        });

        it('MethodParameter.toJSON excludes the schema', () => {
            const parameter = new MethodParameter(
                MethodParameterType.BODY,
                'data',
                true,
                null,
                undefined,
                null,
                undefined,
                'data',
                undefined,
                EchoSchema
            );
            const json = parameter.toJSON();
            expect(json.schema).toBeUndefined();
            expect(json.name).toBe('data');
            expect(json.required).toBe(true);
        });
    });
});
