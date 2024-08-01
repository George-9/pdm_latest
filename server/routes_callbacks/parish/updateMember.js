const { ObjectId } = require("mongodb");
const { DBConstants } = require("../../../db/dbConstants");
const { DBUtils } = require("../../../db/dbUtils");
const { DebugUtils } = require("../../utils/debug_utils");

const updateMember = async (req, resp) => {
    DebugUtils.PRINT('details -> ', req.body);
    try {
        const details = req.body;
        const id = details['_id'];
        const parishId = details['parish_id'];

        DebugUtils.PRINT('parish id -> ', parishId);
        DebugUtils.PRINT('member id -> ', id);

        delete details["_id"];
        delete details["parish_id"];

        DebugUtils.PRINT('details then -> ', details);


        DebugUtils.PRINT('type of id -> ', typeof (id));

        const saveResult = DBUtils
            .CONNECTED_DB_CLI(parishId)
            .collection(DBConstants.PARISH_MEMBERS_COLLECTION)
            .updateOne(
                { _id: ObjectId.createFromTime(id) },
                { '$set': { ...details } }
            );

        //  await DBUtils

        resp.json({
            'response': (saveResult.upsertedCount < 1
                &&
                saveResult.modifiedCount < 1)
                ? 'could not save updates'
                : 'success'
        });
    } catch (error) {
        DebugUtils.PRINT(error)
        resp.json({ 'response': 'something went wrong..' })
    }
}

module.exports = { updateMember }