const { DBConstants } = require("../../../db/dbConstants");
const { DBUtils } = require("../../../db/dbUtils");
const { DebugUtils } = require("../../utils/debug_utils");

const updateParish = async (req, resp) => {
    if (Object.keys(req.body).length < 1) {
        return resp.json({ 'response': 'success' });
    }

    DebugUtils.PRINT(req.body)

    const parishDetails = req.body;

    const id = parishDetails.id;
    const code = parishDetails.code;
    const name = parishDetails.name;
    const password = parishDetails.password;

    const details = {
        id: id,
        code: code,
        name: name,
        password: password
    }

    const updates = await DBUtils
        .CONNECTED_DB_CLI(DBConstants.REGISTERED_PARISHES_DB_NAME)
        .collection(DBConstants.REGISTERED_PARISHES_COLLECTION)
        .updateOne({ 'id': details.id, code: details.code },
            {
                $set: { name: details.name, password: details.password }
            }
        );

    const updated = updates.modifiedCount > 0 || updates.upsertedCount > 0;
    DebugUtils.PRINT('updates -> ', updated)
    resp.json({ 'response': updated ? 'success' : 'something went wrong' });
}

module.exports = { updateParish }