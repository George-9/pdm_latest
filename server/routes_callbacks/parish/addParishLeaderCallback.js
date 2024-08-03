const { DBConstants } = require("../../../db/dbConstants");
const { ConnectedClient } = require("../../../db/dbUtils");


const addParishLeader = async (req, resp) => {
    const details = req.body;

    const parishId = details.parish_id;
    const name = details.name;
    const position = details.position;

    const positionOccupied = await ConnectedClient
        .db(parishId)
        .collection(DBConstants.PARISH_OFFICE_COLLECTION)
        .findOne({
            position: position
        });
    if (positionOccupied && positionOccupied._id) {
        return resp.json({
            'response': 'the position is already ocuppied please use the update option'
        });
    }

    const saved = await ConnectedClient
        .db(parishId)
        .collection(DBConstants.PARISH_OFFICE_COLLECTION)
        .insertOne({
            name: name,
            position: position
        });

    resp.json({
        'response': saved.insertedId
            ? 'success'
            : 'error adding leader'
    })
}

module.exports = { addParishLeader }