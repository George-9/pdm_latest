export function IS_NULL_OR_EMPTY(str) {
    return !str || !(str.toString()) || (str.toString()).length < 1
}