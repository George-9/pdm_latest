
/**
 * A JSON Factory
 * 
 * @author George Muigai Njau
 */
class JSON_TOOL {
    /**
     * *clean* - a trimmed string
     * parses an object and returns clean keys and objects
     * @param {Object | Map} object the object to clean
     * @returns a clean json object
     */
    static async CLEAN_OBJECT(object) {
        if (!object || !(Object.keys(object)) || Object.keys(object).length < 1) {
            return {};
        }

        const tmp = {}
        const keys = Object.keys(object)

        for await (const key of keys) {
            if (key || key.trim()) {
                tmp[key.toString().trim()] = (object[key]).toString().trim()
            }
        }
        return tmp
    }
}

module.exports = { JSON_TOOL }