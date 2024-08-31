import { DBDetails } from "../../../db_utils.js/db_parish_details.js";
import { MongoDBContract } from "../../../db_utils.js/mongodatabase_contract.js";
import { parishExists } from "../../../server_app/callback_utils.js";

export async function addOfferingRecord(req, resp) {
    const { parish_code, parish_password, offering } = req.body;
    if (!parish_code || !parish_password || !offering) {
        return resp.json({ 'response': 'bad offering record details' });
    }

    if (await parishExists(parish_code, parish_password)) {
        let saveResult = await MongoDBContract
            .insertIntoCollection(
                offering,
                parish_code,
                DBDetails.offeringCollection
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