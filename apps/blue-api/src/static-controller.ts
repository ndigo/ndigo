/**
 * Static file serving controller.
 *
 * Serves a file from the `./public` directory under `/static/{file}`.
 * Path safety (canonical containment, symlink resolution, MIME allowlist,
 * `nosniff`) is delegated to the shared `StaticResourceResolver` — the same
 * implementation `StaticFileView` uses.
 */
import '@tsmetadata/polyfill';
import { getMapping, pathValue, routeParams } from '@blue/dispatcher';
import { ResponseStatuses } from '@blue/http';
import { ResponseEntity, StaticResourceResolver } from '@blue/platform-node';

const BASE = process.env['STATIC_DIR'] ?? `${process.cwd()}/public`;
const resolver = new StaticResourceResolver(BASE);

@getMapping('/static')
export class StaticController {
    /**
     * GET /static/{file} — serves a file from the public directory.
     */
    @getMapping('/{file}')
    @routeParams({ file: pathValue('file') })
    async serve(file?: string) {
        const result = await resolver.resolve(file ?? '');
        if (result.kind !== 'ok') {
            if (result.kind === 'not-found') return ResponseEntity.notFound();
            return new ResponseEntity(
                { error: result.kind === 'forbidden' ? 'Forbidden' : 'Internal Server Error' },
                result.kind === 'forbidden' ? ResponseStatuses.FORBIDDEN : ResponseStatuses.INTERNAL_SERVER_ERROR
            );
        }
        return new ResponseEntity(result.data, ResponseStatuses.OK, {
            'Content-Type': result.contentType ?? 'application/octet-stream',
            'X-Content-Type-Options': 'nosniff',
        });
    }
}
