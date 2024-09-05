import { ParishDataHandle } from "../../data_pen/parish_data_handle.js";
import { getParishOutstations } from "../../data_source/main.js";
import { addChildrenToView } from "../../dom/addChildren.js";
import { domCreate } from "../../dom/query.js";
import { clearTextEdits } from "../../dom/text_edit_utils.js";
import { Post } from "../../net_tools.js";
import { ModalExpertise } from "../actions/modal.js";
import { MessegePopup } from "../actions/pop_up.js";
import { PDFPrintButton } from "../tailored_ui/print_button.js";
import { Column } from "../UI/column.js";
import { Button, MondoBigH3Text, MondoText, Row, TextEdit, VerticalScrollView } from "../UI/cool_tool_ui.js";
import { TextEditValueValidator } from "../utils/textedit_value_validator.js";

export function promptAddOutstationView() {
    const nameTextEdit = TextEdit({ 'placeholder': 'outstation name' });

    const button = Button({ 'text': 'submit' });
    button.onclick = async function (ev) {
        ev.preventDefault();
        try {
            TextEditValueValidator.validate('outstation name', nameTextEdit);

            let result = await Post('/parish/add/outstation',
                { outstation: { 'name': nameTextEdit.value } },
                { 'requiresParishDetails': true });
            let msg = result['response'];

            MessegePopup.showMessegePuppy([new MondoText({ 'text': msg })])
            if (msg.match('success') || msg.match('save')) {
                clearTextEdits([nameTextEdit]);
                ParishDataHandle.parishOutstations = await getParishOutstations();
            }
        } catch (error) {
            MessegePopup.showMessegePuppy([MondoText({ 'text': error })])
        }
    }

    const column = Column({
        'children': [nameTextEdit, button],
        'classlist': ['f-w', 'a-c']
    });
    column.style.paddingTop = '30px';

    ModalExpertise.showModal({
        'actionHeading': 'add outstations to your parish',
        'children': [column],
        'fullScreen': false,
        'modalChildStyles': [{ 'width': '400px', 'height': '50%' }]
    });
}

export function viewOutstationsPage() {
    const tableId = 'outstations-table';

    const table = domCreate('table');
    table.id = tableId;

    const thead = domCreate('thead');
    const tbody = domCreate('tbody');
    const tfoot = domCreate('tfoot');

    thead.innerHTML = `
        <tr>
            <td>NO</td>
            <td>OUTSTATION</td>
            <td>SCCs</td>
            <td>MEMBER COUNT</td>
        </tr>
    `
    addChildrenToView(table, [thead, tbody, tfoot]);
    ParishDataHandle.parishOutstations.forEach(function (outstation, i) {
        let sccCount = ParishDataHandle.parishSCCs.filter(function (scc) {
            return scc['outstation_id'] === outstation['_id']
        }).length;

        let membersCount = ParishDataHandle.parishMembers.filter(function (m) {
            return m['outstation_id'] === outstation['_id']
        }).length;

        const row = domCreate('tr');
        row.innerHTML = `
            <td>${i + 1}</td>
            <td>${outstation['name']}</td>
            <td>${sccCount}</td>
            <td>${membersCount}</td>
        `
        table.appendChild(row);
    });
    const lastRow = domCreate('tr');
    lastRow.innerHTML = `
        <td colspan="2">TOTAL</td>
        <td>${ParishDataHandle.parishSCCs.length}</td>
        <td>${ParishDataHandle.parishMembers.length}</td>
    `
    table.appendChild(lastRow)

    const column = Column({
        'styles': [{ 'margin': '10px' }, { 'padding': '10px' }],
        'classlist': ['f-w', 'a-c', 'just-center', 'scroll-y'],
        'children': [table]
    });

    ModalExpertise.showModal({
        'topRowUserActions': [new PDFPrintButton(tableId)],
        'modalHeadingStyles': [{ 'background': 'royalblue' }, { 'color': 'white' }],
        'actionHeading': `parish outstations (${ParishDataHandle.parishOutstations.length})`,
        'children': [column],
        'modalChildStyles': [{}],
        'fullScreen': false,
        'dismisible': true,
    });
}
