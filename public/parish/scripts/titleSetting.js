import { GET_EL_BY_ID } from "../../tools/dom.js";
import { LocalStorageContract } from "../../tools/storage.js";

document.addEventListener('DOMContentLoaded', DisplayProfileDetails)

async function DisplayProfileDetails() {
    GET_EL_BY_ID('profile-details').innerText = 'Parish • ' + LocalStorageContract.STORED_PARISH_CREDENTIALS()['name'];
}