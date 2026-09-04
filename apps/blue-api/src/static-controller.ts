/**
 * Static file serving controller.
 *
 * Serves a file from the `./public` directory under `/static/{file}`.
 */
import '@tsmetadata/polyfill';
import { readFile } from 'node:fs/promises';
import { join, normalize } from 'node:path';
import { getMapping, pathValue, routeParams } from '@blue/dispatcher';
import { ResponseStatuses } from '@blue/http';
import { ResponseEntity } from '@blue/platform-node';

const BASE = process.env['STATIC_DIR'] ?? join(process.cwd(), 'public');

@getMapping('/static')
export class StaticController {
    /**
     * GET /static/{file} — serves a file from the public directory.
     */
    @getMapping('/{file}')
    @routeParams({ file: pathValue('file') })
    async serve(file?: string) {
        const relative = file ?? '';
        const resolved = normalize(join(BASE, relative));

        // Path traversal guard — reject paths escaping the public directory.
        if (!resolved.startsWith(BASE)) {
            return ResponseEntity.notFound();
        }

        try {
            const content = await readFile(resolved, 'utf-8');
            return new ResponseEntity(content, ResponseStatuses.OK, {
                'Content-Type': contentType(resolved),
            });
        } catch {
            return ResponseEntity.notFound();
        }
    }
}

/** Map a file extension to a content type. */
function contentType(path: string): string {
    if (path.endsWith('.css')) return 'text/css; charset=utf-8';
    if (path.endsWith('.js')) return 'text/javascript; charset=utf-8';
    if (path.endsWith('.json')) return 'application/json';
    if (path.endsWith('.png')) return 'image/png';
    if (path.endsWith('.svg')) return 'image/svg+xml';
    return 'text/html; charset=utf-8';
}