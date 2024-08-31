import { DBDetails } from "../../../db_utils.js/db_parish_details.js";
import { MongoDBContract } from "../../../db_utils.js/mongodatabase_contract.js";
import { Logger } from "../../../debug_tools/Log.js";
import { parishExists } from "../../../server_app/callback_utils.js";

export async function addParishEvent(req, resp) {
    const { parish_code, parish_password, event } = req.body;
    console.log(req.body, event);

    if (!parish_code || !parish_password || !event) {
        return resp.json({ 'response': 'event not saved' });
    }

    if (await parishExists(parish_code, parish_password)) {
        let saved = await MongoDBContract.insertIntoCollection(
            event,
            parish_code,
            DBDetails.eventsCollection
        );

        Logger.log(saved);

        return resp.json({
            'response': saved ? 'success' : 'something went wrong'
        });
    } else {
        return resp.json({ 'response': 'unauthorised request' });
    }
}

export async function deleteParishEvent(req, resp) {
    const { parish_code, password, event_id } = req.body;
    if (!parish_code || !password || !event_id) {
        return resp.json({ 'response': 'event not saved' });
    }

    let deletion = await MongoDBContract.deletedOneByFilterFromCollection(
        parish_code,
        DBDetails.eventsCollection,
        { '_id': event_id }
    );

    return resp.json({ 'response': deletion ? 'deleted' : 'something went wrong deleting event' });
}

export async function loadParishEvents(req, resp) {
    const { parish_code, parish_password } = req.body;
    if (!parish_code || !parish_password) {
        return resp.json({ 'response': [] });
    }

    let allEvents = await MongoDBContract.fetchFromCollection(
        parish_code,
        DBDetails.eventsCollection,
        {
            'filter': {}
        }
    );

    console.log(allEvents);

    return resp.json({ 'response': allEvents ? allEvents : [] });
}