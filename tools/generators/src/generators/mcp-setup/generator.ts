/**
 * `mcp-setup` generator — wires @ndigo/mcp into an application.
 */
import { formatFiles, generateFiles, type Tree } from '@nx/devkit';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));

/** Options for the `mcp-setup` generator. */
export interface McpSetupGeneratorSchema {
    /** Application directory (repo-relative or absolute). */
    directory: string;
}

/**
 * Writes the MCP wiring module and a sample tool controller.
 *
 * @param tree - The Nx virtual tree.
 * @param schema - The application directory.
 * @returns A promise that resolves once the files are formatted.
 */
export default async function mcpSetupGenerator(tree: Tree, schema: McpSetupGeneratorSchema): Promise<void> {
    generateFiles(tree, join(__dirname, 'files'), schema.directory, { tmpl: '' });
    await formatFiles(tree);
}
