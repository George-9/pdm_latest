const { DBConstants } = require("../../../db/dbConstants");
const { ConnectedClient } = require("../../../db/dbUtils");


const addOfferingRecord = async (req, resp) => {
    const { parish_id, date, outstation, amount } = req.body;

    const saveResult = await ConnectedClient
        .db(parish_id)
        .collection(DBConstants.OFFERING_COLLECTION)
        .insertOne({
            'date': date,
            'outstation': outstation,
            'amount': amount
        });

    resp.json({
        response: saveResult.insertedId
            ? 'record saved'
            : 'something went wrong'
    });
}

module.exports = { addOfferingRecord }