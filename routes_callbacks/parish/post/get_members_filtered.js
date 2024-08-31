import { DBDetails } from "../../../db_utils.js/db_parish_details.js";
import { MongoDBContract } from "../../../db_utils.js/mongodatabase_contract.js";

export async function getMembersFiltered(req, resp) {
    const { parish_code, parish_password, filter } = req.body;
    if (!parish_code || !parish_password) {
        return resp.json({ 'response': 'empty details' });
    }

    if (await parishExists(parish_code, parish_password)) {
        let members = await MongoDBContract
            .fetchFromCollection(
                parish_code,
                DBDetails.outstationsCollection,
                filter || {}
            );

        return resp.json({ 'response': members || [] });
    } else {
        return resp.json({ 'response': 'unauthorised request' });
    }
}
