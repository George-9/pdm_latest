import { ObjectId } from "mongodb";
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

// Update SCC
export async function updateSCC(req, resp) {
    const { parish_code, parish_password, scc } = req.body;
    if (!parish_code || !parish_password || !scc) {
        return resp.json({ 'response': 'empty details' });
    }
    const id = scc['_id'];
    delete scc['_id'];

    if (await parishExists(parish_code, parish_password)) {
        let updateResult = await MongoDBContract
            .collectionInstance(
                parish_code,
                DBDetails.smallChritianCommunitiesCollection
            ).updateOne({ '_id': new ObjectId(id) },
                { '$set': scc });

        return resp.json({
            'response': ((updateResult.modifiedCount + updateResult.upsertedCount) > 0)
                ? 'success'
                : 'could not save updates'
        });

    } else {
        return resp.json({ 'response': 'unauthorised request' });
    }
}

// Delete SCC
export async function deleteSCC(req, resp) {
    const { parish_code, parish_password, scc_id } = req.body;
    if (!parish_code || !parish_password || !scc_id) {
        return resp.json({ 'response': 'empty details' });
    }

    if (await parishExists(parish_code, parish_password)) {
        let deleteResult = await MongoDBContract
            .deletedOneByFilterFromCollection(
                parish_code,
                DBDetails.smallChritianCommunitiesCollection,
                { '_id': scc_id }
            );

        return resp.json({
            'response': deleteResult
                ? 'success'
                : 'could not delete'
        });
    } else {
        return resp.json({ 'response': 'unauthorised request' });
    }
}

// Get all SCCs
export async function getAllSCCs(req, resp) {
    const { parish_code, parish_password } = req.body;
    if (!parish_code || !parish_password) {
        return resp.json({ 'response': 'empty details' });
    }

    if (await parishExists(parish_code, parish_password)) {
        let sccs = await MongoDBContract
            .fetchFromCollection(
                parish_code,
                DBDetails.smallChritianCommunitiesCollection,
                {}
            );

        return resp.json({ 'response': sccs || [] });
    } else {
        return resp.json({ 'response': 'unauthorised request' });
    }
}

// Get SCCs by outstation
export async function getSCCsByOutstation(req, resp) {
    const { parish_code, parish_password, outstation_id } = req.body;
    if (!parish_code || !parish_password || !outstation_id) {
        return resp.json({ 'response': 'empty details' });
    }

    if (await parishExists(parish_code, parish_password)) {
        let sccs = await MongoDBContract
            .findManyByFilterFromCollection(
                parish_code,
                DBDetails.smallChritianCommunitiesCollection,
                { 'outstation_id': outstation_id }
            );

        return resp.json({ 'response': sccs || [] });
    } else {
        return resp.json({ 'response': 'unauthorised request' });
    }
}

// Get SCCs by outstation and name
export async function getSCCsByOutstationAndName(req, resp) {
    const { parish_code, parish_password, details } = req.body;
    if (!parish_code || !parish_password || !details) {
        return resp.json({ 'response': 'empty details' });
    }

    if (await parishExists(parish_code, parish_password)) {
        let sccs = await MongoDBContract
            .findManyByFilterFromCollection(
                parish_code,
                DBDetails.smallChritianCommunitiesCollection,
                {
                    'outstation_id': details['outstation_id'],
                    'name': details['name']
                }
            );

        return resp.json({ 'response': sccs || [] });
    } else {
        return resp.json({ 'response': 'unauthorised request' });
    }
}
