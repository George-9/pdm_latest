const { DBConstants } = require("../../../db/dbConstants");
const { DBUtils } = require("../../../db/dbUtils");

const getOustationSCCs = async (req, resp) => {
    const parishId = req.body.parish_id;
    const outstationName = req.body.outstation_name;

    const SCCs = await DBUtils
        .CONNECTED_DB_CLI(parishId)
        .collection(DBConstants.PARISH_OUTSTATIONS_COLLECTION)
        .findOne({ 'name': outstationName }, { 'name': 0 })

    resp.json(SCCs);
}


module.exports = { getOustationSCCs }