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
                    continue;
                }

                const GodParents = `${member['God_Parents']}`;
                if (GodParents) {
                    member['God_Parents'] = GodParents.includes(',')
                        ? GodParents.split(',')
                        : GodParents.split('.');
                }

                const outstationId = new ObjectId(member['outstation_id']);
                const outstationExists = await retry(async () => {
                    return await MongoDBContract.findOneByFilterFromCollection(
                        parish_code,
                        DBDetails.outstationsCollection,
                        { '_id': outstationId }
                    );
                }, { retries: 3 });

                const sccExists = await retry(async () => {
                    return await MongoDBContract.findOneByFilterFromCollection(
                        parish_code,
                        DBDetails.smallChritianCommunitiesCollection,
                        {
                            '_id': new ObjectId(member['scc_id']),
                            'outstation_id': member['outstation_id']
                        }
                    );
                }, { retries: 3 });

                const outstationSCCPass = ((outstationExists !== null) && (sccExists !== null));
                Logger.log(`existing outstation id: ${outstationExists._id}`);
                Logger.log(`scc exists: ${sccExists}`);
                Logger.log(outstationSCCPass);

                if (outstationSCCPass) {
                    let existing = await retry(async () => {
                        return await MongoDBContract.collectionInstance(
                            parish_code,
                            DBDetails.membersCollection
                        ).aggregate([{ $sort: { 'member_number': -1 } }])
                            .limit(1)
                            .toArray();
                    }, { retries: 3 });

                    let memberNumber = 1;
                    if (existing && existing.length > 0) {
                        memberNumber = parseInt(existing[0]['member_number']) + 1;
                    }
                    member['member_number'] = memberNumber;
                    Logger.log(`[${member}]`);

                    const insertResult = await retry(async () => {
                        return await MongoDBContract.insertIntoCollection(member, parish_code, DBDetails.membersCollection);
                    }, { retries: 3 });

                    if (insertResult === true) {
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

// export async function uploadMembers(req, resp) {
//     const { parish_code, parish_password, members } = req.body;
//     if (!parish_code || !parish_password || !members) {
//         return resp.json({ 'response': 'empty details' });
//     }

//     if (await parishExists(parish_code, parish_password)) {
//         const uploads = [];
//         const skips = [];
//         let insertCount = 0, skipped = 0;

//         const batchSize = 100; // Define your batch size
//         for (let i = 0; i < members.length; i += batchSize) {
//             const batch = members.slice(i, i + batchSize);
//             await processBatch(batch, parish_code, uploads, skips);
//         }

//         return resp.json({
//             'response': `successfully uploaded ${insertCount} and skipped ${skipped}`,
//             'uploaded': uploads,
//             'skips': skips
//         });
//     } else {
//         return resp.json({ 'response': 'unauthorised request' });
//     }
// }

// async function processBatch(batch, parish_code, uploads, skips) {
//     const operations = batch.map(member => processMember(member, parish_code, uploads, skips));
//     await Promise.all(operations);
// }

// async function processMember(member, parish_code, uploads, skips) {
//     const mappedMember = mapValuesToUppercase(member);
//     Logger.log(mappedMember);

//     if (!validateMember(mappedMember)) {
//         skips.push(mappedMember);
//         return;
//     }

//     try {
//         const { outstationExists, sccExists } = await checkExistence(mappedMember, parish_code);
//         if (!outstationExists || !sccExists) {
//             skips.push(mappedMember);
//             return;
//         }

//         const memberNumber = await getNextMemberNumber(parish_code);
//         mappedMember['member_number'] = memberNumber;

//         const insertResult = await retryOperation(async () => {
//             return await MongoDBContract.insertIntoCollection(mappedMember, parish_code, DBDetails.membersCollection);
//         });

//         if (insertResult === true) {
//             uploads.push(mappedMember);
//         } else {
//             skips.push(mappedMember);
//         }
//     } catch (error) {
//         Logger.log(`${mappedMember['outstation_id']}`);
//         console.log(error);
//         skips.push(mappedMember);
//     }
// }

// function validateMember(member) {
//     return member['name'] && member['gender'] && member['date_of_birth'] &&
//         member['outstation_id'] && member['scc_id'] && member['telephone_number'];
// }

// async function checkExistence(member, parish_code) {
//     const outstationId = new ObjectId(member['outstation_id']);
//     const outstationExists = await retryOperation(async () => {
//         return await MongoDBContract.findOneByFilterFromCollection(
//             parish_code,
//             DBDetails.outstationsCollection,
//             { '_id': outstationId }
//         );
//     });

//     const sccExists = await retryOperation(async () => {
//         return await MongoDBContract.findOneByFilterFromCollection(
//             parish_code,
//             DBDetails.smallChritianCommunitiesCollection,
//             {
//                 '_id': new ObjectId(member['scc_id']),
//                 'outstation_id': member['outstation_id']
//             }
//         );
//     });

//     return { outstationExists, sccExists };
// }

// async function getNextMemberNumber(parish_code) {
//     const existing = await retryOperation(async () => {
//         return await MongoDBContract.collectionInstance(
//             parish_code,
//             DBDetails.membersCollection
//         ).aggregate([{ $sort: { 'member_number': -1 } }])
//             .limit(1)
//             .toArray();
//     });

//     let memberNumber = 1;
//     if (existing && existing.length > 0) {
//         memberNumber = parseInt(existing[0]['member_number']) + 1;
//     }
//     return memberNumber;
// }

// async function retryOperation(operation, retries = 3, delay = 1000) {
//     for (let attempt = 1; attempt <= retries; attempt++) {
//         try {
//             return await operation();
//         } catch (error) {
//             if (attempt === retries) {
//                 throw error;
//             }
//             Logger.log(`Retrying operation, attempt ${attempt} failed: ${error.message}`);
//             await new Promise(resolve => setTimeout(resolve, delay));
//         }
//     }
// }
