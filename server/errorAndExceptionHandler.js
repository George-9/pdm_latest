const fs = require('fs');
const { join } = require('path');

const { DebugUtils } = require('./utils/debug_utils');

module.exports = {
    'err_handler': class ERROR_AND_EXCEPTION_HANDLER {
        static handleErrorOrException(errorOrExceptionObject = new Error()) {
            ERROR_AND_EXCEPTION_HANDLER.#logIt(errorOrExceptionObject);
        }

        static #logIt(errorOrExceptionObject = new Error()) {
            DebugUtils.PRINT(errorOrExceptionObject.message);
            ERROR_AND_EXCEPTION_HANDLER.#writeToFile(errorOrExceptionObject, 'error.txt');
        }

        static #writeToFile(errorOrExceptionObject = new Error(), path = '') {
            try {
                const dir = join(__dirname, "errors");
                fs.appendFile(dir, errorOrExceptionObject.message, () => { null; })
            }
            catch (error) {
                console.log(error);
            }
        }
    }
}