import { DBDetails } from "../../../db_utils.js/db_parish_details.js";
import { MongoDBContract } from "../../../db_utils.js/mongodatabase_contract.js";
import { Logger } from "../../../debug_tools/Log.js";
import { parishExists } from "../../../server_app/callback_utils.js";

export async function addSCC(req, resp) {
    const { parish_code, parish_password, scc } = req.body;
    if (!parish_code || !parish_password || !scc) {
        return resp.json({ 'response': 'empty outstation' });
    }

    if (await parishExists(parish_code, parish_password)) {

        let existingWithSameName = await MongoDBContract
            .findOneByFilterFromCollection(
                parish_code,
                DBDetails.smallChritianCommunitiesCollection
                , {
                    'name': scc['name'],
                    'outstation_id': scc['outstation_id']
                });

        if (existingWithSameName && existingWithSameName._id && existingWithSameName._id.id) {
            return resp.json({
                'response': 'an SCC with the same name under the same outstation aready exists'
            });
        }

        let saveResult = await MongoDBContract
            .insertIntoCollection(
                scc,
                parish_code,
                DBDetails.smallChritianCommunitiesCollection
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