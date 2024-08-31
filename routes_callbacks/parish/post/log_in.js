import { DBDetails } from "../../../db_utils.js/db_parish_details.js";
import { MongoDBContract } from "../../../db_utils.js/mongodatabase_contract.js";

export async function parishLogInCallback(req, resp) {
    const { email, password } = req.body;

    if (!email || !password) {
        return resp.json({ 'response': 'invalid log in' });
    }

    let result = await MongoDBContract
        .findOneByFilterFromCollection(
            DBDetails.adminDB,
            DBDetails.registeredParishesCollection,
            {
                'parish_email': email,
                'parish_password': password
            });

    if (result && result._id) {
        return resp.json({ 'response': 'success' });
    }

    return resp.json({ 'response': 'account not found' });
}