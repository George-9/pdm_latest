const { DBConstants } = require("../../../db/dbConstants");
const { ConnectedClient } = require("../../../db/dbUtils");

const addParishLeader = async (req, resp) => {
    const details = req.body;

    const parishId = details.parish_id;
    const parishLeaderId = details.member_id;
    const position = details.position;

    if (!parishId || !parishLeaderId || !position) {
        return resp.json({ 'response': 'something went wrong' })
    }

    const savedLeader = await ConnectedClient
        .db(parishId)
        .collection(DBConstants.PARISH_OFFICE_COLLECTION)
        .insertOne({ position: position, in_charge: parishLeaderId })

    resp.json({
        response: savedLeader.insertedId
            ? 'success'
            : 'could not add leader to parish'
    });
}

module.exports = { addParishLeader }