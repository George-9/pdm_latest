

/**
 * @author George Muigai Njau
 * 
 * gets an element by its id
 * @param {string} id the id of the element
 * @returns {Node | HTMLElement | null | undefined}
 */
export function GET_EL_BY_ID(id = '') {
    if (id) {
        return document.getElementById(id.toString())
    } else {
        throw new Error('Bad Elemnet id: ', id);
    }
}


/**
 * gets the first element that matches a query search
 * @see {@link document.querySelector()}
 * 
 * @param {string} tag the tag to search by
 * @returns {Node | HTMLElement|null|undefined}
 */
export function QUERY_FIRST_EL(tag = '') {
    const showError = () => console.log("bad elelent tag, ", tag);

    try {
        const node = document.querySelector(tag);
        return node;
    } catch (error) {
        showError();
    }
}


export function CREATE_ELEMENT(elementTag = '') {
    const showError = () => console.log("bad elelent tag, ", elementTag);

    if (elementTag) {
        const el = document.createElement(elementTag)
        if (el) {
            return el;
        } else {
            showError()
        }
    } else {
        showError()
    }
}



export function GEL_INPUT_EL_VALUE_BY_ID(elementId = '') {
    try {

        if (elementId && GET_EL_BY_ID(elementId).value) {
            return GET_EL_BY_ID(elementId).value.toString().trim();
        }

    } catch (error) {
        throw new Error("Error retrieving value from element by id: ", elementId);
    }
}


/**
 * @author George Muigai Njau
 * 
 * adds break as the last child of an element
 * @param {HTMLElement} el the element to add a new line
 * @returns {Node} inserted <br> element
 */
export function breakLine(el) {
    return el.appendChild(CREATE_ELEMENT('br'));
}


/**
 * resets the value (to ('')) of all inputs present the given array
 * @param {Array} param0 a list of input elements
 * @returns {null}
 */
export async function RESET_INPUTS(...inputs) {
    if (!inputs) {
        return
    }

    for await (const input of inputs) {
        if (input && input.value) {
            input.value = '';
        }
    }
}