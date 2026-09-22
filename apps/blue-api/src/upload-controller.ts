/**
 * @module blue-api
 * @since 1.0.0
 * @author Jeff Rose
 */
import '@tsmetadata/polyfill';
import { fileValue, postMapping, parameters, requestMapping } from '@blue/dispatcher';
import { ResponseEntity } from '@blue/platform-node';
import type { MultipartFile } from '@blue/platform-node';
import { randomBytes } from 'node:crypto';
import { mkdtemp } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

/**
 * Per-process temp directory for demo uploads (`os.tmpdir()/blue-upload-*`).
 * Created lazily on the first upload and bounded to the process lifetime. The
 * parser's own temp-file parts (large uploads above the spill threshold) are
 * cleaned up by the framework request lifecycle; this dir holds only the
 * transferred copies written by {@link UploadController.upload}.
 */
let uploadDir: Promise<string> | undefined;

function uploadDirectory(): Promise<string> {
    if (!uploadDir) {
        uploadDir = mkdtemp(join(tmpdir(), 'blue-upload-'));
    }
    return uploadDir;
}

/**
 * Demo `multipart/form-data` upload endpoint (AD-26).
 *
 * Binds a single file part via `@file()` — the part name is inferred from the
 * parameter name (`file`) — persists it to a temp directory, and echoes back
 * the reported byte size and the client-supplied filename. The stored filename
 * is random, never the client-supplied `originalFilename`, so an upload can
 * never resolve a path-traversal payload to disk (AD-26 D-6).
 */
@requestMapping('/api')
export class UploadController {
    @postMapping('/upload')
    @parameters({ file: fileValue() })
    async upload(file: MultipartFile) {
        if (!file || file.isEmpty()) {
            return ResponseEntity.badRequest({ error: 'no_file_uploaded' });
        }
        const dir = await uploadDirectory();
        const dest = join(dir, `${randomBytes(8).toString('hex')}.bin`);
        await file.transferTo(dest);
        return { size: file.size, name: file.originalFilename };
    }
}
