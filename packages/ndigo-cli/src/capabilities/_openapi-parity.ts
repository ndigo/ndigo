/**
 * The OpenAPI half of the route-parity check: does the app's generated spec
 * describe the operations the manifest's tool mappings claim?
 */

/** The OpenAPI operation keys a path item may carry; no other key counts as an operation. */
const OPENAPI_OPERATION_KEYS = ['get', 'put', 'post', 'delete', 'options', 'head', 'patch', 'trace'] as const;

/**
 * Compares the manifest's tool mappings against the app's OpenAPI document.
 *
 * @param stdout - The captured output of the app's `openapi` script.
 * @param mapped - The manifest's tool mappings, keyed by tool name.
 * @returns One problem per disagreement; empty when the surfaces agree.
 */
export function openApiProblems(
    stdout: string,
    mapped: ReadonlyMap<string, { pattern: string; methods: readonly string[] }>
): string[] {
    let document: { paths?: Record<string, Record<string, unknown>> };
    try {
        document = JSON.parse(stdout) as typeof document;
    } catch {
        return ['the "openapi" script printed invalid JSON'];
    }
    const paths = document.paths ?? {};
    const problems: string[] = [];
    for (const [tool, row] of mapped) {
        const path = row.pattern.replace(/:([A-Za-z0-9_]+)/gu, '{$1}');
        const item = paths[path];
        if (item === undefined) {
            problems.push(`tool '${tool}' has no OpenAPI path ${path}`);
            continue;
        }
        // Without declared httpMethods, accept the path item only when it
        // carries an actual operation — not metadata keys like `summary`.
        const methods =
            row.methods.length > 0
                ? row.methods
                : Object.keys(item).filter((key) => (OPENAPI_OPERATION_KEYS as readonly string[]).includes(key));
        if (!methods.some((method) => item[method.toLowerCase()] !== undefined)) {
            problems.push(`tool '${tool}' has no OpenAPI operation for ${methods.join('/')} ${path}`);
        }
    }
    return problems;
}
