import { LocalStorageValues } from "./storage_details.js";

/**
 * Simplified localstorage access for parish details
 */
export class LocalStorageContract {
    constructor() { }

    static storeDetails(jsonableDetails) {
        if (jsonableDetails) {
            localStorage.setItem(LocalStorageValues.parishDetailsKey, JSON.stringify(jsonableDetails));
        }
    }

    static allDetails() { return JSON.parse(localStorage.getItem(LocalStorageValues.parishDetailsKey)); }
    static completeParishName() {
        let parishName = '';
        parishName = LocalStorageContract.allDetails()['parish_name'];
        return parishName.match('parish') ? parishName : parishName + ' parish'
    }
    static parishEmail() { return LocalStorageContract.allDetails()['parish_email']; }
    static parishPassword() { return LocalStorageContract.allDetails()['parish_password']; }
    static parishId() { return LocalStorageContract.allDetails()['parish_code']; }

    static parishNotLoggedIn() { return LocalStorageContract.allDetails() === null; }
}