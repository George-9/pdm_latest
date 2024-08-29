import { MongoClient } from "mongodb";


export class MongoDBContract {

    static connectedClient() { return new MongoClient('mongodb://localhost:27017') }
    static adminDB() { return MongoDBContract.connectedClient().db('admin') }
    static dbInstance(dbName) { return MongoDBContract.connectedClient().db(dbName) }

    /**
     * checks if a database exists
     * @param {string} dbName 
     * @returns true if the db by name exists
     */
    static async dbExists(dbName) {
        return (await MongoDBContract.adminDB().admin().listDatabases())
            .databases
            .includes(dbName)
    }

    static collectionInstance(dbName, collectionName) {
        return MongoDBContract
            .dbInstance(dbName)
            .collection(collectionName)
    }

    static async fetchFromCollection(dbName, collectionName, { filter = {} }) {
        return await MongoDBContract
            .collectionInstance(dbName, collectionName)
            .find(filter || {})
            .toArray();
    }

    static async deleteOneByFilterFromCollection(dbName, collectionName, filter) {
        if (!filter) {
            return false;
        }

        let result = await MongoDBContract
            .collectionInstance(dbName, collectionName)
            .deleteOne(filter);

        return result.deletedCount;
    }

    static async deleteManyByFilterFromCollection(dbName, collectionName, filter) {
        if (!filter) {
            return false;
        }

        let result = await MongoDBContract
            .collectionInstance(dbName, collectionName)
            .deleteMany(filter);

        return result.deletedCount;
    }

    static async findOneByFilterFromCollection(dbName, collectionName, filter) {
        return await MongoDBContract
            .collectionInstance(dbName, collectionName)
            .findOne(filter)
    }

    static async findManyByFilterFromCollection(dbName, collectionName, filter) {
        return await MongoDBContract
            .collectionInstance(dbName, collectionName)
            .find(filter)
            .toArray();
    }

    static async insertIntoCollection(object, dbName, collectionName) {
        let result = await MongoDBContract
            .collectionInstance(dbName, collectionName)
            .insertOne(object)

        return result.insertedId
    }

    static async insertManyIntoCollection(objects = [], dbName, collectionName) {
        let result = await MongoDBContract
            .collectionInstance(dbName, collectionName)
            .insertMany(objects)

        return result.insertedCount
    }

    static async updateOneFromCollection(filter, new_values = {}) {
        let result = await MongoDBContract
            .collectionInstance(dbName, collectionName)
            .updateOne(filter, { '$set': { ...new_values } });

        return (result.modifiedCount + result.upsertedCount) > 0;
    }

    static async updateManyFromCollection(filter, new_values = {}) {
        let result = await MongoDBContract
            .collectionInstance(dbName, collectionName)
            .updateMany(filter, { '$set': { ...new_values } });

        return (result.modifiedCount + result.upsertedCount) > 0;
    }
}