import { CREATE_ELEMENT, GET_EL_BY_ID } from "../../tools/dom.js";
import { MessegePopup } from "../../tools/messegePopup.js";
import { ModalExpertise } from "../../tools/modal.js";
import { NetTool } from "../../tools/netTool.js";
import { LocalStorageContract } from "../../tools/storage.js";
import { RegisterMember } from "./registerMemberAction.js";

var data, agGridApi, gridOptions;

function getDatePicker() {
    class Datepicker {
        constructor() { }
        init(params) {
            this.eInput = document.createElement('input');
            this.eInput.type = 'date';
            this.eInput.value = params.value;
            this.eInput.classList.add('ag-input');
            this.eInput.style.width = '100%';
        }
        getGui() {
            return this.eInput;
        }
        afterGuiAttached() {
            this.eInput.focus();
            this.eInput.select();
        }
        getValue() {
            return this.eInput.value;
        }
        destroy() { }
        isPopup() {
            return false;
        }
    }
    return Datepicker;
}


GET_EL_BY_ID('add-member').onclick = RegisterMember;
GET_EL_BY_ID('add-member').title = 'Register a new member';

GET_EL_BY_ID('export-pdf').onclick = exportSelectedRowsToPDF;


function exportSelectedRowsToPDF() {
    const selectedRows = gridOptions.api.getSelectedRows();

    if (!selectedRows || selectedRows.length < 1) {
        return MessegePopup.ShowMessegePuppy('you need to select some data in order to export to pdf')
    }
    const doc = new jsPDF();
    const columns = Object.keys(selectedRows[0]).map(key => ({ header: key, dataKey: key }));
    const rows = selectedRows.map(row => Object.values(row));
    doc.autoTable({
        head: [columns.map(col => col.header)],
        body: rows
    });

    const getFileName = prompt('enter a name for the file under which to save and download the data');
    var fileName = !getFileName ? 'data.pdf' : getFileName + '.pdf'

    doc.save(fileName);
}


function actionCellRenderer(params) {
    const eGui = document.createElement('div');
    const editingCells = params.api.getEditingCells();
    const isCurrentRowEditing = editingCells.some(cell => cell.rowIndex === params.node.rowIndex);

    if (isCurrentRowEditing) {
        eGui.innerHTML = `
        <button class="action-button update" data-action="update">Update</button>
        <button class="action-button cancel" data-action="cancel">Cancel</button>
      `;
    } else {
        eGui.innerHTML = `
        <button class="action-button edit" data-action="edit">Edit</button>
        <button class="action-button delete" data-action="delete">Delete</button>
      `;
    }

    eGui.addEventListener('click', function (event) {
        const action = event.target.getAttribute('data-action');
        if (action === 'edit') {
            params.api.startEditingCell({ rowIndex: params.node.rowIndex, colKey: params.column.colId });
        } else if (action === 'cancel') {
            params.api.stopEditing(true);
        } else if (action === 'update') {
            params.api.stopEditing(false);
        } else if (action === 'delete') {
            params.api.applyTransaction({ remove: [params.node.data] });
        }
    });

    return eGui;
}



