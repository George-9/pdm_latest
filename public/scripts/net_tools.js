import { LocalStorageContract } from "./storage/LocalStorageContract";

export async function Post(
    url,
    data = {},
    onloadStart,
    onload,
    onError,
    onloadEnd
) {
    let body = JSON.stringify({
        ...data,
        'id': LocalStorageContract.parishId(),
        'password': LocalStorageContract.parishPassword()
    });

    let cli = new XMLHttpRequest();

    cli.addEventListener('load', onload ?? null);
    cli.addEventListener('loadstart', onloadStart ?? null);
    cli.addEventListener('loadend', onloadEnd ?? null);
    cli.addEventListener('error', onError ?? null);

    cli.open('POST', url);
    cli.setRequestHeader('content-type', 'application/json');
    cli.send(body)
}
