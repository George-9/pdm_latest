import { domCreate } from "../../dom/query.js";
import { StyleView } from "../utils/stylus.js";

/**
 * A simplified and somehow opinionated text entry view
 * 
 * @version 1.0.0
 * @author George Muigai Njau
 */
export function TextEdit({
    placeholder = '',
    width,
    styles = [],
    onType = new Function(),
    onSubmit = new Function(),
    type = ''
}) {
    const input = domCreate('input');
    input.setAttribute('type', type ?? 'text');
    input.placeholder = placeholder ?? '';
    input.style.width = width ?? '300px';
    input.style.padding = '10px';
    input.style.margin = '5px';

    if (type) {
        input.setAttribute('type', `${type}`);
    }

    if (type === 'date' || input.getAttribute('type') === 'date') {
        input.addEventListener('click', function () {
            input.focus();
            input.showPicker();
        })
    }
    else {
        input.addEventListener('input', function (ev) {
            ev.preventDefault();
            onType(ev);
        });

        input.addEventListener('submit', onSubmit ?? null);
    }

    // null better than undefined, rule of the thumb
    StyleView(input, styles);
    return input;
}