import { Post } from "../net_tools.js"

/**
 * all parish events
 */
export async function parishEvents() {
    let parishEvents = await Post('/parish/events', null, { 'requiresParishDetails': true });
    return parishEvents['response'];
}

/**
 * fetches the whole list of parish members
 * @returns { object[] }
 */
export async function getParishMembers() {
    return (await Post(
        '/parish/load/all/members', {},
        {
            'requiresParishDetails': true
        }))['response']
}

/**
 * fetches the whole list of parish outstation
 * @returns { object[] }
 */
export async function getParishOutstations() {
    return (await Post(
        '/parish/load/all/outstations', {},
        {
            'requiresParishDetails': true
        }))['response']
}

/**
 * fetches the whole list of parish SCCs
 * @returns { object[] }
 */
export async function getParishSCCs() {
    return (await Post(
        '/parish/load/all/sccs', {},
        {
            'requiresParishDetails': true
        }))['response']
}


/**
 * fetches the whole list of parish offering records
 * @returns { object[] }
 */
export async function getParishOfferings() {
    return (await Post(
        '/parish/load/all/offering/records', {},
        {
            'requiresParishDetails': true
        }))['response']
}