const { DBConstants } = require("../../../db/dbConstants");
const { DBUtils } = require("../../../db/dbUtils");

const getReminders = async (req, resp) => {
    const parishId = req.body.parish_id;

    const reminders = await DBUtils.GET_ALL_FROM_COLLECTION(parishId, DBConstants.REMINDERS_COLLECTION)
    resp.json(reminders);
    resp.end();
}

module.exports = { getReminders }