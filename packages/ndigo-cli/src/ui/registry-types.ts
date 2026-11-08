/**
 * Shapes of the shadcn-compatible registry files `ndigo ui` reads.
 */

/**
 * One file entry in a registry item.
 */
export interface RegistryFile {
    /** Path relative to the chunk that declared the item. */
    readonly path: string;
    /** Registry file type (`registry:ui`, `registry:file`, ...). */
    readonly type: string;
    /** Install target; required for `registry:file` and `registry:page`. */
    readonly target?: string;
    /** Inlined file body; when absent, `path` is read or fetched. */
    readonly content?: string;
}

/**
 * One item in a registry chunk.
 */
export interface RegistryItem {
    /** Unique item name, e.g. `dialog`. */
    readonly name: string;
    /** Registry item type, e.g. `registry:ui`. */
    readonly type: string;
    /** Human-readable title. */
    readonly title?: string;
    /** One-line description. */
    readonly description?: string;
    /** npm dependencies required by the item. */
    readonly dependencies?: readonly string[];
    /** Registry item names this item needs. */
    readonly registryDependencies?: readonly string[];
    /** Files the item installs. */
    readonly files?: readonly RegistryFile[];
}

/**
 * A registry chunk (`registry.json`).
 */
export interface RegistryChunk {
    /** Registry name (root chunks only). */
    readonly name?: string;
    /** Registry homepage (root chunks only). */
    readonly homepage?: string;
    /** Items declared in this chunk. */
    readonly items?: readonly RegistryItem[];
    /** Nested registry files to merge. */
    readonly include?: readonly string[];
}

/**
 * An item plus the location of the chunk that declared it.
 */
export interface LocatedRegistryItem extends RegistryItem {
    /** Directory or URL the item's file paths are relative to. */
    readonly base: string;
    /** The root registry source the item came from. */
    readonly source: string;
}

/**
 * A fully merged registry, with includes resolved.
 */
export interface LoadedRegistry {
    /** Root source (absolute path or URL). */
    readonly source: string;
    /** Every item, in include order. */
    readonly items: readonly LocatedRegistryItem[];
}
