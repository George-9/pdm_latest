import { DBDetails } from "../../../db_utils.js/db_parish_details.js";
import { MongoDBContract } from "../../../db_utils.js/mongodatabase_contract.js";
import { Logger } from "../../../debug_tools/Log.js";
import { parishExists } from "../../../server_app/callback_utils.js";

export async function addMember(req, resp) {
    const { parish_code, parish_password, member } = req.body;
    if (!parish_code || !parish_password || !member) {
        return resp.json({ 'response': 'empty details' });
    }

    if (await parishExists(parish_code, parish_password)) {
        let existing = await MongoDBContract
            .collectionInstance(
                parish_code,
                DBDetails.membersCollection
            )
            .aggregate([{ $sort: { 'member_number': -1 } }])
            .limit(1)
            .toArray();

        Logger.log(existing);

        let memberNumber = 1;
        if (existing && existing.length > 0) {
            memberNumber = existing[0]['member_number'] + 1;
        }

        let saveResult = await MongoDBContract
            .insertIntoCollection(
                { ...member, "member_number": memberNumber },
                parish_code,
                DBDetails.membersCollection
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