import { domCreate } from "../../dom/query.js";
import { addClasslist, StyleView } from "../utils/stylus.js";
import { MondoText } from "./mondo_text.js";

/**
 * A custom button that brings with it a `(view object) feel` and
 * effect
 * 
 * @author George Muigai Njau
 * @version 1.0.0
 */
export function Button({ styles = [], classlist = {}, text = '', onclick = new Function() }) {
    const button = domCreate('div');
    const textView = MondoText({ 'text': text });

    button.style.width = '200px';
    addClasslist(button, ['fx-row', 'just-center', 'txt-c', 'a-e', 'button', ...classlist]);
    StyleView(button, styles);

    button.appendChild(textView);
    button.onclick = onclick ?? null;

    return button;
}