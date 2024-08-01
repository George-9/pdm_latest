import { PARISH_CONSTATS } from "../parish/constants.js";

/**
 * simplified Contract for and of the basic local
 *  storage utility
 * 
 * @version 1.0.0
 * @author George Muigai N.
 */
export class LocalStorageContract {
    /**
     * checks if storage has anything stored
     * @returns true if localstorage has no stored items
     */
    static STORAGE_IS_EMPTY = () => localStorage.length < 1;

    static SAVE_DATA = (key = "", item = new Object()) => {
        try {
            if (key.trim().length < 0) {
                throw new EmptyStringError();
            }
            return localStorage.setItem(key, JSON.stringify(item));
        } catch (error) {
            return showToast(error);
        }
    }

    static GET_STORED_JSON_ITEM_BY_KEY = (key = '') => {
        const ERROR_MESSAGE = `Error Retireving store item by key '${key}'`;

        if (key.trim().length < 0) { throw new EmptyStringError(); }

        const storedItem = localStorage.getItem(key);
        if (storedItem) {
            if (JSON.parse(storedItem)) {
                return JSON.parse(storedItem)
            }
        } else throw new Error(ERROR_MESSAGE)
    }

    static STORED_PARISH_EMAIL() {
        return LocalStorageContract.STORED_PARISH_CREDENTIALS().ParishEmail
    }

    static STORED_PARISH_ID() {
        return LocalStorageContract.STORED_PARISH_CREDENTIALS().id
    }

    static STORED_PARISH_PASSWORD() {
        return LocalStorageContract.STORED_PARISH_CREDENTIALS().ParishPassword;
    }

    static STORED_PARISH_CREDENTIALS() {
        const details = LocalStorageContract.GET_STORED_JSON_ITEM_BY_KEY(PARISH_CONSTATS.local_storage_key)

        return details;
    }
}


class EmptyStringError extends Error {
    constructor(error) {
        super(error ?? "Empty String")
    }
}