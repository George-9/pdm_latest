const { ObjectId } = require("mongodb");
const { DBConstants } = require("../../../db/dbConstants");
const { DBUtils } = require("../../../db/dbUtils");
const { DebugUtils } = require("../../utils/debug_utils");

const deleteEvent = async (req, resp) => {
    const parishId = req.body.parish_id;
    const eventId = req.body.event_id;

    const deleted = (await DBUtils
        .CONNECTED_DB_CLI(parishId)
        .collection(DBConstants.EVENTS_COLLECTION)
        .deleteOne({ _id: new ObjectId(eventId) }));


    DebugUtils.PRINT('parish id::', parishId);
    DebugUtils.PRINT('event id::', eventId);
    resp.json({
        'response': deleted.deletedCount > 0 ? 'deleted' : 'could not delete event'
    })

    resp.end();
}

module.exports = { deleteEvent }