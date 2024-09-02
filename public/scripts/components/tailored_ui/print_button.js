import { domCreate, domQueryById } from "../../dom/query.js";
import { Column } from "../UI/column.js";
import { MondoBigH3Text } from "../UI/mondo_text.js";
import { addClasslist } from "../utils/stylus.js";

const printTableStyle = '* { font-family: arial; padding: 5px; } table { border: 1px solid grey; width: 80%; text-align: center; border-collapse: collapse; } tr, td { border: 1px solid grey; } thead, tfoot { font-weight: 800; }';

/**
 * prints an HTML content using `printJS` api
 * 
 * @param {string} tableId 
 * @param {string} heading
 */
export function PDFPrintButton(tableId, heading) {
    const printPdfButton = domCreate('i');
    addClasslist(printPdfButton, ['bi', 'bi-printer']);

    printPdfButton.onclick = function (ev) {
        const table = domQueryById(tableId);
        if (!tableId || !table) {
            return;
        }

        const printElId = `print - ${tableId} `;
        const el = domQueryById(printElId);

        // remove any pre-existing print element
        if (el) { document.body.removeChild(el); }

        let headingEl = MondoBigH3Text({ 'text': heading ? `${heading} `.toUpperCase() : '' });
        const column = Column({ 'children': [headingEl, table.cloneNode(true)] });
        column.id = printElId;

        // hide the `print content` element
        column.style.zIndex = '-10';
        document.body.appendChild(column);

        printJS({ printable: column.innerHTML, type: 'raw-html', 'style': printTableStyle });
    }

    return printPdfButton;
}
