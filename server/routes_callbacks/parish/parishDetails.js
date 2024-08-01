const { DBConstants } = require("../../../db/dbConstants");
const { DBUtils } = require("../../../db/dbUtils");
const { DebugUtils } = require("../../utils/debug_utils");

const parishDetails = async (req, resp) => {
    const details = req.body;
    DebugUtils.PRINT('details -> ', details);

    var parish = await DBUtils
        .CONNECTED_DB_CLI(DBConstants.REGISTERED_PARISHES_DB_NAME)
        .collection(DBConstants.REGISTERED_PARISHES_COLLECTION)
        .findOne({ '$or': [{ id: details.id }, { 'code': details.code }] });

    const parishDetails = { ...parish, _id: parish['_id'].toString() };

    delete parishDetails['password']

    DebugUtils.PRINT('found -> ', parishDetails);
    resp.json(parishDetails);
}

module.exports = { parishDetails }