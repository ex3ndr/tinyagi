export function normalizeUrl(src: string) {
    src = src.trim();
    if (src.endsWith('/')) {
        src = src.slice(0, -1);
    }
    return src;
}