import { ParishDataHandle } from "./parish_data_handle.js";

export function memberGetOutstation(member) {
    return ParishDataHandle
        .parishOutstations
        .find(function (o) { return o['_id'] === member['outstation_id'] });
}

export function memberGetSCC(member) {
    return ParishDataHandle
        .parishSCCs
        .find(function (scc) { return scc['_id'] === member['scc_id'] });
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
 * @param {string} outstationId
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
export function getSCCMembers(scc) {
    let SCCId = (scc['_id'] || (JSON.parse(scc))['_id'])

    return ParishDataHandle.parishMembers.filter(function (member) {
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
