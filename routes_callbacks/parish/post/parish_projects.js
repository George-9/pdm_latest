import { ObjectId } from "mongodb";
import { DBDetails } from "../../../db_utils.js/db_parish_details.js";
import { MongoDBContract } from "../../../db_utils.js/mongodatabase_contract.js";
import { Logger } from "../../../debug_tools/Log.js";
import { parishExists } from "../../../server_app/callback_utils.js";

export async function addProjectRecord(req, resp) {
    const { parish_code, parish_password, project } = req.body;
    if (!parish_code || !parish_password || !project) {
        return resp.json({ 'response': 'bad projects record details for parish' });
    }

    if (await parishExists(parish_code, parish_password)) {
        let saveResult = await MongoDBContract
            .insertIntoCollection(
                { ...project, contributions: [] },
                parish_code,
                DBDetails.projectsCollection
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


export async function addContributionToProjectRecord(req, resp) {
    const { parish_code, parish_password, contribution } = req.body;
    console.log(req.body);

    if (!parish_code || !parish_password || !contribution) {
        return resp.json({ 'response': 'bad request' });
    }

    const id = contribution['project_id'];

    // delete unnecessary project id
    delete contribution['project_id'];

    if (await parishExists(parish_code, parish_password)) {

        Logger.log(await MongoDBContract
            .connectedClient()
            .db(parish_code)
            .collection(DBDetails.projectsCollection)
            .find()
            .toArray()
        )

        let update = await MongoDBContract
            .connectedClient()
            .db(parish_code)
            .collection(DBDetails.projectsCollection)
            .updateOne({ '_id': new ObjectId(id) },
                {
                    '$push': { 'contributions': contribution }
                },
                { 'upsert': false }
            )

        return resp.json({
            'response': ((update.modifiedCount + update.upsertedCount) > 0)
                ? 'success'
                : 'updates not saved'
        });
    } else {
        return resp.json({ 'response': ['unauthorised request'] });
    }
}


export async function loadParishProjectRecords(req, resp) {
    const { parish_code, parish_password } = req.body;

    console.log(req.body);

    if (!parish_code || !parish_password) {
        return resp.json({ 'response': 'bad request' });
    }

    if (await parishExists(parish_code, parish_password)) {
        let projectsRecords = await MongoDBContract
            .findManyByFilterFromCollection(
                parish_code,
                DBDetails.projectsCollection,
                {}
            );
        return resp.json({ 'response': projectsRecords || [] });
    } else {
        return resp.json({ 'response': ['unauthorised request'] });
    }
}