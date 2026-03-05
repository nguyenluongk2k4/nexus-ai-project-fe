import ReactGA from "react-ga4";

/**
 * Initialize Google Analytics 4
 * @param measurementId The GA4 Measurement ID (G-XXXXXXXXXX)
 */
export const initGA = (measurementId: string) => {
    if (measurementId) {
        ReactGA.initialize(measurementId);
        console.log("[Analytics] GA4 initialized with ID:", measurementId);
    } else {
        console.warn("[Analytics] GA4 Measurement ID is missing. Analytics disabled.");
    }
};

/**
 * Track a page view
 * @param path The URL path to track
 */
export const trackPageView = (path: string) => {
    ReactGA.send({ hitType: "pageview", page: path });
    console.log("[Analytics] Page view tracked:", path);
};

/**
 * Track a custom event
 * @param category Event category (e.g., 'User', 'Navigation')
 * @param action Event action (e.g., 'Click', 'Login')
 * @param label Event label (e.g., 'Button Name', 'Source')
 * @param value Optional numeric value
 */
export const trackEvent = (category: string, action: string, label?: string, value?: number) => {
    ReactGA.event({
        category,
        action,
        label,
        value,
    });
    console.log(`[Analytics] Event tracked: [${category}] ${action} - ${label || ''}`);
};
