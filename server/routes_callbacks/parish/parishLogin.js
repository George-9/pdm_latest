const { DBUtils } = require("../../../db/dbUtils");
const { DebugUtils } = require("../../utils/debug_utils");

async function parishLogInCallback(req, resp) {
    const details = req.body;

    DebugUtils.PRINT(details);

    const exists = await DBUtils.PARISH_EXISTS(
        details.code,
        details.password
    );

    resp.json({ 'response': exists ? 'success' : 'parish with the given details does not exist' }).DBUtils
}

module.exports = { parishLogInCallback }