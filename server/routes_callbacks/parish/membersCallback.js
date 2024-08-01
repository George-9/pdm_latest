const { DBConstants } = require("../../../db/dbConstants");
const { DBUtils } = require("../../../db/dbUtils");

const loadMembers = async (req, resp) => {
    const id = req.body.id;
    const members = await DBUtils.DB_FIND_ALL(id, DBConstants.PARISH_MEMBERS_COLLECTION);

    return await resp.json(members)
}

module.exports = { loadMembers }