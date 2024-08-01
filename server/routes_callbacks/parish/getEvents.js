const { DBConstants } = require("../../../db/dbConstants");
const { DBUtils } = require("../../../db/dbUtils");
const { DebugUtils } = require("../../utils/debug_utils");

const getEvents = async (req, resp) => {
    const parishId = req.body.parish_id;

    DebugUtils.PRINT("id::", parishId)

    const events = await DBUtils.GET_ALL_FROM_COLLECTION(parishId, DBConstants.EVENTS_COLLECTION)

    DebugUtils.PRINT("event::", events)

    resp.json(events);
    resp.end();
}

module.exports = { getEvents }