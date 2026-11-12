/**
 * Shared fixtures for stories whose canonical markup expects media.
 */

const PLACEHOLDER = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 360">
    <defs>
        <linearGradient id="brand" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stop-color="#2aa198" />
            <stop offset="1" stop-color="#268bd2" />
        </linearGradient>
    </defs>
    <rect width="640" height="360" fill="url(#brand)" />
    <text x="50%" y="50%" fill="#fdf6e3" font-family="system-ui, sans-serif" font-size="40" text-anchor="middle" dominant-baseline="middle">Ndigo</text>
</svg>`;

/** A network-free stand-in for the image in the README examples. */
export const PLACEHOLDER_IMAGE = `data:image/svg+xml,${encodeURIComponent(PLACEHOLDER)}`;
