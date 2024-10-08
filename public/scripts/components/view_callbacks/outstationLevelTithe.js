import { Button, Column, MondoText, TextEdit } from '../UI/cool_tool_ui.js'
import { OutstationPicker } from '../tailored_ui/outstation_picker.js'
import { ParishDataHandle } from '../../data_pen/parish_data_handle.js'
import { ModalExpertise } from '../actions/modal.js'
import { Post } from '../../net_tools.js'
import { MessegePopup } from '../actions/pop_up.js'
import { getOutstationsLevelTitheRecords } from '../../data_source/main.js'
import { TextEditValueValidator } from '../utils/textedit_value_validator.js'
import { domCreate } from '../../dom/query.js'
import { PDFPrintButton } from '../tailored_ui/print_button.js'
import { addChildrenToView } from '../../dom/addChildren.js'
import { clearTextEdits } from '../../dom/text_edit_utils.js'

export async function promptAddOutstationLevelTithe() {
    const submitButton = Button({ 'text': 'save', 'onclick': saveTitheRecords });

    const outstationPicker = OutstationPicker({ 'outstations': ParishDataHandle.parishOutstations });
    const datePicker = TextEdit({ 'type': 'date' });
    const numberOfEnvelopesEntry = TextEdit({
        'type': 'number',
        'placeholder': 'number of envelopes',
    });
    const totalAmountEntry = TextEdit({
        'type': 'number',
        'placeholder': 'total amount',
    });

    const column = Column({
        'classlist': ['a-c', 'just-center'],
        'children': [
            outstationPicker,
            datePicker,
            numberOfEnvelopesEntry,
            totalAmountEntry,
        ]
    });

    async function saveTitheRecords() {
        TextEditValueValidator.validate('number of envelopes', numberOfEnvelopesEntry);
        TextEditValueValidator.validate('total amount', totalAmountEntry);
        TextEditValueValidator.validate('date', datePicker);

        const outstationId = (JSON.parse(outstationPicker.value))['_id'];
        const numberOfEnvelopes = parseInt(numberOfEnvelopesEntry.value);
        const amount = parseInt(totalAmountEntry.value);
        const date = datePicker.value;

        const body = {
            tithe: {
                'outstation_id': outstationId,
                'number_of_envelopes': numberOfEnvelopes,
                'amount': amount,
                'date': date,
            }
        }

        const result = await Post('/parish/record/outstation/level/tithe', body, {
            'requiresParishDetails': true
        });

        console.log(body);

        const msg = result['response'];
        if (msg.match('save') || msg.match('success')) {
            ParishDataHandle.outstationLevelTitheRecords = await getOutstationsLevelTitheRecords();
            clearTextEdits([numberOfEnvelopes, amount, datePicker]);
        }

        MessegePopup.showMessegePuppy([MondoText({ 'text': msg })]);
    }

    ModalExpertise.showModal({
        'actionHeading': 'parish level tithe',
        'topRowUserActions': [submitButton],
        'children': [column],
        'dismisible': true,
    });
}

export async function showParishLevelTitheRecords() {
    const tableId = 'outstation-tithe-table';

    const outstationPicker = OutstationPicker({
        'outstations': ParishDataHandle.parishOutstations,
        'styles': [{ 'margin-bottom': '20px' }],
    });

    const printButton = new PDFPrintButton(tableId);

    const table = domCreate('table');
    table.id = tableId;

    const thead = domCreate('thead');
    const tbody = domCreate('tbody');
    const tfoot = domCreate('tfoot');

    addChildrenToView(table, [thead, tbody, tfoot]);

    thead.innerHTML = `
    <tr>
    <td>NO</td>
    <td>DATE</td>
    <td>ENVELOPES</td>
    <td>AMOUNT</td>
    </tr>
    `

    outstationPicker.onchange = setViews;

    // initial view
    setViews();

    function setViews() {
        let total = 0;

        PDFPrintButton.printingHeading = `${(JSON.parse(outstationPicker.value))['name']} TITHE RECORDS`

        tfoot.innerHTML = ``;
        tbody.replaceChildren([]);

        for (let i = 0; i < ParishDataHandle.outstationLevelTitheRecords.length; i++) {
            const titheRecord = ParishDataHandle.outstationLevelTitheRecords[i];
            const selectedOutstationId = (JSON.parse(outstationPicker.value))['_id'];
            const outstationId = titheRecord['outstation_id'];

            if (outstationId === selectedOutstationId) {
                const recordAmount = titheRecord['amount'];
                total += recordAmount;

                const trow = domCreate('tr');
                trow.innerHTML = `
                <td>${i + 1}</td>
                <td>${titheRecord['date']}</td>
                <td>${titheRecord['number_of_envelopes']}</td>
                <td>${recordAmount}</td>
                `

                tbody.appendChild(trow);
            }
        }

        tfoot.innerHTML = `
            <tr>
                <td>TOTAL</td>
                <td colspan="3" class="f-w just-end txt-e" style="text-align: end;">${total}</td>
            </tr>
        `
    }

    const mainColumn = Column({
        'styles': [{ 'padding': '10px' }],
        'children': [outstationPicker, table,]
    });

    ModalExpertise.showModal({
        'actionHeading': 'tithe records',
        'fullScreen': true,
        'topRowUserActions': [printButton],
        'children': [mainColumn],
    });
}