NetTool.POST_CLIENT('/load/members',
    NetTool.CMMN_HEADERS.JSON_CONTENT_TYPE,
    JSON.stringify({
        id: LocalStorageContract.STORED_PARISH_ID()
    })
).then(response => response.json())
    .then(membersData => {
        data = membersData;

        gridOptions = {
            columnDefs: [
                {
                    'field': "NAME",
                    'headerCheckboxSelection': true,
                    'checkboxSelection': true,
                    'editable': true,
                },
                {
                    'field': "DOB",
                    'headerName': 'Date of Birth',
                    'filter': 'agDateColumnFilter',
                    'editable': true,
                    'cellEditor': 'datePicker'
                },
                { 'field': 'GENDER', cellEditor: "agSelectCellEditor" },
                { 'field': 'FATHER', 'editable': true },
                { 'field': 'MOTHER', 'editable': true },
                {
                    'field': 'GOD PARENT',
                    'headerName': 'God Parent',
                    'editable': true
                },
                { 'field': "home_address", 'editable': true },
                { 'field': "TELEPHONE NUMBER", 'editable': true },
                {
                    'headerName': 'outstation',
                    'editable': true,
                    'field': "outstation",
                    'editable': true,
                    'filter': 'agSetColumnFilter'
                },
                { 'field': "scc", 'editable': true },
                {
                    headerName: 'Actions',
                    field: 'actions',
                    cellRenderer: actionCellRenderer,
                    editable: false,
                    sortable: false,
                    filter: false
                }
            ],

            defaultColDef: {
                filter: "agTextColumnFilter",
            },
            rowSelection: "multiple",
            suppressRowClickSelection: true,
            pagination: true,
            paginationPageSize: 100,
            paginationPageSizeSelector: [10, 50, 100],
            rowData: data,

            onRowDoubleClicked: (ev) => {
                const div = CREATE_ELEMENT('div')
                div.style.padding = '20px';
                div.classList.add('flex-column', 'full-width', 'full-height')

                const optionsDiv = CREATE_ELEMENT('div')
                optionsDiv.classList.add('flex-row', 'full-width', 'align-center', 'justify-end');
                optionsDiv.style.padding = '10px';

                const pdfPrintButton = CREATE_ELEMENT('img');
                pdfPrintButton.classList.add('icon')
                pdfPrintButton.src = '../../resources/icons/pdf.png';
                pdfPrintButton.style.padding = '10px';

                optionsDiv.appendChild(pdfPrintButton);

                for (const key in ev.data) {
                    if (Object.hasOwnProperty.call(ev.data, key)) {
                        if (key === '_id') {
                            continue
                        }

                        const value = ev.data[key];

                        const row = CREATE_ELEMENT('div')
                        row.classList.add('flex-row', 'align-center');
                        row.style.padding = '5px'
                        row.style.maxHeight = '50px'
                        row.style.border = '1px solid grey'
                        row.classList.add('flex-row')

                        const kView = CREATE_ELEMENT('h4');
                        kView.style.fontWeight = '300'
                        const valueView = CREATE_ELEMENT('h4');
                        valueView.style.fontWeight = '100'

                        kView.innerText = key.split('_').join(' ');
                        valueView.innerText = ": " + value;

                        row.append(kView, valueView);
                        div.appendChild(row);
                    }
                }

                div.appendChild(optionsDiv)
                ModalExpertise.ShowModal(ev.data['NAME'], createTable(ev.data), {
                    'modalChildStylesClassList': []
                })
            },
            onRowEditingStarted: (params) => {
                params.api.refreshCells({
                    columns: ['action'],
                    rowNodes: [params.node],
                    force: true,
                });
            },
            onRowEditingStopped: (params) => {
                params.api.refreshCells({
                    columns: ['action'],
                    rowNodes: [params.node],
                    force: true,
                });
            },
            components: {
                actionCellRenderer: actionCellRenderer,
            },
            components: {
                datePicker: getDatePicker(),
            }
        };

        const gridDiv = document.querySelector("#myGrid");
        agGridApi = new agGrid.Grid(gridDiv, gridOptions);
        // agGridApi.setGridOption('domLayout', 'print');
    });

function createTable(obj) {
    const div = CREATE_ELEMENT('div');
    div.style.height = '500px';
    div.style.padding = '18px';
    div.classList.add('flex-column', 'full-height', 'full-width', 'align-center', 'justify-center', 'scroll-y')

    const table = document.createElement('table');
    table.classList.add('full-width', 'full-height', 'scroll-y')
    table.style.borderCollapse = 'collapse';
    table.style.width = '50%';
    table.style.margin = '20px 0';

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
        keyCell.textContent = key;
        keyCell.style.border = '1px solid black';
        keyCell.style.padding = '8px';
        keyCell.style.fontWeight = 'bold';
        row.appendChild(keyCell);

        // Create the value cell
        const valueCell = document.createElement('td');
        valueCell.textContent = value;
        valueCell.style.border = '1px solid black';
        valueCell.style.padding = '8px';
        row.appendChild(valueCell);

        // Append the row to the table
        table.appendChild(row);
    }
    const nameHeading = CREATE_ELEMENT('h3');
    nameHeading.innerText = obj['NAME'];
    nameHeading.style.padding = '10px';
    nameHeading.style.marginTop = '10px';
    nameHeading.style.fontWeight = '100';

    div.append(table)
    return div;
}



document.getElementById('export-excel').onclick = (ev) => {
    ev.preventDefault();
    // let selectedMembers = agGrid.selectedRows;
    // console.log(selectedMembers);


    const selectedRows = gridOptions.api.getSelectedRows();
    if (!selectedRows || selectedRows.length < 1) {
        return MessegePopup.ShowMessegePuppy('you need to select some data in order to export to spreadsheets')
    }

    const getFileName = prompt('enter a name for the file under which to save and download the data');
    var fileName = !getFileName ? 'data.xlsx' : getFileName + '.xlsx'

    const params = {
        fileName: fileName,
        onlySelected: true
    };

    gridOptions.api.exportDataAsCsv(params);
}
