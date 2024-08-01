
/**
 * Handles navigating between different URLs(pages)
 *  on the browser
 * 
 * @author George Muigai Njau
 */
export class SimplifiedNavigator {

    /**
     * Replaces the current browser path(location)
     * @param {string} route the route/path to that
     *  replaces the current
     */
    static NavigateByReplacement(route = '') {
        window.location.replace(route);
    }

    /**
     * navigates to the new URL stacking it "on top" of the
     * current
     * @param {string} route the new browser location
     */
    static Navigate(route = '') {
        window.location.href = route;
    }
}