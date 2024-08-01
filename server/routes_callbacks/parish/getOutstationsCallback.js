const { DBConstants } = require("../../../db/dbConstants");
const { DBUtils } = require("../../../db/dbUtils");

const getOutstations = async (req, resp) => {
    const parishId = req.body.parish_id;
    console.log('parish id::', parishId);
    const outstations = await DBUtils.DB_FIND_ALL(parishId, DBConstants.PARISH_OUTSTATIONS_COLLECTION);

    return await resp.json(outstations);
}

module.exports = { getOutstations };