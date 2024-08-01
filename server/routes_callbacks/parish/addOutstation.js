const { DBConstants } = require("../../../db/dbConstants");
const { DBUtils } = require("../../../db/dbUtils");
const { err_handler } = require("../../errorAndExceptionHandler");
const { DebugUtils } = require("../../utils/debug_utils");


const addOutstation = async (req, resp) => {
    try {
        const details = req.body;

        DebugUtils.PRINT('details -> ', details);

        const saveResult = await DBUtils
            .CONNECTED_DB_CLI(details.id)
            .collection(DBConstants.PARISH_OUTSTATIONS_COLLECTION)
            .insertOne({
                "name": details.outstation_name,
                "smallchristiancommunities": req.body.sccs
            });

        DebugUtils.PRINT('save result -> ', saveResult);

        resp.json({
            'response'
                : saveResult === null ||
                    saveResult.insertedId === null
                    || !saveResult.acknowledged
                    ? 'something went wrong' : 'success'
        });
    }

    catch (error) {
        err_handler.handleErrorOrException(error)
        resp.json({ 'response': 'something went wrong' })
    }
}

module.exports = { addOutstation }