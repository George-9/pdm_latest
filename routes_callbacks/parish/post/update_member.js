import { ObjectId } from "mongodb";
import { DBDetails } from "../../../db_utils.js/db_parish_details.js";
import { MongoDBContract } from "../../../db_utils.js/mongodatabase_contract.js";
import { parishExists } from "../../../server_app/callback_utils.js";

export async function updateMemberDetails(req, resp) {
    const { parish_code, parish_password, member } = req.body;
    if (!parish_code || !parish_password || !member) {
        return resp.json({ 'response': 'empty details' });
    }

    let id = new ObjectId(member['_id']);

    delete member['_id'];

    if (await parishExists(parish_code, parish_password)) {
        let updateResult = await MongoDBContract
            .collectionInstance(
                parish_code,
                DBDetails.membersCollection
            ).updateOne({ '_id': id },
                { '$set': member });

        return resp.json({
            'response': ((updateResult.modifiedCount + updateResult.upsertedCount) > 0)
                ? 'success'
                : 'could not save updates'
        });
    } else {
        return resp.json({ 'response': 'unauthorised request' });
    }
}