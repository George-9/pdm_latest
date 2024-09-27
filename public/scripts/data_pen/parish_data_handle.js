
/**
 * all data handler and access objects
 */
export class ParishDataHandle {
    static allParishEvents = [];
    static outstationLeaders = [];
    static parishMembers = [];
    static parishStaff = [];
    static parishGroups = [];
    static parishOutstations = [];
    static parishSCCs = [];
    /**@type {object[]} */
    static parishAssociations = [];
    static parishTitheRecords = [];
    static parishOfferingRecords = [];
    static parishProjectsRecords = [];
    static parishDonationRecords = [];
    static parishMembersVolumes = [];
    static parishLevelLeaders = [];
    static outstationLevelLeaders = [];

    static SACRAMENTS = {
        'baptism': 'BAPTISM',
        'confirmation': 'CONFIRMATION',
        'reconciliation': 'RECONCILIATION',
        'eucharist': 'EUCHARIST',
        // 'annointing_of_the_sick': 'ANOINTING OF THE SICK',
        'ordination': 'ORDINATION',
        'marriage': 'MARRIAGE',
    }

    constructor() { }
}