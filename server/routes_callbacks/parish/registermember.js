const { DBConstants } = require("../../../db/dbConstants");
const { DBUtils, ConnectedClient } = require("../../../db/dbUtils");
const { DebugUtils } = require("../../utils/debug_utils");

const registerMember = async (req, resp) => {
    const details = req.body;
    const parishId = details.parish_id;

    DebugUtils.PRINT('details -> ', details);

    if (!details['NAME'] || details['home_address']) {
        return resp.json({ 'response': 'something went wrong' });
    }

    delete details['parish_id'];
    DebugUtils.PRINT('details -> ', details);

    const saveResult = await ConnectedClient
        .db(parishId)
        .collection(DBConstants.PARISH_MEMBERS_COLLECTION)
        .insertOne(details);

    DebugUtils.PRINT('saved -> ', saveResult);

    resp.json({
        'response'
            : saveResult.insertedId
                ? 'success'
                : 'something went wrong'
    });
}

module.exports = { registerMember }