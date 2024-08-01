import { GEL_INPUT_EL_VALUE_BY_ID, GET_EL_BY_ID } from "../../tools/dom.js";
import { SimplifiedNavigator } from "../../tools/navigator.js";
import { NetTool } from "../../tools/netTool.js";
import { LocalStorageContract } from "../../tools/storage.js";
import { IS_NULL_OR_EMPTY } from "../../tools/stringUtils.js";
import { PARISH_CONSTATS } from "../constants.js";

window.onload = Main;

function Main() {
    GET_EL_BY_ID('logInButton').onclick = LogIn;
}

async function LogIn() {
    const code = GEL_INPUT_EL_VALUE_BY_ID('code')
    const password = GEL_INPUT_EL_VALUE_BY_ID('password')

    if (IS_NULL_OR_EMPTY(code) || IS_NULL_OR_EMPTY(password)) {
        GET_EL_BY_ID('notifier').innerText = "All details must be filled";

        return;
    }

    const response = await NetTool.POST_CLIENT('/parish/login',
        NetTool.CMMN_HEADERS.JSON_CONTENT_TYPE,
        JSON.stringify({
            'code': code,
            'password': password
        }));

    const result = (await response.json())['response'];
    GET_EL_BY_ID('messege').innerHTML = result;

    if (result === 'success') {
        GET_EL_BY_ID('logInButton').onclick = null;
        const parishDetails = await (await NetTool.POST_CLIENT('/parish/details',
            NetTool.CMMN_HEADERS.JSON_CONTENT_TYPE,
            JSON.stringify({
                'code': code
            })
        )).json()

        const parishId = parishDetails['name'];
        const outstations = await (await NetTool.POST_CLIENT('/get/outstations',
            NetTool.CMMN_HEADERS.JSON_CONTENT_TYPE, JSON.stringify({
                id: parishId
            }))).json();

        LocalStorageContract.SAVE_DATA(PARISH_CONSTATS.local_storage_key, parishDetails)
        if (!outstations || outstations.length < 1) {
            SimplifiedNavigator.NavigateByReplacement('set up page')
        } else {
            SimplifiedNavigator.NavigateByReplacement('pdm')
        }
    }

    setTimeout(() => {
        GET_EL_BY_ID('messege').innerText = result == 'success' ? 'setting up parish details' : '';
    }, 3000);
}