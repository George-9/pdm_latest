/** converts values of an object to uppercase
* @param {object} obj 
* @returns the object with values converted to uppercase
*/

export function mapValuesToUppercase(obj) {
    const result = {};
    for (const key in obj) {
        if (typeof obj[key] !== 'string' || `${obj[key]}`.length === 24) {
            result[key] = obj[key];
        } else if (key.trim().match('_id')) {
            result[`${key}`.trim()] = `${obj[key]}`.trim();
        } else {
            result[`${key}`.trim()] = `${obj[key]}`.trim().toUpperCase();
        }
    }
    return result;
}