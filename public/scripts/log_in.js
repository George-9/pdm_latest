import { Post } from "./net_tools";

/**
 * Logs in the Parish
 * 
 * @param {string} detail either email or parish-code
 * @param {string} password parish password
 */
export function ParishLogIn({ email, password, onloadstart, onload, onerror, onloadEnd }) {
    return Post('/log/in', { email: email, password: password }, onloadstart, onload, onerror, onloadEnd);
}