/**
 * Public options for the static-resource handler.
 */
/** Handler options — defaults preserve today's plain-file behavior. */
export interface StaticHandlerOptions {
    /** `Cache-Control` value on success; `null` omits the header. Default `'public, max-age=3600'`. */
    cacheControl?: string | null;
    /** Directory index files, tried in order for a directory path. Default `['index.html']`. */
    indexNames?: readonly string[];
    /** Serve a generated HTML listing for directories with no index match. Default `false`. */
    listDirectories?: boolean;
    /** 404 file miss + HTML-accepting GET/HEAD → serve the base index. Default `false`. */
    spaFallback?: boolean;
    /** Reject files larger than this many bytes, checked at stat time before the file is opened. `0` = unlimited. Default `0`. */
    maxFileSizeBytes?: number;
    /**
     * Serve dotfiles (any path segment beginning with `.`). Default `false`:
     * dotfile requests answer 403. The standard `.well-known` namespace is
     * always served as the built-in opt-in exception.
     */
    serveDotfiles?: boolean;
}
