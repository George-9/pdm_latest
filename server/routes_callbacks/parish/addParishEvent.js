const { DBConstants } = require("../../../db/dbConstants");
const { DBUtils } = require("../../../db/dbUtils");
const { DebugUtils } = require("../../utils/debug_utils");

const addParishEvent = async (req, resp) => {
    const details = req.body;
    const parishId = details.parish_id;

    DebugUtils.PRINT('details::', details);

    // remove parish id, (not part of the evnt details)
    delete details.parish_id;

    resp.json({
        'response': await DBUtils.INSERT_TO_COLLECTION(parishId, DBConstants.EVENTS_COLLECTION, details)
            ? 'success'
            : 'could not add event'
    });
}

module.exports = { addParishEvent }