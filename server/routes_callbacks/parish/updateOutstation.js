const { ObjectId } = require("mongodb");
const { DBConstants } = require("../../../db/dbConstants");
const { ConnectedClient } = require("../../../db/dbUtils");


const updateOutstation = async (req, resp) => {
    const details = req.body;

    console.log('details::', details);

    const parishId = details.parish_id;
    const outstationId = details.outstation_id;

    const updated = await ConnectedClient
        .db(parishId)
        .collection(DBConstants.PARISH_OUTSTATIONS_COLLECTION)
        .updateOne({ '_id': new ObjectId(outstationId) },
            {
                $addToSet: {
                    'smallchristiancommunities': {
                        '$each': details.sccs
                    }
                },
            },
        );


    let savedChanges = (updated.modifiedCount > 0 || updated.upsertedCount > 0)

    console.log('saved changes::', savedChanges);

    return resp.json({
        'response': savedChanges ? 'update successful'
            : 'could not save updates'
    })
}


module.exports = { updateOutstation }