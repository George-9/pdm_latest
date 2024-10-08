import { DBDetails } from "../../../db_utils.js/db_parish_details.js";
import { MongoDBContract } from "../../../db_utils.js/mongodatabase_contract.js";
import { parishExists } from "../../../server_app/callback_utils.js";

export async function addTitheRecord(req, resp) {
    const { parish_code, parish_password, tithe } = req.body;
    if (!parish_code || !parish_password || !tithe) {
        return resp.json({ 'response': 'wrong tithe details' });
    }

    if (await parishExists(parish_code, parish_password)) {
        let saveResult = await MongoDBContract
            .insertIntoCollection(
                tithe,
                parish_code,
                DBDetails.titheCollection
            );

        return resp.json({
            'response': saveResult
                ? 'success'
                : 'something went wrong'
        });
    } else {
        return resp.json({ 'response': 'unauthorised request' });
    }
}

export async function addTitheRecordByOutstation(req, resp) {
    const { parish_code, parish_password, tithe } = req.body;
    if (!parish_code || !parish_password || !tithe) {
        return resp.json({ 'response': 'wrong tithe details' });
    }

    if (await parishExists(parish_code, parish_password)) {
        let saveResult = await MongoDBContract
            .insertIntoCollection(
                tithe,
                parish_code,
                DBDetails.titheByOutstationsCollection
            );

        return resp.json({
            'response': saveResult
                ? 'success'
                : 'something went wrong'
        });
    } else {
        return resp.json({ 'response': 'unauthorised request' });
    }
}

export async function loadAllOutstationLevelTitheRecords(req, resp) {
    const { parish_code, parish_password } = req.body;
    if (!parish_code || !parish_password) {
        return resp.json({ 'response': 'unknown request' });
    }

    if (await parishExists(parish_code, parish_password)) {
        let offeringRecords = await MongoDBContract.findManyByFilterFromCollection(
            parish_code,
            DBDetails.titheByOutstationsCollection,
            {}
        );

        return resp.json({ 'response': offeringRecords || [] });
    } else {
        return resp.json({ 'response': 'unauthorised request' });
    }
}