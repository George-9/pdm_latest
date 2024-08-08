const { DBConstants } = require("../../../db/dbConstants");
const { ConnectedClient } = require("../../../db/dbUtils");


const addTitheRecord = async (req, resp) => {
    const { parish_id, date, amount, member_no } = req.body;

    const saveResult = await ConnectedClient
        .db(parish_id)
        .collection(DBConstants.TITHE_COLLECTION)
        .updateOne({
            'date': date,
            'amount': amount,
            'member_no': member_no,
        },
            { '$set': req.body },
            { 'upsert': true }
        );

    resp.json({
        response: saveResult.insertedId
            ? 'record saved'
            : 'something went wrong'
    });
}

module.exports = { addTitheRecord }