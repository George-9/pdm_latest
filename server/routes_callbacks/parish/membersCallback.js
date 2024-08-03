const { DBConstants } = require("../../../db/dbConstants");
const { DBUtils, ConnectedClient } = require("../../../db/dbUtils");

const loadMembers = async (req, resp) => {
    const id = req.body.id;

    console.log('id -> ', id);

    const members = await ConnectedClient
        .db(id)
        .collection(DBConstants.PARISH_MEMBERS_COLLECTION)
        .find()
        .toArray();

    return await resp.json(members)
}

module.exports = { loadMembers }