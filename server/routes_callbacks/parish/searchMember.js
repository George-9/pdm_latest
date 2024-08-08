const { DBConstants } = require("../../../db/dbConstants");
const { ConnectedClient } = require("../../../db/dbUtils");

const searchMember = async (req, res) => {
    const { parish_id, query } = req.body;
    console.log('query -> ', query);

    const membersCollection = ConnectedClient
        .db(parish_id)
        .collection(DBConstants.PARISH_MEMBERS_COLLECTION)

    try {
        const members = await membersCollection.find({
            $or: [
                { 'name': { '$regex': `${query}`, $options: 'i' } },
                { 'NO': parseInt(query) }
            ]
        }).toArray();

        res.json(members);
    } catch (error) {
        console.log(error);

        res.status(500).send(error.message);
    }
}


module.exports = { searchMember }