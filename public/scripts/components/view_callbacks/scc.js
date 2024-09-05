import { ParishDataHandle } from "../../data_pen/parish_data_handle.js";
import { getAllMembersWithoutSCC } from "../../data_pen/puppet.js";
import { getParishSCCs } from "../../data_source/main.js";
import { PRIESTS_COMMUNITY_NAME } from "../../data_source/other_sources.js";
import { addChildrenToView } from "../../dom/addChildren.js";
import { domCreate } from "../../dom/query.js";
import { clearTextEdits } from "../../dom/text_edit_utils.js";
import { Post } from "../../net_tools.js";
import { marginRuleStyles } from "../../parish_profile.js";
import { ModalExpertise } from "../actions/modal.js";
import { MessegePopup } from "../actions/pop_up.js";
import { OutstationPicker } from "../tailored_ui/outstation_picker.js";
import { PDFPrintButton } from "../tailored_ui/print_button.js";
import { Column, MondoText, TextEdit, Button, VerticalScrollView, MondoBigH3Text, Row } from "../UI/cool_tool_ui.js";
import { TextEditValueValidator } from "../utils/textedit_value_validator.js";

export function promptAddSCCView() {
    const sccNameI = TextEdit({ 'placeholder': 'scc name' });
    const outstationPicker = OutstationPicker({
        'styles': marginRuleStyles,
        'onchange': function (ev) {
        },
        'outstations': ParishDataHandle.parishOutstations
    });

    const button = Button({
        'styles': marginRuleStyles,
        'text': 'submit',
        'onclick': async function (ev) {
            try {
                const outstationId = JSON.parse(outstationPicker.value)['_id'];

                TextEditValueValidator.validate('SCC name', sccNameI);
                const body = {
                    'scc': {
                        'name': sccNameI.value,
                        'outstation_id': outstationId
                    }
                };

                let result = await Post('/parish/add/scc', body, { 'requiresParishDetails': true });
                let msg = result['response'];

                MessegePopup.showMessegePuppy([MondoText({ 'text': msg })]);
                if (msg.match('success' || msg.match('save'))) {
                    clearTextEdits([sccNameI]);
                    ParishDataHandle.parishSCCs = await getParishSCCs();
                }
            } catch (error) {
                MessegePopup.showMessegePuppy([MondoText({ 'text': error })]);
            }
        }
    })

    const column = Column({
        'styles': marginRuleStyles,
        'classlist': ['f-w', 'f-c', 'a-c'],
        'children': [
            sccNameI,
            outstationPicker,
            button
        ]
    });

    ModalExpertise.showModal({
        'actionHeading': 'add an SCC',
        'modalChildStyles': [{ 'width': '80%', 'height': '300px' }],
        'children': [column],
        'fullScreen': false,
        'dismisible': true
    })
}

export function viewSCCsPage() {
    const tableId = 'sccs-table';

    const table = domCreate('table');
    table.id = tableId;

    const thead = domCreate('thead');
    const tbody = domCreate('tbody');
    const tfoot = domCreate('tfoot');

    thead.innerHTML = `
        <tr>
            <td>NO</td>
            <td>SCC</td>
            <td>OUTSTATION</td>
            <td>MEMBER COUNT</td>
        </tr>
    `
    addChildrenToView(table, [thead, tbody, tfoot]);
    ParishDataHandle.parishSCCs.forEach(function (scc, i) {
        let outstation = ParishDataHandle.parishOutstations.find(function (o) {
            return o['_id'] === scc['outstation_id']
        }) || { 'name': 'EVERY OUTSTATION' };

        let members = ParishDataHandle.parishMembers.filter(function (m) {
            console.log(scc, '::::', m);

            return m['scc_id'] === scc['_id']
        }).length;
        const row = domCreate('tr');
        row.innerHTML = `
            <td>${i + 1}</td>
            <td>${scc['name']}</td>
            <td>${outstation['name']}</td>
            <td>${members}</td>
        `
        table.appendChild(row);
    });
    const lastRow = domCreate('tr');
    lastRow.innerHTML = `
        <td colspan="3">TOTAL</td>
        <td>${ParishDataHandle.parishMembers.length}</td>
    `
    table.appendChild(lastRow)

    const column = Column({
        'classlist': ['f-w', 'a-c', 'just-center', 'scroll-y'],
        'styles': [{ 'padding': '10px' }],
        'children': [table]
    });

    ModalExpertise.showModal({
        'modalHeadingStyles': [{ 'background': 'gainsboro' }, { 'color': 'white' }],
        'actionHeading': `small Christian Communities (${ParishDataHandle.parishSCCs.length})`,
        'topRowUserActions': [new PDFPrintButton(tableId)],
        'children': [column],
        'modalChildStyles': [{ 'width': 'fit-content' }, { 'height': '90%' }],
        'fullScreen': false,
        'dismisible': true,
    });
}