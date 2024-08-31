import { DBDetails } from "../../../db_utils.js/db_parish_details.js";
import { MongoDBContract } from "../../../db_utils.js/mongodatabase_contract.js";
import { parishExists } from "../../../server_app/callback_utils.js";

export async function addOutstation(req, resp) {
    const { parish_code, parish_password, outstation } = req.body;
    console.log(req.body);

    if (!parish_code || !parish_password || !outstation) {
        return resp.json({ 'response': 'empty outstation' });
    }

    if (await parishExists(parish_code, parish_password)) {

        const regex = new RegExp(`^${outstation['name']}$`, 'i')
        let existingWithSameName = await MongoDBContract
            .findOneByFilterFromCollection(
                parish_code,
                DBDetails.outstationsCollection,
                { 'name': { $regex: regex } },
            );

        if (existingWithSameName && existingWithSameName._id && existingWithSameName._id.id) {
            return resp.json({ 'response': 'cannot create two outstations with the same name' });
        }

        let saveResult = await MongoDBContract
            .insertIntoCollection(
                outstation,
                parish_code,
                DBDetails.outstationsCollection
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