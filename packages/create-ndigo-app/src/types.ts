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
    /** Write the AGENTS.md bootstrap pointer (default: on). */
    agents: boolean;
    /** Write the ndigo-ui pointer and token import (browser kind only; default: off). */
    ui: boolean;
}

/**
 * A single file-write plan entry.
 *
 * The plan is resolved before anything is written, so a conditional file
 * (`--ui`'s pointer and stylesheet) sits beside the template tree instead of
 * becoming a second template source.
 */
export interface PlannedFile {
    /** Destination path, relative to the target directory. */
    destination: string;
    /** Final file content, placeholders already substituted. */
    content: string;
    /** Source template path, relative to the templates root; absent for inline files. */
    template?: string;
}
