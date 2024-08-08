const { ObjectId } = require("mongodb");
const { DBConstants } = require("../../../db/dbConstants");
const { DBUtils } = require("../../../db/dbUtils");
const { DebugUtils } = require("../../utils/debug_utils");

const updateMember = async (req, resp) => {
    DebugUtils.PRINT('details -> ', req.body);
    try {
        const details = req.body;
        const _id = details['_id'];
        const parishId = details['parish_id'];

        DebugUtils.PRINT('parish id -> ', parishId);
        delete details["parish_id"];
        DebugUtils.PRINT('details then -> ', details);

        const filter = {
            NO: details['NO']
        };
        const update = { '$set': details };
        const options = { '$upsert': true };

        const saveResult = await DBUtils
            .CONNECTED_DB_CLI(parishId)
            .collection(DBConstants.PARISH_MEMBERS_COLLECTION)
            .updateOne(filter, update, options);

        //  await DBUtils
        resp.json({
            'response': (saveResult.matchedCount < 1
                &&
                saveResult.upsertedCount < 1)
                ? 'could not save updates'
                : 'success'
        });
    } catch (error) {
        resp.json({ 'response': 'something went wrong..' })
    }
}

module.exports = { updateMember }