import { ParishDataHandle } from "../../data_pen/parish_data_handle.js";
import { getParishOfferingsRecords } from "../../data_source/main.js";
import { addChildrenToView } from "../../dom/addChildren.js";
import { domCreate, domQuery } from "../../dom/query.js";
import { clearTextEdits } from "../../dom/text_edit_utils.js";
import { Post } from "../../net_tools.js";
import { marginRuleStyles } from "../../parish_profile.js";
import { LocalStorageContract } from "../../storage/LocalStorageContract.js";
import { ModalExpertise } from "../actions/modal.js";
import { MessegePopup } from "../actions/pop_up.js";
import { OutstationPicker } from "../tailored_ui/outstation_picker.js";
import { PDFPrintButton } from "../tailored_ui/print_button.js";
import { Column, Row, MondoText, TextEdit, Button, MondoSelect, HorizontalScrollView } from "../UI/cool_tool_ui.js";
import { GridView } from "../UI/grid.js";
import { addClasslist, StyleView } from "../utils/stylus.js";
import { TextEditValueValidator } from "../utils/textedit_value_validator.js";

export const OfferingTypes = {
    'SUNDAY OFFERING': 'sunday_offering',
    'OTHER OFFERING': 'other_offering',
    // CATHOLIC COLLECTIONS
    'PETER\' PENCE': 'peter_pence',
    'MISSION SUNDAY': 'mission_sunday',
    'EPIPHANY': 'epiphany',
    'HOLY SEPUCHZE': 'holy_sepuchze',
    'VOCATION SUNDAY': 'vocation_sunday',
    'KENDNA': 'kendna'
}


// ADD OFFERING REPORTS
export function promptAddOffering() {
    const outstationPicker = OutstationPicker({ 'outstations': ParishDataHandle.parishOutstations });
    const dateI = TextEdit({ 'type': 'date' });
    const amountI = TextEdit({ 'placeholder': 'amount', 'keyboardType': 'number' });

    const sourceSelect = MondoSelect({});

    const keys = Object.keys(OfferingTypes);
    for (let i = 0; i < keys.length; i++) {
        const offeringType = keys[i];
        const optionEl = domCreate('option');
        optionEl.innerText = offeringType;
        optionEl.value = OfferingTypes[offeringType];
        sourceSelect.appendChild(optionEl);
    }

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
                ParishDataHandle.parishOfferingRecords = await getParishOfferingsRecords();
            }
        }
    });

    const column = Column({
        'classlist': ['f-w', 'f-h', 'a-c', 'm-pad'],
        'children': [
            outstationPicker,
            sourceSelect,
            dateI,
            amountI,
            button
        ]
    });

    ModalExpertise.showModal({
        'modalHeadingStyles': [{ 'background-color': 'cornflowerblue' }, { 'color': 'white' }],
        'actionHeading': 'add offering records',
        'modalChildStyles': [{ 'height': '400px' }],
        'dismisible': true,
        'children': [column],
    });
}


