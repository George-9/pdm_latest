import { ParishDataHandle } from "../../data_pen/parish_data_handle.js";
import { getParishOfferings } from "../../data_source/main.js";
import { addChildrenToView } from "../../dom/addChildren.js";
import { domCreate } from "../../dom/query.js";
import { clearTextEdits } from "../../dom/text_edit_utils.js";
import { Post } from "../../net_tools.js";
import { marginRuleStyles } from "../../parish_profile.js";
import { ModalExpertise } from "../actions/modal.js";
import { MessegePopup } from "../actions/pop_up.js";
import { OutstationPicker } from "../tailored_ui/outstation_picker.js";
import { PDFPrintButton } from "../tailored_ui/print_button.js";
import { Column, Row, MondoText, TextEdit, Button, MondoSelect } from "../UI/cool_tool_ui.js";
import { StyleView } from "../utils/stylus.js";
import { TextEditValueValidator } from "../utils/textedit_value_validator.js";

// ADD OFFERING REPORTS
export function promptAddOffering() {
    const outstationPicker = OutstationPicker({ 'outstations': ParishDataHandle.parishOutstations });
    const dateI = TextEdit({ 'type': 'date' });
    const amountI = TextEdit({ 'placeholder': 'amount' });

    const sourceSelect = MondoSelect({});
    sourceSelect.innerHTML = `
        <option value="Sunday Offering" selected>Sunday Offering</option>
        <option value="Other Offering">Other Offering</option>
    `

    const button = Button({
        'text': 'submit', 'onclick': async function () {
            TextEditValueValidator.validate('outstation', outstationPicker);
            TextEditValueValidator.validate('amount', amountI);
            TextEditValueValidator.validate('date', dateI);

            const body = {
                offering: {
                    outstation_id: JSON.parse(outstationPicker.selectedOptions[0].value)['_id'],
                    source: sourceSelect.selectedOptions[0].value,
                    date: dateI.value,
                    amount: amountI.value,
                }
            }

            let result = await Post('/parish/record/offering', body, { 'requiresParishDetails': true })
            let msg = result['response'];
            MessegePopup.showMessegePuppy([MondoText({ 'text': msg })]);

            if (msg.match('success') || msg.match('save')) {
                clearTextEdits([amountI]);
                ParishDataHandle.parishOfferingRecords = await getParishOfferings();
            }
        }
    })

    const column = Column({
        'classlist': ['f-w', 'f-h', 'a-c'],
        'children': [
            outstationPicker,
            sourceSelect,
            dateI,
            amountI,
            button
        ]
    });

    ModalExpertise.showModal({
        'actionHeading': 'add offering records',
        'modalChildStyles': [{ 'width': '400px', 'height': '400px' }],
        'dismisible': true,
        'children': [column],
    });
}

// OFFERING REPORTS
export async function showOfferingReportView() {
    let outstationTotal = 0;

    const outstationPicker = OutstationPicker({
        'outstations': ParishDataHandle.parishOutstations,
        'styles': marginRuleStyles,
        'onchange': setRowsValue
    });

    StyleView(outstationPicker, [{ 'padding': '10px' }]);

    const offeringTableId = 'offering-table';
    const table = domCreate('table');
    table.id = offeringTableId;
    StyleView(table, [{
        'margin': '20px',
        'min-width': '300px',
        'border-collapse': 'collapse'
    }]);

    const tableHeader = domCreate('thead');
    tableHeader.innerHTML = `
        <tr>
            <td>NO</td>
            <td>DATE</td>
            <td>OUTSTATION</td>
            <td>AMOUNT</td>
        </tr>
    `
    const tbody = domCreate('tbody');
    addChildrenToView(table, [tableHeader, tbody]);

    function setRowsValue() {
        tbody.replaceChildren([]);

        outstationTotal = 0;
        const existingFooter = table.querySelector('tfoot');
        if (existingFooter) {
            table.removeChild(existingFooter);
        }

        const outstation = JSON.parse(outstationPicker.value);
        let outstationsOfferings = ParishDataHandle.parishOfferingRecords.filter(function (offering) {
            return outstation['_id'] === offering['outstation_id'];
        });

        if (outstationsOfferings && outstationsOfferings.length < 1) {
            const emptyOfferingRow = domCreate('tr');
            const emptyOfferingView = Row({
                'children': [
                    MondoText({ 'text': 'no offering records were found in this outstation' })
                ]
            });
            emptyOfferingRow.innerHTML = `<td colspan="4">
            ${emptyOfferingView.innerHTML}
            </td>`;
            tbody.appendChild(emptyOfferingRow);

            return
        }

        tbody.replaceChildren([]);
        for (let i = 0; i < outstationsOfferings.length; i++) {
            const outstationsOffering = outstationsOfferings[i];
            const row = domCreate('tr');

            let outstationAmount = outstationsOffering['amount'];
            row.innerHTML = `
            <td> ${i + 1}</td>
            <td>${outstationsOffering['date']}</td>
            <td style="text-align: center;">${ParishDataHandle.parishOutstations.find(function (o) {
                return o['_id'] === outstationsOffering['outstation_id']
            })['name']}</td>
            <td>${outstationAmount}</td>
            `
            tbody.appendChild(row);

            outstationTotal += parseFloat(outstationAmount);
        }
        PDFPrintButton.printingHeading = `OFFERING ${outstation['name']}`;

        const tFooter = domCreate('tfoot');
        tFooter.innerHTML = `
            <tr>
                <td colspan="3">TOTAL</td>
                <td>${outstationTotal}</td>
            </tr>
            `
        table.appendChild(tFooter);
    }

    // initialize view with a table
    setRowsValue();

    const offeringColumn = Column({
        children: ParishDataHandle.parishOfferingRecords.map(function (m) {
            return Column({
                'classlist': ['f-w', 'a-c', 'scroll-y'],
                'children': [outstationPicker, table]
            })
        })
    });


    ModalExpertise.showModal({
        'actionHeading': 'offering reports',
        'children': [offeringColumn],
        'topRowUserActions': [new PDFPrintButton(offeringTableId)],
        'fullScreen': true,
        'dismisible': true,
    });
}
