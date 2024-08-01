const { DBConstants } = require("../../../db/dbConstants");
const { DBUtils } = require("../../../db/dbUtils");
const { DebugUtils } = require("../../utils/debug_utils");

const parishLogInDetails = async (req, resp) => {
    const details = req.body;
    DebugUtils.PRINT('details -> ', details);

    var parish = await DBUtils
        .CONNECTED_DB_CLI(DBConstants.REGISTERED_PARISHES_DB_NAME)
        .collection(DBConstants.REGISTERED_PARISHES_COLLECTION)
        .findOne({ code: details.code, password: details.password });

    const parishDetails = { ...parish, _id: parish['_id'].toString() };

    DebugUtils.PRINT('found -> ', parishDetails);
    resp.json(parish);
}

module.exports = { parishLogInDetails }