/**
 * Static file serving controller.
 *
 * Serves a file from the `./public` directory under `/static/{file}`.
 * Path safety (canonical containment, symlink resolution, MIME allowlist,
 * `nosniff`) is delegated to the shared `StaticResourceResolver` — the same
 * implementation `StaticFileView` uses.
 */
import '@tsmetadata/polyfill';
import { getMapping, pathValue, routeParams, requestMapping } from '@blue/dispatcher';
import { ResponseStatuses } from '@blue/http';
import { ResponseEntity, StaticResourceResolver } from '@blue/platform-node';

@requestMapping('/static')
export class StaticController {
    readonly #resolver: StaticResourceResolver;

    /**
     * @param baseDir - Static root. Defaults to `STATIC_DIR` env or `./public`.
     */
    constructor(baseDir?: string) {
        const base = baseDir ?? process.env['STATIC_DIR'] ?? `${process.cwd()}/public`;
        this.#resolver = new StaticResourceResolver(base);
    }

    /**
     * GET /static/{file} — serves a file from the public directory.
     */
    @getMapping('/{file}')
    @routeParams({ file: pathValue('file') })
    async serve(file?: string) {
        const result = await this.#resolver.resolve(file ?? '');
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
