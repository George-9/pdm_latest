const { DBConstants } = require("../../../db/dbConstants");
const { DBUtils } = require("../../../db/dbUtils");
const { DebugUtils } = require("../../utils/debug_utils");

const parishData = async (req, resp) => {
    const details = req.body;
    DebugUtils.PRINT('details -> ', details);

    const parishDetails = {
        members: '',
        office: '',
        outstations: '',
        groups: '',
    }

    var parishMembers = await DBUtils
        .CONNECTED_DB_CLI(details.id)
        .collection(DBConstants.PARISH_MEMBERS_COLLECTION)
        .find().toArray();

    var parishOffice = await DBUtils
        .CONNECTED_DB_CLI(details.id)
        .collection(DBConstants.PARISH_OFFICE_COLLECTION)
        .find().toArray();

    var parishOutstations = await DBUtils
        .CONNECTED_DB_CLI(details.id)
        .collection(DBConstants.PARISH_OUTSTATIONS_COLLECTION)
        .find().toArray();

    var parishGroups = await DBUtils
        .CONNECTED_DB_CLI(details.id)
        .collection(DBConstants.PARISH_GROUPS_COLLECTION)
        .find().toArray();

    parishDetails.members = parishMembers;
    parishDetails.office = parishOffice;
    parishDetails.outstations = parishOutstations;
    parishDetails.groups = parishGroups

    DebugUtils.PRINT('details -> ', parishDetails);

    resp.json(parishDetails);
}

module.exports = { parishData }