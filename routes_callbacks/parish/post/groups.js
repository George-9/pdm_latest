import { DBDetails } from "../../../db_utils.js/db_parish_details.js";
import { MongoDBContract } from "../../../db_utils.js/mongodatabase_contract.js";
import { parishExists } from "../../../server_app/callback_utils.js";

export async function addGroups(req, resp) {
    const { parish_code, parish_password, group } = req.body;
    if (!parish_code || !parish_password || !group) {
        return resp.json({ 'response': 'empty group details' });
    }

    if (await parishExists(parish_code, parish_password)) {
        let existingWithSameName = await MongoDBContract
            .findOneByFilterFromCollection(
                parish_code,
                DBDetails.parishGroupsCollection,
                { 'name': group['name'] }
            );

        if (existingWithSameName && existingWithSameName._id && existingWithSameName._id.id) {
            return resp.json({
                'response': 'a group with the same name aready exists'
            });
        }

        let saveResult = await MongoDBContract
            .insertIntoCollection(
                group,
                parish_code,
                DBDetails.parishGroupsCollection
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

export async function getParishGroups(req, resp) {
    const { parish_code, parish_password } = req.body;
    if (!parish_code || !parish_password) {
        return resp.json({ 'response': 'empty details' });
    }

    if (await parishExists(parish_code, parish_password)) {
        let groups = await MongoDBContract
            .fetchFromCollection(
                parish_code,
                DBDetails.parishGroupsCollection,
                {}
            );
        return resp.json({ 'response': groups || [] });
    } else {
        return resp.json({ 'response': 'unauthorised request' });
    }
}