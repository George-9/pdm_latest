import { DBDetails } from "../../../db_utils.js/db_parish_details.js";
import { MongoDBContract } from "../../../db_utils.js/mongodatabase_contract.js";
import { parishExists } from "../../../server_app/callback_utils.js";
import { Logger } from '../../../debug_tools/Log.js'
import { ObjectId } from "mongodb";


export async function addParishStaff(req, resp) {
    const { parish_code, parish_password, staff } = req.body;
    if (!parish_code || !parish_password || !staff) {
        return resp.json({ 'response': 'empty details' });
    }

    if (await parishExists(parish_code, parish_password)) {
        let saveResult = await MongoDBContract
            .insertIntoCollection(
                staff,
                parish_code,
                DBDetails.parishStaffCollection
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

export async function loadAllParishStaff(req, resp) {
    const { parish_code, parish_password } = req.body;
    if (!parish_code || !parish_password) {
        return resp.json({ 'response': 'empty request' });
    }

    if (await parishExists(parish_code, parish_password)) {
        let staffDocuments = await MongoDBContract
            .fetchFromCollection(
                parish_code,
                DBDetails.parishStaffCollection,
                {}
            );

        return resp.json({ 'response': staffDocuments || [] });
    } else {
        return resp.json({ 'response': 'unauthorised request' });
    }
}

/**
 *  @todo add update staff
 */
export async function updateStaff(req, resp) {
    const { parish_code, parish_password, staff } = req.body;
    if (!parish_code || !parish_password || !staff) {
        return resp.json({ 'response': 'empty details' });
    }
    const id = new ObjectId(staff['_id']);
    delete staff['_id'];

    console.log(staff);

    if (await parishExists(parish_code, parish_password)) {
        let updateResult = await MongoDBContract
            .collectionInstance(
                parish_code,
                DBDetails.parishStaffCollection
            ).updateOne({ '_id': id },
                { '$set': staff });

        return resp.json({
            'response': ((updateResult.modifiedCount + updateResult.upsertedCount) > 0)
                ? 'success'
                : 'could not save updates'
        });
    } else {
        return resp.json({ 'response': 'unauthorised request' });
    }
}
