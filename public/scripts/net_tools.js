import { LocalStorageContract } from "./storage/LocalStorageContract.js";

export async function Post(
    url,
    data = {},
    { requiresParishDetails = false }
) {
    let body = { ...data };

    if (requiresParishDetails) {
        if ((requiresParishDetails && requiresParishDetails === true)) {
            body['parish_code'] = LocalStorageContract.parishId();
            body['parish_password'] = LocalStorageContract.parishPassword();
        }
    }

    let cli = await fetch(
        url,
        {
            'method': 'POST',
            'headers': { 'content-type': 'application/json', },
            'body': JSON.stringify(body)
        }
    );

    return await cli.json() || await cli.text()
}
