const XLSX = require('xlsx');
const { ConnectedClient, DBUtils } = require('../../../db/dbUtils');
const { DBConstants } = require('../../../db/dbConstants');

async function uploadMembersCallback(req, resp) {
    const details = req.body;

    const parishId = details.parish_id;
    const data = details.members;

    let saved = 0, skipped = 0, withoutCompleteDetails = 0;

    if (!data || !data.length || data.length < 1) {
        return resp.json({ 'response': 'could not upload the provided data' });
    }

    for (let i = 0; i < data.length; i++) {
        const member = data[i];
        if (!Object.keys(member).includes('NO')
            ||
            !Object.keys(member).includes('NAME')
            ||
            !Object.keys(member).includes('DOB')
            ||
            !Object.keys(member).includes('GENDER')
        ) {
            withoutCompleteDetails++;
            continue;
        }

        const membersCollection = DBUtils
            .CONNECTED_DB_CLI(parishId)
            .collection(DBConstants.PARISH_MEMBERS_COLLECTION);

        const found = await membersCollection.findOne({ 'NO': member['NO'] });
        if (found && found._id) {
            skipped++;
            continue;
        } else {
            if ((await membersCollection.insertOne(member)).insertedId) {
                saved++;
            }
        }
    }

    resp.json({
        'response': `success fully uploaded: ${saved}` +
            ` and skipped ${skipped} duplicates.` +
            ` Skipped ${withoutCompleteDetails} without complete details`
    });
}

module.exports = { uploadMembersCallback }