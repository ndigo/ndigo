/**
 * Uploaded multipart file model.
 */
import { Readable } from 'node:stream';
import { createReadStream } from 'node:fs';
import { copyFile, mkdir, readFile, unlink, writeFile } from 'node:fs/promises';
import { dirname } from 'node:path';
import { MultiValueMap } from '@ndigo/core';

/**
 * A single part of a `multipart/form-data` request — an uploaded file.
 *
 * The shape mirrors the stable subset of the reference framework's `MultipartFile` that Ndigo
 * needs (`getName`, `getOriginalFilename`, `getSize`, `isEmpty`, `getBytes`,
 * `getInputStream`, `transferTo`). A part is backed either by an in-memory
 * buffer (small uploads) or a temp file (large uploads streamed above the
 * threshold); both are served through the same interface.
 */
export interface MultipartFile {
    /** The form field name (`getName`). */
    readonly name: string;
    /** Client-supplied original filename (`getOriginalFilename`) — untrusted, never written to disk as-is. */
    readonly originalFilename: string;
    /** Part `Content-Type` (`getContentType`), when declared by the client. */
    readonly contentType?: string;
    /** Size in bytes (`getSize`). */
    readonly size: number;
    /** `true` when no bytes were received (`isEmpty`). */
    isEmpty(): boolean;
    /** All bytes (`getBytes`). Buffers temp files into memory. */
    bytes(): Uint8Array | Promise<Uint8Array>;
    /** Streaming read (`getInputStream`). */
    stream(): Readable;
    /** Copy the part to `dest` (`transferTo`). Creates parent directories. @param dest - The destination path. */
    transferTo(dest: string): Promise<void>;
}

/**
 * A parsed `multipart/form-data` request, stored on {@link node-request.NodeRequest#multipart | NodeRequest.multipart}.
 * Populated by the adapter before dispatch so argument resolvers can read it.
 */
export interface MultipartContext {
    /** Text fields keyed by form field name; repeated names collapse to an array. */
    readonly fields: Record<string, string | string[]>;
    /** Uploaded file parts grouped by form field name. */
    readonly files: Map<string, MultipartFile[]>;
    /**
     * Dispose any on-disk temp parts created during parsing. Idempotent and
     * never throws — called by the framework request lifecycle once the
     * request dispatch has finished (success or error), and by the parser
     * itself on the overflow-abort path.
     */
    cleanup(): Promise<void>;
}

/** Backing store for a parsed file part: in-memory buffer or temp-file handle. */
export type Backing =
    | { readonly kind: 'buffer'; readonly data: Buffer }
    | { readonly kind: 'temp'; readonly path: string; readonly size: number };

/**
 * Node.js implementation of {@link MultipartFile}.
 *
 * Temp files are named with a random suffix — never the client-supplied
 * filename — so parsing can never resolve a path-traversal payload to disk.
 * The caller owns `transferTo(dest)` destination sanitization (see AD-26 D-6).
 */
class NodeMultipartFile implements MultipartFile {
    readonly name: string;
    readonly originalFilename: string;
    readonly contentType: string | undefined;
    readonly #backing: Backing;

    constructor(name: string, originalFilename: string, contentType: string | undefined, backing: Backing) {
        this.name = name;
        this.originalFilename = originalFilename;
        this.contentType = contentType;
        this.#backing = backing;
    }

    get size(): number {
        return this.#backing.kind === 'buffer' ? this.#backing.data.length : this.#backing.size;
    }

    isEmpty(): boolean {
        return this.size === 0;
    }

    async bytes(): Promise<Uint8Array> {
        if (this.#backing.kind === 'buffer') {
            // DSG-2: copy out (never a view) so callers cannot mutate the
            // parser's buffer — the documented copy-out contract holds across
            // repeated calls.
            return new Uint8Array(this.#backing.data);
        }
        return new Uint8Array(await readFile(this.#backing.path));
    }

    stream(): Readable {
        return this.#backing.kind === 'buffer'
            ? Readable.from(this.#backing.data)
            : createReadStream(this.#backing.path);
    }

    async transferTo(dest: string): Promise<void> {
        const target = dirname(dest);
        if (target) {
            await mkdir(target, { recursive: true });
        }
        if (this.#backing.kind === 'buffer') {
            await writeFile(dest, this.#backing.data);
        } else {
            // copyFile is cross-filesystem safe; rename would fail across mounts.
            await copyFile(this.#backing.path, dest);
        }
    }

    /** Release the temp file. Safe to call when no temp file exists. */
    async dispose(): Promise<void> {
        if (this.#backing.kind === 'temp') {
            await unlink(this.#backing.path).catch(() => undefined);
        }
    }
}

/**
 * A parsed multipart request that can dispose any temp files it created.
 */
class NodeMultipartContext implements MultipartContext {
    // SEC-1: null-prototype record + `Object.hasOwn` — a field named
    // `__proto__` must land as an ordinary own key (see also the urlencoded
    // codec in http-request-limits.ts), never through the inherited accessor.
    readonly fields: Record<string, string | string[]> = Object.create(null);
    readonly files = new MultiValueMap<string, MultipartFile>();
    #tempPaths = new Set<string>();

    setField(name: string, value: string): void {
        if (Object.hasOwn(this.fields, name)) {
            const existing = this.fields[name];
            if (Array.isArray(existing)) {
                existing.push(value);
            } else {
                this.fields[name] = [existing, value];
            }
        } else {
            this.fields[name] = value;
        }
    }

    addFile(name: string, part: MultipartFile): void {
        this.files.add(name, part);
    }

    trackTemp(path: string): void {
        this.#tempPaths.add(path);
    }

    async cleanup(): Promise<void> {
        if (this.#tempPaths.size === 0) {
            return;
        }
        const paths = [...this.#tempPaths];
        this.#tempPaths.clear();
        await Promise.all(paths.map((path) => unlink(path).catch(() => undefined)));
    }
}

export { NodeMultipartFile, NodeMultipartContext };
