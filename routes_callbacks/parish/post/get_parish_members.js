import { DBDetails } from "../../../db_utils.js/db_parish_details.js";
import { MongoDBContract } from "../../../db_utils.js/mongodatabase_contract.js";
import { parishExists } from "../../../server_app/callback_utils.js";

export async function getAllParishMembers(req, resp) {
    const { parish_code, parish_password } = req.body;
    if (!parish_code || !parish_password) {
        return resp.json({ 'response': 'empty details' });
    }

    if (await parishExists(parish_code, parish_password)) {
        let members = await MongoDBContract
            .fetchFromCollection(
                parish_code,
                DBDetails.membersCollection,
                {}
            );

        return resp.json({ 'response': members || [] });
    } else {
        return resp.json({ 'response': 'unauthorised request' });
    }
}