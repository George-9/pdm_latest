const { MongoClient } = require('mongodb')
const { DBConstants } = require('./dbConstants');
const { DebugUtils } = require('../server/utils/debug_utils');

const ConnectedClient = new MongoClient(DBConstants.DB_CONN_STRING);
/**
 * Provides basic functionallity, properties and simplified databases' access
 * and operations
 */
class DBUtils {

    static CONNECTED_DB_CLI(dbName) {
        return ConnectedClient.db(dbName)
    }

    /**
     * checks if a database exists
     * @param {string} dbName the database name
     */
    static async DB_EXISTS(dbName) {
        const allDbs = (await DBUtils.CONNECTED_DB_CLI(DBConstants.MONGODB_PERMANENT_DB_NAME).admin().listDatabases()).databases
        console.log('dbs -> ', allDbs);
        return allDbs.find(db => db.name === dbName);
    }

    static async DB_FIND_ALL(dbName, collectionName) {
        return await DBUtils.CONNECTED_DB_CLI(dbName).collection(collectionName).find().toArray()
    }

    /// checks if this admin exists as a pdm admin
    static async PDM_SYS_ADMIN_EXISTS(adminEmail, adminPassword) {
        const found = await DBUtils
            .CONNECTED_DB_CLI(DBConstants.SYS_ADMIN_DB_NAME)
            .collection(DBConstants.SYS_ADMIN_COLLECTION)
            .findOne({ 'email': adminEmail, 'password': adminPassword });

        if (found === null) {
            return false;
        }

        return found._id ? true : false;
    }

    static async PARISH_EXISTS(parishCode, parishPassword) {
        const parish = await DBUtils.CONNECTED_DB_CLI(DBConstants.REGISTERED_PARISHES_DB_NAME)
            .collection(DBConstants.REGISTERED_PARISHES_COLLECTION)
            .findOne({
                code: parishCode,
                password: parishPassword
            });

        // TODO: fix this check
        if (parish !== null) {
            return parish._id !== null ? true : false;
        }
        return false;
    }

    static DB_ADMIN() {
        return ConnectedClient.db(DBConstants.MONGODB_PERMANENT_DB_NAME).admin()
    }

    static async CREATE_COLLECTION(dbName, collectionName) {
        (await ConnectedClient.db(dbName).createCollection(collectionName));
        return ((await ConnectedClient.db(dbName).collections()).includes(collectionName));
    }

    static async INSERT_TO_COLLECTION(dbName, collectionName, object = new Object()) {
        return (await ConnectedClient.db(dbName).collection(collectionName).insertOne(object)).insertedId.toString().length > 4;
    }

    static async GET_ALL_FROM_COLLECTION(dbName, collectionName) {
        return await ConnectedClient.db(dbName)
            .collection(collectionName)
            .find()
            .toArray()
    }
}

module.exports = { ConnectedClient, DBUtils }