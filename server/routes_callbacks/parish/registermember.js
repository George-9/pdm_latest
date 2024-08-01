const { DBConstants } = require("../../../db/dbConstants");
const { DBUtils } = require("../../../db/dbUtils");
const { DebugUtils } = require("../../utils/debug_utils");

const registerMember = async (req, resp) => {
    const details = req.body;
    const parishId = details.parish_id;

    DebugUtils.PRINT('details -> ', details);

    if (!details.name || !details.home_address) {
        return resp.json({ 'response': 'something went wrong' });
    }

    delete details['parish_id'];

    const saveResult = await DBUtils.INSERT_TO_COLLECTION(
        parishId,
        DBConstants.PARISH_MEMBERS_COLLECTION,
        details
    );

    DebugUtils.PRINT('saved -> ', saveResult);

    resp.json({
        'response'
            : saveResult
                ? 'success'
                : 'something went wrong'
    });
}

module.exports = { registerMember }