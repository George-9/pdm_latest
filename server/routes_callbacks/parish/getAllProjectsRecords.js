const { DBConstants } = require("../../../db/dbConstants");
const { ConnectedClient } = require("../../../db/dbUtils");


const getAllProjectsRecords = async (req, resp) => {
    /**
     * TODO add query paramemter
     */
    const { parish_id } = req.body;


    const records = await ConnectedClient
        .db(parish_id)
        .collection(DBConstants.PROJECTS_COLLECTION)
        .find()
        .toArray();

    resp.json(records);
}

module.exports = { getAllProjectsRecords }