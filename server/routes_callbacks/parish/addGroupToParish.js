const { DBConstants } = require("../../../db/dbConstants");
const { ConnectedClient } = require("../../../db/dbUtils");

const addGroupToParish = async (req, resp) => {
    const details = req.body;

    console.log('details -> ', details);

    const parishId = details.parish_id;
    const groupName = details.name;
    const minAge = details.min_age;
    const maxAge = details.max_age;

    const groupExists = await ConnectedClient
        .db(parishId)
        .collection(DBConstants.PARISH_GROUPS_COLLECTION)
        .findOne({
            'name': groupName,
        })

    if (groupExists && groupExists._id) {
        return resp.json({
            'response': 'a group with the provided name already exists'
        })
    }

    const saved = await ConnectedClient
        .db(parishId)
        .collection(DBConstants.PARISH_GROUPS_COLLECTION)
        .insertOne({
            name: groupName,
            min_age: minAge,
            max_age: maxAge,
            leaders: {}
        });

    resp.json({
        'response': saved.insertedId
            ? 'success'
            : 'something went wrong'
    });
}

module.exports = { addGroupToParish }