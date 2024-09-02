import { addChildrenToView } from "../../dom/addChildren.js";
import { domCreate } from "../../dom/query.js";
import { marginRuleStyles } from "../../parish_profile.js";
import { ModalExpertise } from "../actions/modal.js";
import { OutstationPicker } from "../tailored_ui/outstation_picker.js";
import { PDFPrintButton } from "../tailored_ui/print_button.js";
import { Column, Row, MondoText } from "../UI/cool_tool_ui.js";
import { StyleView } from "../utils/stylus.js";

export default showOfferingReportView

// OFFERING REPORTS
async function showOfferingReportView(parishOfferingRecords, parishOutstations) {
    let outstationTotal = 0;
    const outstationPicker = OutstationPicker({
        'outstations': parishOutstations,
        'styles': marginRuleStyles
    });

    outstationPicker.options[0].selected = true;
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
        let outstationsOfferings = parishOfferingRecords.filter(function (offering) {
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
            <td style="text-align: center;">${parishOutstations.find(function (o) {
                return o['_id'] === (outstationsOffering['outstation_id'])
            })['name']}</td>
            <td>${outstationAmount}</td>
            `
            outstationTotal += parseFloat(outstationAmount);
            tbody.appendChild(row);
        }
        const tFooter = domCreate('tfoot');
        tFooter.innerHTML = `
                <tr>
                <td colspan="3">TOTAL</td>
                <td>${outstationTotal}</td>
            </tr>
                `
        table.appendChild(tFooter)
    }

    // initialize view witha table
    setRowsValue();
    outstationPicker.addEventListener('change', function (ev) {
        ev.preventDefault();
        setRowsValue();
    });

    const offeringColumn = Column({
        children: parishOfferingRecords.map(function (m) {
            return Column({
                'classlist': ['f-w', 'a-c', 'scroll-y'],
                'children': [outstationPicker, table]
            })
        })
    });

    ModalExpertise.showModal({
        'actionHeading': 'offering reports',
        'children': [offeringColumn],
        'topRowUserActions': [
            PDFPrintButton(
                offeringTableId,
                `OFFERING ${JSON.parse(outstationPicker.value)['name']} `
            )
        ],
        'dismisible': true,
    });
}
