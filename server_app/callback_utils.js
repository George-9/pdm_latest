import { DBDetails } from "../db_utils.js/db_parish_details.js";
import { MongoDBContract } from "../db_utils.js/mongodatabase_contract.js";

export async function parishExists(parish_code, password) {
    let result = await MongoDBContract
        .findOneByFilterFromCollection(
            DBDetails.adminDB,
            DBDetails.registeredParishesCollection,
            {
                'parish_code': parish_code,
                'parish_password': password
            }
        );

    return result !== null && result._id !== null && result._id.id !== null;
}