/**
 * The wire documents this app answers with, defined once and parsed at the test
 * boundary by every lane — so a response-shape change fails loudly in each lane
 * instead of slipping through a cast, and the three lanes cannot drift apart.
 *
 * @since 1.0.0
 * @author Jeff Rose
 */
import { z } from 'zod';

/** A backend mode, exactly the two the app can report. */
const mode = z.enum(['redis', 'memory']);

/** The `/health` document, reduced to the parts the lanes assert on. */
export const HealthDoc = z.object({
    status: z.string(),
    components: z.record(z.string(), z.object({ status: z.string(), details: z.record(z.string(), z.unknown()) })),
});

/** The `GET /cache/:key` document. */
export const CacheDoc = z.object({
    key: z.string(),
    value: z.string(),
    hits: z.number(),
    producer: z.string(),
    servedBy: z.string(),
    mode,
    cache: z.string(),
    namespace: z.string(),
    ttlMs: z.number(),
    createdAt: z.string(),
    updatedAt: z.string(),
});

/** The `board-message` frame the socket endpoint and `POST /board` both publish. */
export const BoardMessageDoc = z.object({
    event: z.literal('board-message'),
    text: z.string(),
    from: z.string(),
    at: z.string(),
});

/** The `202` document `POST /board` answers with. */
export const BoardPostDoc = z.object({
    posted: BoardMessageDoc,
    localClients: z.number(),
    instanceId: z.string(),
    mode,
});

/** The sender-only `board-error` frame a refused board message produces. */
export const BoardErrorDoc = z.object({ event: z.literal('board-error'), detail: z.string() });
