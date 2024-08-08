import { CREATE_ELEMENT, GET_EL_BY_ID } from "../../../tools/dom.js";
import { ModalExpertise } from "../../../tools/modal.js";
import { NetTool } from "../../../tools/netTool.js";
import { LocalStorageContract } from "../../../tools/storage.js";


let agGridApi

function createTable(obj) {
    const div = CREATE_ELEMENT('div');
    div.id = 'member-card';
    div.style.height = '200px';
    div.style.paddingTop = '5px';
    div.classList.add('flex-column', 'full-height', 'full-width', 'align-center', 'justify-center', 'scroll-y')

    const table = document.createElement('table');
    table.style.textAlign = 'center';
    table.classList.add('full-width', 'full-height', 'scroll-y')
    table.style.borderCollapse = 'collapse';
    table.style.width = '70%';
    table.style.margin = '10px';

    const heading = document.createElement('caption');
    heading.style.fontWeight = 'bold';
    heading.style.marginBottom = '10px';
    table.appendChild(heading);

    for (const [key, value] of Object.entries(obj)) {
        if (key === '_id') {
            continue;
        }

        const row = document.createElement('tr');

        const keyCell = document.createElement('td');
        keyCell.textContent = key.toUpperCase();
        keyCell.style.border = '1px solid black';
        keyCell.style.padding = '8px';
        keyCell.style.textAlign = 'start';
        keyCell.style.fontWeight = 'bold';
        row.appendChild(keyCell);

        // Create the value cell
        const valueCell = document.createElement('td');
        valueCell.textContent = value.toString().toUpperCase();
        valueCell.style.border = '1px solid black';
        valueCell.style.textAlign = 'end';
        valueCell.style.padding = '8px';
        row.appendChild(valueCell);

        // Append the row to the table
        table.appendChild(row);
    }

    div.append(table)
    return div;
}


document.addEventListener('DOMContentLoaded', async (ev) => {
    ev.preventDefault();

    const records = await (await NetTool.POST_CLIENT('/parish/offering/all/records',
        NetTool.CMMN_HEADERS.JSON_CONTENT_TYPE,
        JSON.stringify({ 'parish_id': LocalStorageContract.STORED_PARISH_ID() })
    )).json();

    const mainDiv = GET_EL_BY_ID('main-div');
    if (!records || records.length < 1) {
        mainDiv.style.textAlign = 'center';
        mainDiv.innerText = 'NO RECORDS FOUND';
    }
    else {
        const gridOptions = {
            columnDefs: [
                {
                    'field': 'date',
                    'headerCheckboxSelection': true,
                    'checkboxSelection': true,

                    'filter': 'agDateColumnFilter',
                    'cellEditor': 'datePicker'
                },
                {
                    'field': 'amount',
                },
                {
                    'field': 'outstation',
                    'checkboxSelection': true,
                    'editable': true,
                }
            ],
            defaultColDef: {
                filter: "agTextColumnFilter",
            },
            onRowDoubleClicked: (ev) => {
                const offeringRecord = ev.data;
                const offeringRecordViewTable = createTable(offeringRecord)
                const div = CREATE_ELEMENT('div')
                div.style.padding = '20px';
                div.classList.add('flex-column', 'full-width', 'full-height')

                const pdfPrintButton = CREATE_ELEMENT('img');
                pdfPrintButton.classList.add('icon')
                pdfPrintButton.src = '../../../resources/icons/pdf.png';
                pdfPrintButton.style.paddingRight = '10px';

                pdfPrintButton.onclick = (ev) => {
                    ev.preventDefault();

                    printJS({
                        printable: 'member-card',
                        type: 'html',
                        header: `<h3>${LocalStorageContract.STORED_PARISH_ID().toUpperCase()} PARISH</h3>`,
                        gridStyle: 'padding: 10px; width: 100%;'
                    })
                }

                for (const key in offeringRecord) {
                    if (Object.hasOwnProperty.call(offeringRecord, key)) {
                        if (key === '_id') {
                            continue
                        }

                        const value = ev.data[key];

                        const row = CREATE_ELEMENT('div')
                        row.classList.add('flex-row', 'align-center');
                        row.style.maxHeight = '50px';
                        row.style.border = '1px solid grey';
                        row.classList.add('flex-row');

                        const kView = CREATE_ELEMENT('h4');
                        kView.style.fontWeight = '300';
                        const valueView = CREATE_ELEMENT('h4');
                        valueView.style.fontWeight = '100';

                        kView.innerText = key.split('_').join(' ');
                        valueView.innerText = ": " + value;

                        row.append(kView, valueView);
                        div.appendChild(row);
                    }
                }

                ModalExpertise.ShowModal(`offering for date ${offeringRecord['date']}`, offeringRecordViewTable, {
                    'modalChildStylesClassList': [],
                    titleColor: 'black',
                    headingColor: '#efc9c9',
                    TopButton: pdfPrintButton,
                    topButtonToolip: 'Print Member Card'
                })
            },
            rowSelection: "multiple",
            suppressRowClickSelection: true,
            pagination: true,
            paginationPageSize: 100,
            paginationPageSizeSelector: [10, 50, 100],
            rowData: records
        }
        const gridDiv = document.querySelector("#myGrid");
        agGridApi = new agGrid.Grid(gridDiv, gridOptions);
    }
});

