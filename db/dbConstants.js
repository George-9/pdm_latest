class DBConstants {
    static DB_CONN_STRING = 'mongodb://127.0.0.1:27017'

    static MONGODB_PERMANENT_DB_NAME = 'admin'

    static SYS_ADMIN_DB_NAME = 'sys_admin'
    static SYS_ADMIN_COLLECTION = 'admins'

    static REGISTERED_PARISHES_DB_NAME = 'registered_parishes'
    static REGISTERED_PARISHES_COLLECTION = 'parishes'

    static REMINDERS_COLLECTION = 'reminders';
    static EVENTS_COLLECTION = 'events';

    /**
     * For storing basic parish details
     */
    static PARISH_OFFICE_COLLECTION = 'office'
    static PARISH_MEMBERS_COLLECTION = 'members'
    static PARISH_OUTSTATIONS_COLLECTION = 'outstations'
    static PARISH_GROUPS_COLLECTION = 'groups'
}

module.exports = { DBConstants }