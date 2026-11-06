/**
 * Options and result shapes for the `create-ndigo-app` scaffold.
 */

/** The scaffoldable application kinds (mirror `ndigo new`). */
export type AppKind = 'browser' | 'node';

/** Parsed CLI flags. */
export interface ScaffoldOptions {
    /** App slug (kebab-case, without the `ndigo-` prefix). */
    name: string;
    /** Scaffold kind. */
    kind: AppKind;
    /** One-line description used in the manifest and README. */
    description: string;
    /** Dev port (defaults to 3000). */
    port: number;
    /** Target directory (relative to the cwd unless absolute). */
    targetDir: string;
    /** When true, accept all defaults without prompting. */
    yes: boolean;
    /** Rewrite `@ndigo/*` deps to `workspace:*` links against the workspace (dev mode). */
    local: boolean;
    /** Force overwrite a non-empty target directory. */
    force: boolean;
}

/** A single file-write plan entry. */
export interface PlannedFile {
    /** Source template path (relative to the templates root). */
    template: string;
    /** Destination path (relative to the target directory). */
    destination: string;
}
