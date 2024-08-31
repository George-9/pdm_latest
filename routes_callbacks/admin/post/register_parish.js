import { DBDetails } from "../../../db_utils.js/db_parish_details.js";
import { MongoDBContract } from "../../../db_utils.js/mongodatabase_contract.js";
import { Logger } from "../../../debug_tools/Log.js";

export async function RegisterParish(req, resp) {
    const {
        admin_code,
        admin_password,
        parish_name,
        parish_code,
        parish_email,
        parish_password
    } = req.body;

    Logger.log(req.body);

    let db = DBDetails.adminDB, collection = DBDetails.registeredParishesCollection;
    if ((await MongoDBContract.PDM_ADMIN_EXISTS(admin_code, admin_password))) {
        let existingByCode = await MongoDBContract.findOneByFilterFromCollection(
            db,
            collection, {
            'parish_code': parish_code
        });

        if (existingByCode && existingByCode._id) {
            return resp.json({
                'response': 'a parish with the given code alredy exists'
            });
        }

        let saved = await MongoDBContract.insertIntoCollection({
            parish_name: parish_name,
            parish_code: parish_code,
            parish_email: parish_email,
            parish_password: parish_password
        },
            DBDetails.adminDB,
            DBDetails.registeredParishesCollection
        );

        if (saved) {
            return resp.json({ 'response': 'success' });
        }
    } else {
        return resp.json({ 'response': 'unauthorised access' });
    }
}