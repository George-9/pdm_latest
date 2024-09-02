import { Post } from "../net_tools.js";

/**
 * all parish events
 */
export async function parishEvents() {
    let parishEvents = await Post('/parish/events', null, { 'requiresParishDetails': true });
    return parishEvents['response'];
}
