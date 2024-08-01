const { DBConstants } = require("../../../db/dbConstants");
const { DBUtils } = require("../../../db/dbUtils");
const { DebugUtils } = require("../../utils/debug_utils");

const parishOutstationsCount = async (req, resp) => {
    const id = req.body.id;

    DebugUtils.PRINT('id -> ', id)

    const parishCount = await DBUtils
        .CONNECTED_DB_CLI(id)
        .collection(DBConstants.PARISH_OUTSTATIONS_COLLECTION)
        .countDocuments()

    resp.json({ 'response': parishCount.toString() });
}

module.exports = { parishOutstationsCount }