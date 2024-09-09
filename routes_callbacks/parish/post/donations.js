import { DBDetails } from "../../../db_utils.js/db_parish_details.js";
import { MongoDBContract } from "../../../db_utils.js/mongodatabase_contract.js";
import { parishExists } from "../../../server_app/callback_utils.js";

export async function addDonationRecord(req, resp) {
    const { parish_code, parish_password, donation } = req.body;
    if (!parish_code || !parish_password || !donation) {
        return resp.json({ 'response': 'wrong donation details' });
    }

    if (await parishExists(parish_code, parish_password)) {
        let saveResult = await MongoDBContract
            .insertIntoCollection(
                donation,
                parish_code,
                DBDetails.parishDonationsCollection
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


export async function loadAllDonationsRecords(req, resp) {
    const { parish_code, parish_password } = req.body;
    if (!parish_code || !parish_password) {
        return resp.json({ 'response': 'unknown request' });
    }

    if (await parishExists(parish_code, parish_password)) {
        let donationsRecords = await MongoDBContract.findManyByFilterFromCollection(
            parish_code,
            DBDetails.parishDonationsCollection,
            {}
        );
        return resp.json({ 'response': donationsRecords || [] });
    } else {
        return resp.json({ 'response': 'unauthorised request' });
    }
}