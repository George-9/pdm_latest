import { DBDetails } from "../../../db_utils.js/db_parish_details.js";
import { MongoDBContract } from "../../../db_utils.js/mongodatabase_contract.js";
import { parishExists } from "../../../server_app/callback_utils.js";
import {Logger} from '../../../debug_tools/Log.js';

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
        for (let i = 0; i < members.length; i++) {
            const member = members[i];
            console.log('member',member);
            
            if (member['_id']) {
                delete member['_id'];
            }
            
            console.log('member',member);
            
            try {
                if (!member['name'] || !member['volume'] || !member['gender'] || !member['date_of_birth']) {
                    skipped += 1;
                    console.log('skipped here...');
                }else {
                    const GODPARENTKEY = Object.keys(member).find(function (key) {
                        return `${key}`.toUpperCase().match('GOD')
                    });
                    if (GODPARENTKEY) {
                        const GODPARENTS = member[GODPARENTKEY];
                    member[GODPARENTKEY] = GODPARENTS.includes(',')? GODPARENTS.split(','): GODPARENTS.split('.');
                }
                
                const insertResult = await MongoDBContract.dbInstance(
                    parish_code)
                    .collection(DBDetails.membersCollection)
                    .insertMany(members);
                
                    return resp.json({
                        'response': `successfully uploaded ${insertResult.insertedCount} and skipped ${members.length - insertResult.insertedCount}`,
                        'uploaded': uploads,
                        'skips': skips
                    });
            }
        } catch (error) {
                Logger.log(`error: ${error}`);
               }
        }

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

