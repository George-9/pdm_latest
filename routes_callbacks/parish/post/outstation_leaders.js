import { ObjectId } from "mongodb";
import { DBDetails } from "../../../db_utils.js/db_parish_details.js";
import { MongoDBContract } from "../../../db_utils.js/mongodatabase_contract.js";
import { parishExists } from "../../../server_app/callback_utils.js";

// add outstation leader {member_id: '', position = ''}
// similar to association(addLeader)
export async function addOutstationLeader(req, resp) {
    const { parish_code, parish_password, leader: leaderData, outstation_id } = req.body;

    console.log(req.body);
    console.log(parish_code, parish_password, leaderData, outstation_id);

    console.log(`outstation`,
        await MongoDBContract.findOneByFilterFromCollection(parish_code, DBDetails.outstationsCollection, {
            '_id': new ObjectId(outstation_id)
        })
    );

    if (!parish_code || !parish_password || !leaderData || !outstation_id) {
        return resp.json({ 'response': 'empty details' });
    }

    // check if parish exists
    if (parishExists(parish_code, parish_password)) {
        // check if outstation exists
        const outstationExists = await MongoDBContract
            .findOneByFilterFromCollection(
                parish_code,
                DBDetails.outstationsCollection,
                { '_id': new ObjectId(outstation_id) }
            );

        if (outstationExists && outstationExists._id && outstationExists._id.id) {
            // check if leader exists
            const leaderExists = await MongoDBContract
                .findOneByFilterFromCollection(
                    parish_code,
                    DBDetails.membersCollection,
                    { '_id': new ObjectId(leaderData['member_id']) }
                );

            // insert leader into position, 
            // if position does not exist create position and assign leader,
            // else update position with new leader, use check result(insertId, modifiedCount etc) and async
            if (leaderExists && leaderExists._id && leaderExists._id.id) {
                // check if position exists
                const positionExists = (outstationExists['leaders'] || []).find(
                    (leader) => leader['position'] === leaderData['position']
                );

                if (positionExists) {
                    // update leader
                    const result = await MongoDBContract
                        .collectionInstance(
                            parish_code,
                            DBDetails.outstationsCollection
                        ).updateOne({ '_id': new ObjectId(outstation_id) },
                            {
                                '$set': {
                                    'leaders': outstationExists['leaders'].map(
                                        (leader) => {
                                            if (leader['position'] === leaderData['position']) {
                                                return {
                                                    'member_id': leaderData['member_id'],
                                                    'position': leaderData['position']
                                                };
                                            } else {
                                                return leader;
                                            }
                                        }
                                    )
                                }
                            });

                    resp.json({
                        'response': ((result.modifiedCount + result.upsertedCount) > 0)
                            ? 'success'
                            : 'could not save updates'
                    });
                } else {
                    // insert new leader
                    const result = await MongoDBContract
                        .collectionInstance(
                            parish_code,
                            DBDetails.outstationsCollection
                        ).updateOne({ '_id': new ObjectId(outstation_id) },
                            {
                                '$push': {
                                    'leaders': {
                                        'member_id': leaderData['member_id'],
                                        'position': leaderData['position']
                                    }
                                }
                            });

                    resp.json({
                        'response': ((result.modifiedCount + result.upsertedCount) > 0)
                            ? 'success'
                            : 'something went wrong'
                    });
                }
            } else {
                resp.json({
                    'response': 'leader does not exist'
                });
            }
        } else {
            return resp.json({ 'response': 'outstation does not exist' });
        }
    } else {
        return resp.json({ 'response': 'unauthorised request' });
    }
}

// remove outstation leader
export function removeOutstationLeader(req, resp) {
    const { parish_code, parish_password, outstation_leader } = req.body;

    if (!parish_code || !parish_password || !outstation_leader) {
        return resp.json({ 'response': 'empty details' });
    }

    // check if parish exists
    if (parishExists(parish_code, parish_password)) {
        // check if outstation exists
        const outstationExists = MongoDBContract
            .findOneByFilterFromCollection(
                parish_code,
                DBDetails.outstationsCollection,
                { '_id': outstation_leader['outstation_id'] }
            );

        if (outstationExists && outstationExists._id && outstationExists._id.id) {
            // check if leader exists
            const leaderExists = MongoDBContract
                .findOneByFilterFromCollection(
                    parish_code,
                    DBDetails.membersCollection,
                    { '_id': outstation_leader['leader_id'] }
                );

            if (leaderExists && leaderExists._id && leaderExists._id.id) {
                // remove leader from outstation
                MongoDBContract
                    .collectionInstance(
                        parish_code,
                        DBDetails.outstationsCollection
                    ).updateOne({ '_id': outstation_leader['outstation_id'] },
                        {
                            '$pull': { 'leaders': { 'member_id': outstation_leader['leader_id'] } }
                        });

                return resp.json({ 'response': 'success' });
            } else {
                return resp.json({ 'response': 'leader does not exist' });
            }
        } else {
            return resp.json({ 'response': 'outstation does not exist' });
        }
    } else {
        return resp.json({ 'response': 'unauthorised request' });
    }
}

// get all outstation leaders
export function getOutstationLeaders(req, resp) {
    const { parish_code, parish_password, outstation_id } = req.body;

    if (!parish_code || !parish_password || !outstation_id) {
        return resp.json({ 'response': 'empty details' });
    }

    // check if parish exists
    // check if outstation exists
    // if all exists, get all leaders in the outstation
    // if outstation does not exist, return empty array

    // check if parish exists
    if (parishExists(parish_code, parish_password)) {
        // check if outstation exists
        const outstationExists = MongoDBContract
            .findOneByFilterFromCollection(
                parish_code,
                DBDetails.outstationsCollection,
                { '_id': outstation_id }
            );

        if (outstationExists && outstationExists._id && outstationExists._id.id) {
            // get all leaders in the outstation
            const leaders = MongoDBContract
                .findOneByFilterFromCollection(
                    parish_code,
                    DBDetails.outstationsCollection,
                    { '_id': outstation_id }
                )['leaders'];

            return resp.json({ 'response': leaders || [] });
        } else {
            return resp.json({ 'response': [] });
        }
    } else {
        return resp.json({ 'response': 'unauthorised request' });
    }
}