/**
 * @module blue-api
 * @since 1.0.0
 * @author Jeff Rose
 */
import { z } from 'zod';
import { schemaForEntity } from '@blue/orm';
import { createConversionService } from '@blue/core';
import { Note } from './note.entity';

/**
 * The note response contract — id, title, a computed summary, and createdAt.
 *
 * This is the schema the OpenAPI generator documents (`@apiDocs({ responses })`)
 * and the schema every mapping validates against (see `noteDtoSchema`):
 * zod's native `toJSONSchema` cannot represent transform schemas
 * ("Transforms cannot be represented in JSON Schema"), so the transform's
 * output is an explicit, representable contract object — the documented
 * shape *is* the mapping target, and drift fails loud at parse time.
 */
export const noteResponseSchema = z.object({
    id: z.number(),
    title: z.string(),
    summary: z.string(),
    createdAt: z.string().nullable(),
});

/**
 * The mapping schema (AD-38): projects raw entity rows to the response
 * contract.
 *
 * Derived from the entity's column metadata — the entity stays the single
 * source of truth; the transform computes `summary` (input annotated from
 * the entity's declared column types because entity-derived schemas erase
 * to `Record<string, z.ZodType>`), and `.pipe(noteResponseSchema)` pins
 * the output to the documented contract. The shape matches the Drizzle
 * entity, so the same schema serves both controllers.
 */
export const noteDtoSchema = schemaForEntity(Note)
    .pick({ id: true, title: true, body: true, createdAt: true })
    .transform((input) => {
        // Entity-derived schemas erase their input type (`Record<string,
        // never>`), so the column shape is recovered with an explicit cast —
        // the schema itself still validates the values at parse time.
        const { id, title, body, createdAt } = input as unknown as {
            id: number;
            title: string;
            body: string | null;
            createdAt: string | null;
        };
        return {
            id,
            title,
            summary: (body ?? '').slice(0, 80) || title,
            createdAt,
        };
    })
    .pipe(noteResponseSchema);

/** Static type of the note response DTO. */
export type NoteDTO = z.infer<typeof noteDtoSchema>;

/**
 * The app's conversion service — stateless, safe to share module-wide
 * (AD-38 D-5). In a Node app the `CONVERSION_SERVICE` bean provides the
 * same instance shape; the demo keeps a module-level one for zero wiring.
 */
export const conversionService = createConversionService();
