import { DBDetails } from "../../../db_utils.js/db_parish_details.js";
import { MongoDBContract } from "../../../db_utils.js/mongodatabase_contract.js";
import { parishExists } from "../../../server_app/callback_utils.js";

/**
 * add a leader to Parish Level
 * if position is not occupied create it and assign member_id 
 * if position exists, update the member_id as the new position-holder
*/
export async function addLeaderToParish(req, resp) {
    const { parish_code, parish_password, position, member_id } = req.body;
    if (!parish_code || !parish_password || !position || !member_id) {
        return resp.json({ 'response': 'empty details' });
    }

    // insert new position if it doesn't exist
    // else update position member_id with new leader
    if (parishExists(parish_code, parish_password)) {
        const result = await MongoDBContract
            .collectionInstance(parish_code, DBDetails.parishLeadersCollection)
            .updateOne(
                { 'position': position },
                { '$set': { 'member_id': member_id }, },
                { 'upsert': true }
            );
        return resp.json({
            'response': (result.modifiedCount + result.upsertedCount > 0) ?
                'success' :
                'something went wrong saving provided details'
        });
    } else {
        return resp.json({ 'response': 'unauthorised request' });
    }
}

/**
 * get all parish leaders
 */
export function getParishLeaders(req, resp) {
    const { parish_code, parish_password } = req.body;
    if (!parish_code || !parish_password) {
        return resp.json({ 'response': 'empty details' });
    }

    if (parishExists(parish_code, parish_password)) {
        MongoDBContract
            .collectionInstance(parish_code, DBDetails.parishLeadersCollection)
            .find({})
            .toArray()
            .then((result) => {
                resp.json({ 'response': result || [] });
            })
            .catch((error) => {
                resp.json({ 'response': 'something went wrong' });
            });
    } else {
        return resp.json({ 'response': 'unauthorised request' });
    }
}
