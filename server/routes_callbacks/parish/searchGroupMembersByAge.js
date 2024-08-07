const { DBConstants } = require("../../../db/dbConstants");
const { ConnectedClient } = require("../../../db/dbUtils");

const searchGroupMembersByAge = async (req, res) => {
    const { parish_id, min_age, max_age } = req.body;
    const dbName = parish_id;

    if (!dbName || min_age === undefined || max_age === undefined) {
        return res.status(400).send('Missing required fields');
    }

    try {
        const database = ConnectedClient.db(dbName);
        const membersCollection = database
            .collection(DBConstants.PARISH_MEMBERS_COLLECTION);

        const currentDate = new Date();

        const members = await membersCollection.aggregate([
            {
                $addFields: {
                    dobDate: { $toDate: '$dob' } // Convert dob string to Date object
                }
            },
            {
                $addFields: {
                    age: {
                        $divide: [
                            { $subtract: [currentDate, '$dobDate'] },
                            1000 * 60 * 60 * 24 * 365 // Convert milliseconds to years
                        ]
                    }
                }
            },
            {
                $match: {
                    age: { $gte: min_age, $lte: max_age }
                }
            }
        ]).toArray();

        res.status(200).json(members);
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
}

module.exports = { searchGroupMembersByAge }