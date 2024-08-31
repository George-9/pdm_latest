import { addClasslist, StyleView } from "../utils/stylus.js";

export function MondoSelect({ styles = [], classlist = [], onChange = new Function() }) {
    // used dom for better intellisense
    // could've used domCreate api
    const selectEl = document.createElement('select');

    selectEl.style.padding = '20px';
    selectEl.style.width = '300px';

    StyleView(selectEl, styles);
    addClasslist(selectEl, classlist);

    return selectEl;
}