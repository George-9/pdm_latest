export class DBDetails {
    constructor() { }

    /**
     * admin
     */
    static adminDB = 'pdm'
    static adminCollection = 'pdm_admin';
    static registeredParishesCollection = 'registered_parishes';

    /**
     * Users/Parishes
     */
    static parishDetailsCollection = 'details';
    static membersCollection = 'members';
    static parishLeadersCollection = 'parish_leaders';
    static parishStaffCollection = 'parish_staff';
    static parishAssociationsCollection = 'asscoiations';
    static smallChritianCommunitiesCollection = 'small_christian_communties';
    static parishGroupsCollection = 'groups';
    static titheCollection = 'tithe';
    static offeringCollection = 'offering';
    static outstationsCollection = 'outstations';
    static projectsCollection = 'projects';
    static eventsCollection = 'parish_events';
    static parishDonationsCollection = 'donations';
    static parishMembersVolumesCollection = 'members_volumes';
}