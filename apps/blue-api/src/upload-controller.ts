/**
 * @module blue-api
 * @since 1.0.0
 * @author Jeff Rose
 */
import '@tsmetadata/polyfill';
import { fileValue, postMapping, parameters, requestMapping, requestPart } from '@blue/dispatcher';
import { ResponseEntity } from '@blue/platform-node';
import type { MultipartFile } from '@blue/platform-node';
import { randomHex } from '@blue/util';
import { mkdtemp } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

/**
 * Per-process temp directory for demo uploads (`os.tmpdir()/blue-upload-*`).
 * Created lazily on the first upload and bounded to the process lifetime. The
 * parser's own temp-file parts (large uploads above the spill threshold) are
 * cleaned up by the framework request lifecycle — `NodeHTTPServerAdapter`
 * calls `multipart.cleanup()` after dispatch (idempotent, SEC-6), and only
 * AFTER the handler's `transferTo` has run — so this dir holds only the
 * transferred copies written by {@link UploadController.upload}, which are
 * app-owned and intentionally not auto-removed.
 */
let uploadDir: Promise<string> | undefined;

function uploadDirectory(): Promise<string> {
    if (!uploadDir) {
        uploadDir = mkdtemp(join(tmpdir(), 'blue-upload-'));
    }
    return uploadDir;
}

/**
 * JSON `meta` part DTO for {@link UploadController.upload} (D-6): bound via
 * `requestPart(MetaDTO)` into a real instance — Spring `@RequestPart` parity.
 */
class UploadMeta {
    label: string | null = null;
    tags: string[] = [];
}

/**
 * Demo `multipart/form-data` upload endpoint (AD-26, D-6).
 *
 * Binds an optional JSON `meta` part into a DTO via `requestPart(MetaDTO)`
 * (the part name is inferred from the parameter name) and a single file part
 * via `@file()` — persisted to a temp directory, echoing back the reported
 * byte size, the client-supplied filename, and the parsed meta. The stored
 * filename is random, never the client-supplied `originalFilename`, so an
 * upload can never resolve a path-traversal payload to disk (AD-26 D-6).
 */
@requestMapping('/api')
export class UploadController {
    @postMapping('/upload')
    @parameters({ file: fileValue(), meta: requestPart(UploadMeta) })
    async upload(file: MultipartFile, meta: UploadMeta | null) {
        if (!file || file.isEmpty()) {
            return ResponseEntity.badRequest({ error: 'no_file_uploaded' });
        }
        const dir = await uploadDirectory();
        const dest = join(dir, `${randomHex(8)}.bin`);
        await file.transferTo(dest);
        return { size: file.size, name: file.originalFilename, meta: meta ?? null };
    }
}
