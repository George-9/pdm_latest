const { DBConstants } = require("../../../db/dbConstants");
const { ConnectedClient } = require("../../../db/dbUtils");


const getParishLeaders = async (req, resp) => {
    const details = req.body;

    const parishId = details.parish_id;
    const leaders = await ConnectedClient
        .db(parishId)
        .collection(DBConstants.PARISH_OFFICE_COLLECTION)
        .find()
        .toArray()

    resp.json(leaders);
}

module.exports = { getParishLeaders }