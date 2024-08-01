const { DBConstants } = require("../../../db/dbConstants");
const { DBUtils } = require("../../../db/dbUtils");

const registeredParishes = async (_, resp) => {
    const parishes = await DBUtils
        .GET_ALL_FROM_COLLECTION(
            DBConstants.REGISTERED_PARISHES_DB_NAME,
            DBConstants.REGISTERED_PARISHES_COLLECTION
        );

    resp.json(parishes);
}

module.exports = { registeredParishes }