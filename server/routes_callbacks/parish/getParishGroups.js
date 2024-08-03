const { DBConstants } = require("../../../db/dbConstants");
const { ConnectedClient } = require("../../../db/dbUtils");

const getParishGroups = async (req, resp) => {
    const parishId = req.body.parish_id;

    const groups = await ConnectedClient
        .db(parishId)
        .collection(DBConstants.PARISH_GROUPS_COLLECTION)
        .find().toArray()

    resp.json(groups);
}

module.exports = { getParishGroups }