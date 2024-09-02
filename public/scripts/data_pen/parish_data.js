
/**
 * returns the mebers of a given outstation
 * @param {string} outstationId 
 * @param {object[]} parishMembers 
 */
export function getOutstationMembers(parishMembers = [], outstation = '') {
    return parishMembers.filter(function (member) {
        return member['outstation_id'] === (outstation['_id'] || (JSON.parse(outstation))['_id']);
    });
}


/**
 * Retrieves al the members of a given SCC
 * 
 * @param {object[]} parishMembers 
 * @param {string} sccId 
 * @returns {object[]} list of members
 */
export function getSCCMembers(parishMembers = [], scc) {
    let SCCId = (scc['_id'] || (JSON.parse(scc))['_id'])

    return parishMembers.filter(function (member) {
        return member['scc_id'] === SCCId;
    });
}

/**
 * Retrieves all the SCCs of a given Outstation
 * 
 * @param {[]} parishSCCs Small Christian Communities
 * @param {string} outstationId the outstation
 * @returns {object[]} list of SCCs
 */
export function getOutstationSCCs(parishSCCs = [], outstation = '') {
    return parishSCCs.filter(function (SCC) {
        return SCC['outstation_id'] === (outstation['_id'] || (JSON.parse(outstation))['_id']);
    })
}