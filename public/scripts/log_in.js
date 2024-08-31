import { Post } from "./net_tools.js";

/**
 * Logs in the Parish
 * 
 * @param {string} detail either email or parish-code
 * @param {string} password parish password
 */
export function ParishLogIn(email, password) {
    return Post('/parish/log/in', {
        email: email,
        password: password
    },
        { 'requiresParishDetails': false }
    );
}