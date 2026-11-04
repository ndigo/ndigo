/**
 * @module ndigo-router
 * @since 1.0.0
 * @author Jeff Rose
 */
const normalizePath = (path: string): string => {
    if (!path || path === '/') {
        return '/';
    }

    const prefixedPath = path.startsWith('/') ? path : `/${path}`;

    return prefixedPath.endsWith('/') ? prefixedPath.slice(0, -1) : prefixedPath;
};

/**
 * Normalize a route partition prefix.
 *
 * @param {string} prefix The partition prefix to normalize.
 * @returns {string} A normalized partition prefix.
 */
export const normalizePartitionPrefix = (prefix: string): string => normalizePath(prefix);

/**
 * Determine whether `path` belongs to `prefix` partition.
 *
 * @param {string} path The full shell route path.
 * @param {string} prefix The feature partition prefix.
 * @returns {boolean} Whether `path` belongs to `prefix`.
 */
export const matchesPartitionPath = (path: string, prefix: string): boolean => {
    const normalizedPath = normalizePath(path);
    const normalizedPrefix = normalizePartitionPrefix(prefix);

    if (normalizedPrefix === '/') {
        return true;
    }

    return normalizedPath === normalizedPrefix || normalizedPath.startsWith(`${normalizedPrefix}/`);
};

/**
 * Strip a shell partition prefix from a full route path to produce feature-local route.
 *
 * @param {string} path The full shell route path.
 * @param {string} prefix The feature partition prefix.
 * @returns {string} The feature-local route (always rooted with `/`).
 */
export const stripPartitionPrefix = (path: string, prefix: string): string => {
    const normalizedPath = normalizePath(path);
    const normalizedPrefix = normalizePartitionPrefix(prefix);

    if (normalizedPrefix === '/') {
        return normalizedPath;
    }

    if (!matchesPartitionPath(normalizedPath, normalizedPrefix)) {
        return normalizedPath;
    }

    const stripped = normalizedPath.slice(normalizedPrefix.length);

    return stripped.length ? stripped : '/';
};

/**
 * Restore a shell partition prefix for a feature-local route path.
 *
 * @param {string} path The feature-local route path.
 * @param {string} prefix The feature partition prefix.
 * @returns {string} The full shell route path.
 */
export const restorePartitionPrefix = (path: string, prefix: string): string => {
    const normalizedPath = normalizePath(path);
    const normalizedPrefix = normalizePartitionPrefix(prefix);

    if (normalizedPrefix === '/') {
        return normalizedPath;
    }

    if (normalizedPath === '/') {
        return normalizedPrefix;
    }

    if (matchesPartitionPath(normalizedPath, normalizedPrefix)) {
        return normalizedPath;
    }

    return `${normalizedPrefix}${normalizedPath}`;
};
