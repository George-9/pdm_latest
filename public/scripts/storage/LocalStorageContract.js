import { LocalStorageValues } from "./storage_details.js";

/**
 * Simplified localstorage access for parish details
 */
export class LocalStorageContract {
    constructor() { }

    static allDetails() { return localStorage.getItem(LocalStorageValues.parishDetailsKey); }
    static parishName() { return LocalStorageContract.allDetails()['name']; }
    static parishEmail() { return LocalStorageContract.allDetails()['email']; }
    static parishPassword() { return LocalStorageContract.allDetails()['password']; }
    static parishId() { return LocalStorageContract.allDetails()['id']; }

    static parishNotLoggedIn() { return LocalStorageContract.allDetails() === null; }
}