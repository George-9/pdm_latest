import { DBDetails } from "../../../db_utils.js/db_parish_details.js";
import { MongoDBContract } from "../../../db_utils.js/mongodatabase_contract.js";
import { Logger } from "../../../debug_tools/Log.js";

export async function parishGetCredentials(req, resp) {
    const { email, password } = req.body;

    if (!email || !password) {
        return resp.json({ 'response': 'invalid log in' });
    }

    Logger.log(req.body)

    let result = await MongoDBContract
        .findOneByFilterFromCollection(
            DBDetails.adminDB,
            DBDetails.registeredParishesCollection,
            {
                'parish_email': email,
                'parish_password': password
            });

    return resp.json({ 'response': result });
}