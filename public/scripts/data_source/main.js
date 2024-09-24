import { Post } from "../net_tools.js"

/**
 * all parish events
 */
export async function getParishEvents() {
    let parishEvents = await Post('/parish/events', null, { 'requiresParishDetails': true });
    return parishEvents['response'];
}

/**
 * fetches the whole list of parish members
 * @returns { Promise<object[]> }
 */
export async function getParishMembers() {
    return (await Post(
        '/parish/load/all/members', {},
        {
            'requiresParishDetails': true
        }))['response']
}

/**
 * fetches all members' volumes
 * @returns {Promise<string[]>}
 */
export async function getParishMembersVolumes() {
    return (await Post(
        '/parish/load/all/members/volumes', {},
        {
            'requiresParishDetails': true
        }))['response']
}


/**
 * fetches the whole list of parish staff
 * @returns { object[] }
 */
export async function getParishStaff() {
    return (await Post(
        '/parish/load/all/staff', {},
        {
            'requiresParishDetails': true
        }))['response']
}


/**
 * fetches the whole list of parish groups
 * @returns { object[] }
 */
export async function getParishGroups() {
    return (await Post(
        '/parish/load/all/groups', {},
        {
            'requiresParishDetails': true
        }))['response']
}

/**
 * fetches the whole list of parish associations
 * @returns { object[] }
 */
export async function getParishAssociations() {
    return (await Post(
        '/parish/load/all/associations', {},
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
export async function getParishOfferingsRecords() {
    return (await Post(
        '/parish/load/all/offering/records', {},
        {
            'requiresParishDetails': true
        }))['response']
}

/**
 * fetches the whole list of parish offering records
 * @returns { object[] }
 */
export async function getParishGroupsRecords() {
    return (await Post(
        '/parish/load/all/groups/records', {},
        {
            'requiresParishDetails': true
        }))['response']
}



/**
 * fetches the whole list of parish tithe records
 * @returns { object[] }
 */
export async function getParishTitheRecords() {
    return (await Post(
        '/parish/load/all/tithe/records',
        {},
        {
            'requiresParishDetails': true
        }))['response']
}

/**
 * fetches the whole list of parish projects records
 * @returns { object[] }
 */
export async function getParishProjectsRecords() {
    return (await Post(
        '/parish/load/all/projects/records',
        {},
        {
            'requiresParishDetails': true
        }))['response']
}

/**
 * fetches the whole list of parish donations records
 * @returns { object[] }
 */
export async function getParishDonationsRecords() {
    return (await Post(
        '/parish/load/all/donations/records',
        {},
        {
            'requiresParishDetails': true
        }))['response']
}