// OFFERING REPORTS
export async function showOfferingReportView() {
    let outstationTotal = 0;

    const offeringTypeOption = MondoSelect({ 'onChange': setRowsValue });
    offeringTypeOption.addEventListener('change', setRowsValue)

    const keys = Object.keys(OfferingTypes);
    for (let i = 0; i < keys.length; i++) {
        const offeringType = keys[i];
        const optionEl = domCreate('option');
        optionEl.innerText = offeringType;
        optionEl.value = OfferingTypes[offeringType];
        offeringTypeOption.appendChild(optionEl);
    }


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
        const footer = table.querySelector('tfoot');
        if (footer) {
            table.removeChild(footer);
        }

        outstationTotal = 0;
        const existingFooter = table.querySelector('tfoot');
        if (existingFooter) {
            table.removeChild(existingFooter);
        }

        const outstation = JSON.parse(outstationPicker.value);
        let outstationsOfferings = ParishDataHandle.parishOfferingRecords.filter(function (offering) {
            return outstation['_id'] === offering['outstation_id'];
        });

        outstationsOfferings = outstationsOfferings.filter(function (offering) {
            return offering['source'] === offeringTypeOption.value;
        });

        if (outstationsOfferings && outstationsOfferings.length < 1) {
            const emptyOfferingRow = domCreate('tr');
            const emptyOfferingView = Row({
                'children': [MondoText({ 'text': 'no offering records were found in this outstation' })]
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
        PDFPrintButton.printingHeading = `${outstation['name']} OUTSTATION OFFERING`;

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
        'classlist': ['f-w', 'a-c'],
        'children': [
            offeringTypeOption,
            outstationPicker,
            HorizontalScrollView({
                'classlist': ['scroll-y', 'f-w', 'just-center', 'a-c'],
                'children': [table]
            })
        ]
    });

    function showWholeParishOfferingRecords() {
        PDFPrintButton.printingHeading = LocalStorageContract.completeParishName() + ' TITHE RECORDS'

        const tableId = 'all-outstations-offering';
        const table = domCreate('table');
        table.id = tableId;

        const tableHead = domCreate('thead');
        tableHead.innerHTML = `
            <tr>
                <td>NO</td>
                <td>OUTSTATION</td>
                <td>AMOUNT</td>
            </tr>
        `
        const tbody = domCreate('tbody');
        const tfoot = domCreate('tfoot');
        addChildrenToView(table, [tableHead, tbody, tfoot]);

        const column = HorizontalScrollView({
            'classlist': ['f-w', 'a-c', 'just-center'],
            'styles': [{ 'margin': '20px' }],
            'children': [table],
        });

        let mappedData = {};
        for (let i = 0; i < ParishDataHandle.parishOutstations.length; i++) {
            const outstation = ParishDataHandle.parishOutstations[i];
            mappedData[outstation['_id']] = {
                'name': outstation['name'],
                '_id': outstation['_id'],
                'amount': 0
            }
        }

        let parishTotal = 0;
        const keys = Object.keys(mappedData)
        for (let i = 0; i < keys.length; i++) {
            const outstationOfferingRecord = mappedData[keys[i]];
            for (let i = 0; i < ParishDataHandle.parishOfferingRecords.length; i++) {
                const offeringRecord = ParishDataHandle.parishOfferingRecords[i];
                if (outstationOfferingRecord['_id'] === offeringRecord['outstation_id']) {
                    parishTotal += outstationOfferingRecord['amount'] += parseFloat(offeringRecord['amount'])
                }
            }
        }

        for (let i = 0; i < keys.length; i++) {
            const data = mappedData[keys[i]];

            const row = domCreate('tr');
            row.innerHTML = `
            <td>${i + 1}</td>
            <td>${data['name']}</td>
            <td>${data['amount']}</td>
            `
            addChildrenToView(tbody, [row]);
        }
        const row = domCreate('tr');
        row.innerHTML = `
        <td colspan="2">TOTAL</td>
            <td>${parishTotal}</td>
            `
        addChildrenToView(tfoot, [row]);
        // VERY USEFUL REDISH PINKISH COLOR
        // [{ 'background-color': '#ff9f9f' }]
        // ALSO THIS
        // #8000003d
        const bgStyles = [{ 'background-color': '#d5d3db' }]
        ModalExpertise.showModal({
            'modalHeadingStyles': [{ 'background-color': 'conrflowerblue' }, { 'color': 'white' }],
            'actionHeading': 'parish offering records',
            'modalHeadingStyles': bgStyles,
            'modalChildStyles': [{ 'min-width': '50%' }],
            'topRowUserActions': [new PDFPrintButton(tableId)],
            'children': [column]
        });
    }

    const showWholeParishOfferingRecordsButton = domCreate('i')
    showWholeParishOfferingRecordsButton.title = 'whole parish records'
    addClasslist(showWholeParishOfferingRecordsButton, ['bi', 'bi-wallet2'])
    showWholeParishOfferingRecordsButton.onclick = showWholeParishOfferingRecords;

    // StyleView(showWholeParishOfferingRecordsButton,
    //     [
    //         { 'background-color': 'gainsboro' },
    //         { 'color': 'black' },
    //         { 'width': 'auto' },
    //         { 'border-radius': '120px' },
    //     ])

    ModalExpertise.showModal({
        'actionHeading': 'offering reports',
        'modalHeadingStyles': [{ 'background-color': 'royalblue' }, { 'color': 'white' }],
        'children': [offeringColumn],
        'topRowUserActions': [showWholeParishOfferingRecordsButton, new PDFPrintButton(offeringTableId)],
        'fullScreen': true,
        'dismisible': true,
    });
}

export async function showOfferingReportsByDateAndTypeOutsationView() {
    const outstationPicker = OutstationPicker({
        'outstations': ParishDataHandle.parishOutstations,
        'styles': marginRuleStyles,
        'onchange': setRowsValue
    });

    const dateSpanPicker = MondoSelect({ onChange: setRowsValue });
    dateSpanPicker.innerHTML = `
        <option selected value="equal">equal</option>
        <option value="before">before</option>
        <option value="after">after</option>
        <option value="between">between</option>
    `

    const viewing = { 'display': 'block' },
        notViewing = { 'display': 'none' };

    const offeringTypeOptionPicker = MondoSelect({});

    const dateEntryElStyles = [{ 'padding': '10px' }];
    const startDateSelect = TextEdit({ 'type': 'date', 'styles': dateEntryElStyles },);
    const endDateSelect = TextEdit({ 'type': 'date', 'styles': dateEntryElStyles });

    startDateSelect.addEventListener('change', setRowsValue);
    startDateSelect.addEventListener('input', setRowsValue)

    endDateSelect.addEventListener('change', setRowsValue);
    endDateSelect.addEventListener('input', setRowsValue);

    offeringTypeOptionPicker.addEventListener('change', function (ev) {
        ev.preventDefault();
        setRowsValue();
    });

    const keys = Object.keys(OfferingTypes);
    for (let i = 0; i < keys.length; i++) {
        const offeringType = keys[i];
        const optionEl = domCreate('option');
        optionEl.innerText = offeringType;
        optionEl.value = OfferingTypes[offeringType];
        offeringTypeOptionPicker.appendChild(optionEl);
    }

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
        <td>SOURCE</td>
        <td>OUTSTATION</td>
    </tr>
    `
    const tbody = domCreate('tbody');
    const tFooter = domCreate('tfoot');

    addChildrenToView(table, [tableHeader, tbody, tFooter]);

    function setRowsValue() {
        tbody.replaceChildren([]);
        tFooter.replaceChildren([]);

        const outstation = JSON.parse(outstationPicker.value);
        const outstationId = outstation['_id'];

        PDFPrintButton.printingHeading = `${outstation['name']} OUTSTATION OFFERING`;

        let selectedOutstationOfferings = ParishDataHandle.parishOfferingRecords.filter(function (offering) {
            return offering['outstation_id'] === outstationId;
        });

        let filteredOfferings = selectedOutstationOfferings;

        if (offeringTypeOptionPicker.value !== 'ALL') {
            filteredOfferings = selectedOutstationOfferings.filter(function (offering) {
                return offering['source'] === offeringTypeOptionPicker.value;
            });
        }

        /**
         * APPLY DATE FILTERS
        */

        if (dateSpanPicker.value === "between") {
            StyleView(endDateSelect, [viewing]);
            filteredOfferings = filteredOfferings.filter(function (offering) {
                const date = new Date(offering['date']);
                if (!endDateSelect.value) {
                    return (date > new Date(startDateSelect.value || new Date().toDateString()));
                } else {
                    return (date > new Date(startDateSelect.value || new Date().toDateString()))
                        &&
                        (date < new Date(endDateSelect.value || new Date().toDateString()));
                }
            });
        } else {
            StyleView(endDateSelect, [notViewing]);
        }

        if (dateSpanPicker.value === "before") {
            filteredOfferings = filteredOfferings.filter(function (offering) {
                const date = new Date(offering['date']);
                const diff = (new Date(new Date(startDateSelect.value).toDateString() || new Date().toDateString()) - date);
                console.log(`start${new Date(startDateSelect.value)} - date ${new Date(date)}`, new Date(date) - new Date(startDateSelect.value), '::', 'before diff', new Date(startDateSelect.value) > date);
                return (new Date(startDateSelect.value) > date);
            });
        }

        if (dateSpanPicker.value === "after") {
            filteredOfferings = filteredOfferings.filter(function (offering) {
                const date = new Date(offering['date']);
                return (date > new Date(startDateSelect.value || new Date().toDateString()));
            });
        }

        if (dateSpanPicker.value === "equal") {
            filteredOfferings = filteredOfferings.filter(function (offering) {
                const date = new Date(offering['date']);
                return (new Date(startDateSelect.value || new Date().toDateString()) - date === 0);
            });
        }

        if (selectedOutstationOfferings && selectedOutstationOfferings.length < 1) {
            const emptyOfferingRow = domCreate('tr');
            const emptyOfferingView = Row({
                'children': [MondoText({ 'text': 'no offering records were found in this outstation' })]
            });
            emptyOfferingRow.innerHTML = `<td colspan="4">
            ${emptyOfferingView.innerHTML}
            </td>`;
            tbody.appendChild(emptyOfferingRow);

            return
        }

        if (filteredOfferings && filteredOfferings.length < 1) {
            const emptyOfferingRow = domCreate('tr');
            const emptyOfferingView = Row({
                'children': [
                    MondoText({
                        'styles': [{ 'width': 'max-content' }],
                        'text': 'no offering records matching your query were found in this outstation'
                    })
                ]
            });
            emptyOfferingRow.innerHTML = `<td colspan="4">
            ${emptyOfferingView.innerHTML}
            </td>`;
            tbody.appendChild(emptyOfferingRow);

            return
        }

        let outstationTotal;
        for (let i = 0; i < filteredOfferings.length; i++) {
            const offeringRecord = filteredOfferings[i];
            const row = domCreate('tr');

            outstationTotal = 0;
            let offeringAmount = offeringRecord['amount'],
                source = offeringRecord['source'],
                date = new Date(offeringRecord['date']).toDateString();

            row.innerHTML = `
            <td> ${i + 1}</td>
            <td>${date}</td>
            <td>${Object.entries(OfferingTypes).find(function (entry) {
                return entry[1] === source;
            })[0]}
            </td>
            <td>${offeringAmount}</td>
            `
            tbody.appendChild(row);

            outstationTotal += parseFloat(offeringAmount);
        }

        tFooter.innerHTML = `
            <tr>
                <td colspan="3">TOTAL</td>
                <td>${outstationTotal}</td>
            </tr>
            `
    }

    // initialize view with a table
    setRowsValue();

    const offeringColumn = Column({
        'classlist': ['f-w', 'a-c', 'scroll-y', 'hide-scroll-x'],
        'children': [

            HorizontalScrollView({
                'classlist': ['f-w', 'a-c', 'just-center'],
                'children': [table]
            })
        ]
    });

    dateSpanPicker.addEventListener('change', setRowsValue);
    const dateCheckersRow = Row({
        'styles': [{ 'align-items': 'baseline' }],
        'classlist': ['a-c', 'just-center'],
        'children': [
            MondoText({ 'text': 'date' }),
            dateSpanPicker,
            endDateSelect,
            startDateSelect,
        ]
    });

    ModalExpertise.showModal({
        'actionHeading': 'offering reports',
        'modalHeadingStyles': [{ 'background-color': 'royalblue' }, { 'color': 'white' }],
        'topRowClasses': ['a-c', 'space-around', 'scroll-x'],
        'topRowUserActions': [
            dateCheckersRow,
            new PDFPrintButton(offeringTableId)
        ],
        'children': [
            GridView({
                'classlist': ['f-w', 'a-c', 'just-center'],
                'children': [
                    offeringTypeOptionPicker,
                    outstationPicker,
                ]
            }),
            offeringColumn
        ],
        'fullScreen': true,
        'dismisible': true,
    });
}


// function showWholeParishOfferingRecords() {
//     PDFPrintButton.printingHeading = LocalStorageContract.parishName() + ' PARISH TITHE RECORDS'

//     const tableId = 'all-outstations-offering';
//     const table = domCreate('table');
//     table.id = tableId;

//     const tableHead = domCreate('thead');
//     tableHead.innerHTML = `
//         <tr>
//             <td>NO</td>
//             <td>OUTSTATION</td>
//             <td>AMOUNT</td>
//         </tr>
//     `
//     const tbody = domCreate('tbody');
//     const tfoot = domCreate('tfoot');
//     addChildrenToView(table, [tableHead, tbody, tfoot]);

//     const column = Column({
//         'styles': [{ 'margin': '20px' }],
//         'children': [table],
//     });

//     let mappedData = {};
//     for (let i = 0; i < ParishDataHandle.parishOutstations.length; i++) {
//         const outstation = ParishDataHandle.parishOutstations[i];
//         mappedData[outstation['_id']] = {
//             'name': outstation['name'],
//             '_id': outstation['_id'],
//             'amount': 0
//         }
//     }

//     let parishTotal = 0;
//     const keys = Object.keys(mappedData)
//     for (let i = 0; i < keys.length; i++) {
//         const outstationOfferingRecord = mappedData[keys[i]];
//         for (let i = 0; i < ParishDataHandle.parishOfferingRecords.length; i++) {
//             const offeringRecord = ParishDataHandle.parishOfferingRecords[i];
//             if (outstationOfferingRecord['_id'] === offeringRecord['outstation_id']) {
//                 parishTotal += outstationOfferingRecord['amount'] += parseFloat(offeringRecord['amount'])
//             }
//         }
//     }

//     for (let i = 0; i < keys.length; i++) {
//         const data = mappedData[keys[i]];

//         const row = domCreate('tr');
//         row.innerHTML = `
//             <td>${i + 1}</td>
//             <td>${data['name']}</td>
//             <td>${data['amount']}</td>
//             `
//         addChildrenToView(tbody, [row]);
//     }
//     const row = domCreate('tr');
//     row.innerHTML = `
//         <td colspan="2">TOTAL</td>
//         <td>${parishTotal}</td>
//         `
//     addChildrenToView(tfoot, [row]);
//     // VERY USEFUL REDISH PINKISH COLOR
//     // [{ 'background-color': '#ff9f9f' }]
//     // ALSO THIS
//     // #8000003d
//     const bgStyles = [{ 'background-color': '#9fffb4' }]
//     ModalExpertise.showModal({
//         'actionHeading': 'parish offering records',
//         'modalHeadingStyles': bgStyles,
//         'topRowUserActions': [new PDFPrintButton(tableId)],
//         'children': [column]
//     });
// }

// const showWholeParishOfferingRecordsButton = domCreate('i')
// showWholeParishOfferingRecordsButton.title = 'whole parish records'
// addClasslist(showWholeParishOfferingRecordsButton, ['bi', 'bi-wallet2'])
// showWholeParishOfferingRecordsButton.onclick = showWholeParishOfferingRecords;

// StyleView(showWholeParishOfferingRecordsButton,
//     [
//         { 'background-color': 'gainsboro' },
//         { 'color': 'black' },
//         { 'width': 'auto' },
//         { 'border-radius': '120px' },
//     ])
