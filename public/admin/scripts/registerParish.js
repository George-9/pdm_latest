import { GEL_INPUT_EL_VALUE_BY_ID, GET_EL_BY_ID } from "../../tools/dom.js";
import { NetTool } from "../../tools/netTool.js";
import { IS_NULL_OR_EMPTY } from "../../tools/stringUtils.js";

window.onload = run

function run() {
    GET_EL_BY_ID('login-button').onclick = registerParish
}

async function registerParish() {
    const adminEmail = GEL_INPUT_EL_VALUE_BY_ID('adminEmailSrc');
    const adminPassword = GEL_INPUT_EL_VALUE_BY_ID('adminPasswordSrc');
    const parishName = GEL_INPUT_EL_VALUE_BY_ID('parishNameSrc');
    const parishEmail = GEL_INPUT_EL_VALUE_BY_ID('parishEmailSrc');
    const parishCode = GEL_INPUT_EL_VALUE_BY_ID('parishCodeSrc');
    const parishPassword = GEL_INPUT_EL_VALUE_BY_ID('parishPasswordSrc');

    const data = {
        adminEmail: adminEmail,
        adminPassword: adminPassword,
        parishName: parishName,
        parishEmail: parishEmail,
        id: parishEmail.substring(0, parishEmail.indexOf('@')),
        parishCode: parishCode,
        parishPassword: parishPassword
    }

    console.log(data);

    for (const key in data) {
        if (Object.hasOwnProperty.call(data, key)) {
            const entryData = data[key];
            if (IS_NULL_OR_EMPTY(entryData)) {
                return alert(key + " is required")
            }
        }
    }

    const request = await NetTool.POST_CLIENT(
        '/register/parish',
        NetTool.CMMN_HEADERS.JSON_CONTENT_TYPE,
        JSON.stringify(data)
    )

    alert((await request.json()).response);
}