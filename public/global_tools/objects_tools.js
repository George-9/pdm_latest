/** converts values of an object to uppercase
* @param {object} obj 
* @returns the object with values converted to uppercase
*/

export function mapValuesToUppercase(obj) {
    const result = {};
    for (const key in obj) {
        if (`${key}`.toUpperCase().match('GOD') || `${key}`.toUpperCase().match('HOLY')) {
            result[`${key}`.trim().split(' ').join('_')] = obj[key];
        } else {
            const fixedKey = `${key}`.trim().split(" ").join('_').toLowerCase();
            if (typeof obj[key] !== 'string') {
                result[fixedKey] = obj[key];
            } else if (key.trim().match('_id')) {
                result[fixedKey] = `${obj[key]}`.trim();
            } else {
                result[fixedKey] = `${obj[key]}`.trim().toUpperCase();
            }
        }
    }
    return result;
}