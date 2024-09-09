import { PRIESTS_COMMUNITY_NAME } from "../data_source/other_sources.js";
import { ParishDataHandle } from "./parish_data_handle.js";

export function memberGetOutstation(member) {
    return ParishDataHandle
        .parishOutstations
        .find(function (o) { return o['_id'] === member['outstation_id'] });
}

export function memberGetSCC(member) {
    return ParishDataHandle
        .parishSCCs
        .find(function (scc) { return scc['_id'] === member['scc_id'] })
        ||
    {
        '_id': PRIESTS_COMMUNITY_NAME,
        'name': PRIESTS_COMMUNITY_NAME
    };
}

/**
 * Retrieves all the SCCs of a given Outstation
 * 
 * @param {string} outstationId the outstation
 * @returns {object[]} list of SCCs
 */
export function getOutstationSCCs(outstation = '') {
    return ParishDataHandle.parishSCCs.filter(function (SCC) {
        return SCC['outstation_id'] === (outstation['_id'] || (JSON.parse(outstation))['_id']);
    })
}

/**
 * returns the mebers of a given outstation
 * @param {object | string} outstationId
 */
export function getOutstationMembers(outstation = '') {
    return ParishDataHandle
        .parishMembers
        .filter(function (member) {
            return member['outstation_id'] === (outstation['_id'] || (JSON.parse(outstation))['_id']);
        });
}

/**
 * Retrieves al the members of a given SCC
 * 
 * @param {string} sccId 
 * @returns {object[]} list of members
 */
export function getSCCMembers(scc, outstation) {
    let outstationMmebers = getOutstationMembers(outstation);
    let SCCId = (scc['_id'] || (JSON.parse(scc))['_id'])

    return outstationMmebers.filter(function (member) {
        return member['scc_id'] === SCCId;
    });
}


/**
 * Retrieves al the members of a given SCC from a specific list of members
 * 
 * @param {string} sccId 
 * @param {object[]} [members=[]] 
 * @returns {object[]} list of members
 */
export function getSCCMembersFromList(members = [], scc) {
    let SCCId = (scc['_id'] || (JSON.parse(scc))['_id'])

    return members.filter(function (member) {
        return member['scc_id'] === SCCId;
    });
}

/**
 * retrieves an outstation by it's id
 * @param {string} id outstation id
 * @returns {object} outstation
 */
export function getOutstationById(id = '') {
    return ParishDataHandle.parishOutstations.find(function (outstation) {
        return (outstation['_id'] || (JSON.parse(outstation))['_id']) === id;
    })
}

/**
 * Retrieves a member by a given id
 * 
 * @param { string } memberId
 * @returns { object } member
 */
export function getMemberById(memberId) {
    return ParishDataHandle.parishMembers.find(function (member) {
        return member['_id'] === memberId;
    });
}

/**
 * Retrieves an SCC by a given id
 * 
 * @param { string } sccID
 * @returns { object } SCC
 */
export function getSCCById(sccID) {
    return (
        ParishDataHandle.parishSCCs.find(function (SCC) { return SCC['_id'] === sccID; })
        ||
        { '_id': PRIESTS_COMMUNITY_NAME, 'name': PRIESTS_COMMUNITY_NAME }
    );
}

// /**
//  * gets the tithe records of those members who belong to this SCC
//  * @param {object} SCC
//  */
// export function SCCGetTitheRecords(SCC) {
//     const SCCMembers = getSCCMembers(SCC,ou);
//     return ParishDataHandle.parishTitheRecords.filter(function (titheRecord) {
//         return SCCMembers.some(function (SCCMember) {
//             return SCCMember['_id'] === titheRecord['member_id']
//         })
//     });
// }


/**
 * get members without SCC PRIEST COMMUNITY GROUP
 * @returns {object[]} list of members
 */
export function getAllMembersWithoutSCC() {
    return ParishDataHandle.parishMembers.filter(function (member) {
        return member['scc_id'] === PRIESTS_COMMUNITY_NAME;
    }) || [];
}


export function obtainObjectValueBykey(object, key) {
    if (object && (typeof object === 'object') && key) {
        const keys = Object.keys(object);
        return object['key'];
    }
}