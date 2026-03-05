/**
 * Utility to format image URLs from the backend.
 * Handles both absolute URLs (Cloudinary) and relative paths (Local Storage).
 */
export const formatImageUrl = (url: string | null | undefined): string | undefined => {
    if (!url) return undefined;

    // If it's already an absolute URL (http, https) or a data URL, return as is
    if (url.startsWith('http') || url.startsWith('https') || url.startsWith('data:')) {
        return url;
    }

    // Otherwise, it's a relative path. Prepend the API base URL.
    // We assume the API_URL environment variable points to http://domain/api
    // We need the root domain, so we strip /api from the end.
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
    const baseUrl = apiUrl.replace(/\/api\/?$/, '');

    // Ensure we don't have double slashes
    const cleanUrl = url.startsWith('/') ? url : `/${url}`;

    return `${baseUrl}${cleanUrl}`;
};
