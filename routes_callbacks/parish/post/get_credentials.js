import { DBDetails } from "../../../db_utils.js/db_parish_details.js";
import { MongoDBContract } from "../../../db_utils.js/mongodatabase_contract.js";
import { Logger } from "../../../debug_tools/Log.js";

export async function parishGetCredentials(req, resp) {
    const { detail, password } = req.body;

    if (!detail || !password) {
        return resp.json({ 'response': 'invalid log in' });
    }

    Logger.log(req.body)

    let result1, result2;
    result1 = await MongoDBContract
        .findOneByFilterFromCollection(
            DBDetails.adminDB,
            DBDetails.registeredParishesCollection,
            {
                'parish_email': detail,
                'parish_password': password
            });

    if (!result1 || !result1._id) {
        result2 = await MongoDBContract
            .findOneByFilterFromCollection(
                DBDetails.adminDB,
                DBDetails.registeredParishesCollection,
                {
                    'parish_code': detail,
                    'parish_password': password
                });
    }


    return resp.json({ 'response': result1 || result2 });
}