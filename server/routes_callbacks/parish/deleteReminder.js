const { ObjectId } = require("mongodb");
const { DBConstants } = require("../../../db/dbConstants");
const { DBUtils } = require("../../../db/dbUtils");
const { DebugUtils } = require("../../utils/debug_utils");

const deleteReminder = async (req, resp) => {
    const parishId = req.body.parish_id;
    const reminderId = req.body.reminder_id;

    const deleted = (await DBUtils
        .CONNECTED_DB_CLI(parishId)
        .collection(DBConstants.REMINDERS_COLLECTION)
        .deleteOne({ _id: new ObjectId(reminderId) }));


    DebugUtils.PRINT('parish id::', parishId);
    resp.json({
        'response': deleted.deletedCount > 0
            ? 'deleted'
            : 'could not delete reminder'
    })

    resp.end();
}

module.exports = { deleteReminder }