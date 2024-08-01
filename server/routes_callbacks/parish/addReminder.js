const { DBConstants } = require("../../../db/dbConstants");
const { DBUtils } = require("../../../db/dbUtils");

const addReminder = async (req, resp) => {
    const details = req.body;
    const parishId = details.parish_id

    delete details.parish_id

    resp.json({
        'response':
            await DBUtils.INSERT_TO_COLLECTION(parishId, DBConstants.REMINDERS_COLLECTION, details)
                ? 'success'
                : 'could not add reminder'
    })
}

module.exports = { addReminder }