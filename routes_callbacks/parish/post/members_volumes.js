import { DBDetails } from "../../../db_utils.js/db_parish_details.js";
import { MongoDBContract } from "../../../db_utils.js/mongodatabase_contract.js";
import { parishExists } from "../../../server_app/callback_utils.js";

/**
 * add volumes by number e.g. volume_1, volume_2
 * just volume name[volume_n] where n is the current number of volumes
 * 
 * @param {Request} req request object for express client
 * @param {Response} resp response object for express client
 */
async function addVolume(req, resp) {
    const { volume, parish_code, parish_password } = req.body;

    if (!volume || !parish_code || !parish_password) {
        return resp.json({ 'response': 'empty details' });
    }

    if (await parishExists(parish_code, parish_password)) {
        let saveResult = await MongoDBContract
            .insertIntoCollection(
                volume,
                parish_code,
                DBDetails.parishMembersVolumesCollection
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

/**
 * fetch all volumes for the current parish
 * 
 * @param {Request} req request object for express client
 * @param {Response} resp response object for express client
 */
async function getVolumes(req, resp) {
    const { parish_code, parish_password } = req.body;

    if (!parish_code || !parish_password) {
        return resp.json({ 'response': 'empty details' });
    }

    if (await parishExists(parish_code, parish_password)) {
        let volumes = await MongoDBContract
            .fetchFromCollection(
                parish_code,
                DBDetails.parishMembersVolumesCollection,
                {}
            );

        return resp.json({ 'response': volumes || [] });
    } else {
        return resp.json({ 'response': 'unauthorised request' });
    }
}

export { addVolume, getVolumes };
