const { DBConstants } = require("../../../db/dbConstants");
const { DBUtils } = require("../../../db/dbUtils");
const { DateUtil } = require("../../utils/dateUtil");
const { DebugUtils } = require("../../utils/debug_utils");

async function registerParishCallback(req, resp) {
    const details = req.body;

    const parishDetails = {
        name: details.parishName,
        email: details.parishEmail,
        id: details.id,
        code: details.parishCode,
        password: details.parishPassword
    }

    const id = parishDetails.email.substring(0, parishDetails.email.indexOf("@"));

    DebugUtils.PRINT(parishDetails)

    if (await DBUtils.PDM_SYS_ADMIN_EXISTS(details.adminEmail, details.adminPassword)) {
        if ((await DBUtils.PARISH_EXISTS(parishDetails.code, parishDetails.password))) {
            resp.json({ 'response': 'a parish with the given details is already registered' });
        } else {

            const registerResult = await DBUtils
                .CONNECTED_DB_CLI(DBConstants.REGISTERED_PARISHES_DB_NAME)
                .collection(DBConstants.REGISTERED_PARISHES_COLLECTION)
                .insertOne({ ...parishDetails, 'registered_on': DateUtil.DATE_TIME_STRING() });

            const createdMembersCollection = await DBUtils.CREATE_COLLECTION(id, DBConstants.PARISH_MEMBERS_COLLECTION);
            const createdOfficeCollection = await DBUtils.CREATE_COLLECTION(id, DBConstants.PARISH_OFFICE_COLLECTION);
            const createdOutstationsCollection = await DBUtils.CREATE_COLLECTION(id, DBConstants.PARISH_OUTSTATIONS_COLLECTION);
            const createdGroupsCollection = await DBUtils.CREATE_COLLECTION(id, DBConstants.PARISH_GROUPS_COLLECTION);

            const registrationSuccessful = registerResult.insertedId !== null
                && createdMembersCollection
                && createdOfficeCollection
                && createdOutstationsCollection
                && createdGroupsCollection;

            return resp.json({
                'response': registrationSuccessful
                    ? 'registration successful'
                    : 'something went wrong'
            });
        }
    } else {
        return resp.json({ 'response': 'unknown admin' });
    }
}

module.exports = { registerParishCallback }