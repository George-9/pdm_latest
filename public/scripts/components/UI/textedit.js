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
    type = '',
    width = '200px',
    styles = [],
    onType = new Function(),
    onSubmit = new Function()
}) {
    const input = domCreate('input');

    input.setAttribute('type', type ?? 'text');
    input.placeholder = placeholder ?? '';
    input.style.width = width ?? '200px';
    input.style.padding = '10px';
    input.style.margin = '5px';

    /**
     * null better than undefined, rule of the thumb
     */
    input.addEventListener('input', onType ?? null);
    input.addEventListener('submit', onSubmit ?? null);

    StyleView(input, styles);
    return input;
}