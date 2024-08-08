const { DBConstants } = require("../../../db/dbConstants");
const { ConnectedClient } = require("../../../db/dbUtils");

async function getAllTitheRecords(req, resp) {
    /**
     * TODO add query paramemter for date and by outstations
     */
    const { parish_id } = req.body;


    const records = await ConnectedClient
        .db(parish_id)
        .collection(DBConstants.TITHE_COLLECTION)
        .find()
        .toArray();

    resp.json(records);
}

module.exports = { getAllTitheRecords }