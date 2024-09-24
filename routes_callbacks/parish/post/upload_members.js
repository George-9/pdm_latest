import { ObjectId } from "mongodb";
import { DBDetails } from "../../../db_utils.js/db_parish_details.js";
import { MongoDBContract } from "../../../db_utils.js/mongodatabase_contract.js";
import { parishExists } from "../../../server_app/callback_utils.js";
import { Logger } from "../../../debug_tools/Log.js";
import { mapValuesToUppercase } from "../../../public/global_tools/objects_tools.js";

export async function serverPost(
    url,
    parish_code,
    parish_password,
    body = {}
) {
    body['parish_code'] = parish_code;
    body['parish_password'] = parish_password;

    let cli = await fetch(
        url,
        {
            'method': 'POST',
            'headers': { 'content-type': 'application/json', },
            'body': JSON.stringify(body)
        }
    );

    return await cli.json() || await cli.text()
}

export async function uploadMembers(req, resp) {
    const { parish_code, parish_password, members } = req.body;
    if (!parish_code || !parish_password || !members) {
        return resp.json({ 'response': 'empty details' });
    }

    if (await parishExists(parish_code, parish_password)) {
        const uploads = [];
        const skips = [];
        let insertCount = 0, skipped = 0;

        for (let i = 0; i < members.length; i++) {
            const member = mapValuesToUppercase(members[i]);
            Logger.log(member);

            try {
                if (!member['name'] || !member['gender'] || !member['date_of_birth']
                    || !member['outstation_id'] || !member['scc_id'] || !member['telephone_number']) {
                    skipped += 1;
                } else {
                    const outstationId = new ObjectId(member['outstation_id']);
                    const outstationExists = await MongoDBContract.findOneByFilterFromCollection(
                        parish_code,
                        DBDetails.outstationsCollection,
                        { '_id': new ObjectId(outstationId) }
                    );

                    const sccExists = await MongoDBContract.findOneByFilterFromCollection(
                        parish_code,
                        DBDetails.smallChritianCommunitiesCollection,
                        {
                            '_id': new ObjectId(member['scc_id']),
                            // SCC must be of the provided Outstation that is, member cannot belong to an SCC
                            // that is from another Outstation
                            'outstation_id': member['outstation_id']
                        }
                    );

                    const outstationSCCPass = outstationExists !== null && sccExists !== null;
                    Logger.log(`existing outstation id: ${outstationExists._id}`);
                    Logger.log(`scc exists: ${sccExists}`);
                    Logger.log(outstationSCCPass);

                    if (outstationSCCPass) {
                        let existing = await MongoDBContract
                            .collectionInstance(
                                parish_code,
                                DBDetails.membersCollection
                            ).aggregate([{ $sort: { 'member_number': -1 } }])
                            .limit(1)
                            .toArray();

                        let memberNumber = 1;
                        if (existing && existing.length > 0) {
                            memberNumber = parseInt(existing[0]['member_number']) + 1;
                        }

                        member['member_number'] = memberNumber;
                        Logger.log(`[${member}]`);

                        if ((await MongoDBContract.insertIntoCollection(member, parish_code, DBDetails.membersCollection)) === true) {
                            insertCount += 1;
                            uploads.push(member);
                        } else {
                            skipped += 1;
                            skips.push(member);
                        }
                    } else {
                        skipped += 1;
                        skips.push(member);
                    }
                }
            } catch (error) {
                Logger.log(`${member['outstation_id']}`);
                console.log(error);
                skipped += 1;
                skips.push(member);
            }
        }

        return resp.json({
            'response': `successfully uploaded ${insertCount} and skipped ${skipped}`,
            'uploaded': uploads,
            'skips': skips
        });

    } else {
        return resp.json({ 'response': 'unauthorised request' });
    }
}