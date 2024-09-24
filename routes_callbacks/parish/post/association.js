import { MongoDBContract } from "../../../db_utils.js/mongodatabase_contract.js";
import { DBDetails } from "../../../db_utils.js/db_parish_details.js";
import { parishExists } from "../../../server_app/callback_utils.js";
import { ObjectId } from "mongodb";

// add association example CWA, CMA
export async function addAssociation(req, resp) {
    const { parish_code, parish_password, association } = req.body;
    if (!parish_code || !parish_password || !association) {
        return resp.json({ 'response': 'empty details' });
    }

    if (parishExists(parish_code, parish_password)) {
        const result = await MongoDBContract
            .insertIntoCollection(
                association,
                parish_code,
                DBDetails.parishAssociationsCollection
            );

        resp.json({
            'response': result
                ? 'success'
                : 'something went wrong'
        });

    } else {
        return resp.json({ 'response': 'unauthorised request' });
    }
}

// get all associations
export async function getAssociations(req, resp) {
    const { parish_code, parish_password } = req.body;
    if (!parish_code || !parish_password) {
        return resp.json({ 'response': 'empty request' });
    }

    if (parishExists(parish_code, parish_password)) {
        const result = await MongoDBContract
            .fetchFromCollection(
                parish_code,
                DBDetails.parishAssociationsCollection,
                {}
            );

        resp.json({ 'response': result || [] });
    } else {
        return resp.json({ 'response': 'unauthorised request' });
    }
}
export async function addAssociationLeader(req, resp) {
    const { parish_code, parish_password, association } = req.body;
    if (!parish_code || !parish_password || !association) {
        return resp.json({ 'response': 'empty details' });
    }

    association['member_id'] = association['leader']['member_id'];
    association['position'] = association['leader']['position'];

    // add leader to association.
    // if position does not exist insert new position and leader and the member_id(that member) is not in another position
    // in that association.
    // if the position exists, update the leader of that position
    // if the position exists and the member_id is in another position, update the leader of that position
    // and remove the member_id from the other position
    if (parishExists(parish_code, parish_password)) {
        const associationId = new ObjectId(association['_id']);
        const associationExists = await MongoDBContract
            .findOneByFilterFromCollection(
                parish_code,
                DBDetails.parishAssociationsCollection,
                { '_id': associationId }
            );

        if (associationExists && associationExists._id && associationExists._id.id) {
            // check if position exists
            const positionExists = (associationExists['leaders'] || []).find(
                (leader) => leader['position'] === association['position']
            );

            if (positionExists) {
                // update leader
                const result = await MongoDBContract
                    .collectionInstance(
                        parish_code,
                        DBDetails.parishAssociationsCollection
                    ).updateOne({ '_id': associationId },
                        {
                            '$set': {
                                'leaders': associationExists['leaders'].map(
                                    (leader) => {
                                        if (leader['position'] === association['position']) {
                                            return {
                                                'member_id': association['member_id'],
                                                'position': association['position']
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
                        DBDetails.parishAssociationsCollection
                    ).updateOne({ '_id': associationId },
                        {
                            '$push': {
                                'leaders': {
                                    'member_id': association['member_id'],
                                    'position': association['position']
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
                'response': 'association does not exist'
            });
        }
    } else {
        return resp.json({ 'response': 'unauthorised request' });
    }
}

// get all leaders in an association
export async function getAssociationLeaders(req, resp) {
    const { parish_code, parish_password, association_id } = req.body;
    if (!parish_code || !parish_password || !association_id) {
        return resp.json({ 'response': 'empty details' });
    }

    if (parishExists(parish_code, parish_password)) {
        const result = await MongoDBContract
            .findOneByFilterFromCollection(
                parish_code,
                DBDetails.parishAssociationsCollection,
                { '_id': association_id }
            );

        resp.json({ 'response': result['leaders'] || [] });
    } else {
        return resp.json({ 'response': 'unauthorised request' });
    }
}

// get all members in an association
export async function getAssociationMembers(req, resp) {
    const { parish_code, parish_password, association_id } = req.body;
    if (!parish_code || !parish_password || !association_id) {
        return resp.json({ 'response': 'empty details' });
    }

    if (parishExists(parish_code, parish_password)) {
        const result = await MongoDBContract
            .findOneByFilterFromCollection(
                parish_code,
                DBDetails.parishAssociationsCollection,
                { '_id': association_id }
            );

        resp.json({ 'response': result['members_id'] || [] });

    } else {
        return resp.json({ 'response': 'unauthorised request' });
    }
}

// remove leader from association
export async function removeAssociationLeader(req, resp) {
    const { parish_code, parish_password, association } = req.body;
    if (!parish_code || !parish_password || !association) {
        return resp.json({ 'response': 'empty details' });
    }

    if (parishExists(parish_code, parish_password)) {
        const result = await MongoDBContract
            .collectionInstance(
                parish_code,
                DBDetails.parishAssociationsCollection
            ).updateOne({ '_id': association['_id'] },
                {
                    '$pull': { 'leaders': { 'member_id': association['leader_id'] } }
                });

        resp.json({
            'response': ((result.modifiedCount + result.upsertedCount) > 0)
                ? 'success'
                : 'could not save updates'
        });

    } else {
        return resp.json({ 'response': 'unauthorised request' });
    }
}

// remove member from association
export async function removeAssociationMember(req, resp) {
    const { parish_code, parish_password, association } = req.body;
    if (!parish_code || !parish_password || !association) {
        return resp.json({ 'response': 'empty details' });
    }

    if (parishExists(parish_code, parish_password)) {
        const result = await MongoDBContract
            .collectionInstance(
                parish_code,
                DBDetails.parishAssociationsCollection
            ).updateOne({ '_id': association['_id'] },
                {
                    '$pull': { 'members_id': association['member_id'] }
                });

        resp.json({
            'response': ((result.modifiedCount + result.upsertedCount) > 0)
                ? 'success'
                : 'could not save updates'
        });

    } else {
        return resp.json({ 'response': 'unauthorised request' });
    }
}

// add member if and only if the member_id does not exist in the members_ids
export async function addAssociationMember(req, resp) {
    const { parish_code, parish_password, association } = req.body;
    if (!parish_code || !parish_password || !association) {
        return resp.json({ 'response': 'empty details' });
    }
    console.log(association);

    if (parishExists(parish_code, parish_password)) {
        const associationId = new ObjectId(association['_id']);
        const associationExists = await MongoDBContract
            .findOneByFilterFromCollection(
                parish_code,
                DBDetails.parishAssociationsCollection,
                { '_id': associationId }
            );

        if (associationExists && associationExists._id && associationExists._id.id) {
            // check if member exists
            const memberExists = (associationExists['members_id'] || []).find(
                (memberId) => memberId === association['member_id']
            );

            if (!memberExists) {
                // insert new member
                const result = await MongoDBContract
                    .collectionInstance(
                        parish_code,
                        DBDetails.parishAssociationsCollection
                    ).updateOne({ '_id': associationId },
                        {
                            '$push': {
                                'members_id': association['member_id']
                            }
                        });

                resp.json({
                    'response': ((result.modifiedCount + result.upsertedCount) > 0)
                        ? 'success'
                        : 'could not save updates'
                });
            } else {
                resp.json({
                    'response': 'member already exists in the association'
                });
            }

        } else {
            resp.json({
                'response': 'association does not exist'
            });
        }
    } else {
        return resp.json({ 'response': 'unauthorised request' });
    }
}

// update association
export async function updateAssociation(req, resp) {
    const { parish_code, parish_password, association } = req.body;
    if (!parish_code || !parish_password || !association) {
        return resp.json({ 'response': 'empty details' });
    }

    if (parishExists(parish_code, parish_password)) {
        const result = await MongoDBContract
            .collectionInstance(
                parish_code,
                DBDetails.parishAssociationsCollection
            ).updateOne({ '_id': association['_id'] },
                {
                    '$set': { 'name': association['name'] }
                });

        resp.json({
            'response': ((result.modifiedCount + result.upsertedCount) > 0)
                ? 'success'
                : 'could not save updates'
        });

    } else {
        return resp.json({ 'response': 'unauthorised request' });
    }
}

// delete association
export async function deleteAssociation(req, resp) {
    const { parish_code, parish_password, association_id } = req.body;
    if (!parish_code || !parish_password || !association_id) {
        return resp.json({ 'response': 'empty details' });
    }

    if (parishExists(parish_code, parish_password)) {
        const result = await MongoDBContract
            .deletedOneByFilterFromCollection(
                parish_code,
                DBDetails.parishAssociationsCollection,
                { '_id': association_id }
            );

        resp.json({
            'response': result
                ? 'success'
                : 'could not delete'
        });

    } else {
        return resp.json({ 'response': 'unauthorised request' });
    }
}
