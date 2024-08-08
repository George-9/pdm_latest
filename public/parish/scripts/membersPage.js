import { CREATE_ELEMENT, GET_EL_BY_ID } from "../../tools/dom.js";
import { MessegePopup } from "../../tools/messegePopup.js";
import { ModalExpertise } from "../../tools/modal.js";
import { NetTool } from "../../tools/netTool.js";
import { LocalStorageContract } from "../../tools/storage.js";
import { RegisterMember } from "./registerMemberAction.js";

var membersList, agGridApi, gridOptions;

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
    const data = gridOptions.api.getSelectedRows();

    if (!data || data.length < 1) {
        return MessegePopup.ShowMessegePuppy('you need to select some data in order to export to pdf')
    }

    for (let i = 0; i < data.length; i++) {
        delete data[i]['_id'];
    }

    // const doc = new jsPDF();
    // const columns = Object.keys(selectedRows[0]).map(key => ({ header: key, dataKey: key }));
    // const rows = selectedRows.map(row => Object.values(row));

    // doc.autoTable({
    //     head: [columns.map(col => col.header)],
    //     body: rows
    // });

    // const getFileName = prompt('enter a name for the file under which to save and download the data');
    // var fileName = !getFileName ? 'data.pdf' : getFileName + '.pdf'

    // doc.save(fileName);
    let table = '<table border="1"><tr>';
    // Get all unique keys
    const keys = [...new Set(data.flatMap(Object.keys))];
    // Create table headers
    keys.forEach(key => {
        table += `<th>${key}</th>`;
    });
    table += '</tr>';

    // Create table rows
    data.forEach(item => {
        table += '<tr>';
        keys.forEach(key => {
            table += `<td>${item[key] || ''}</td>`;
        });
        table += '</tr>';
    });
    table += '</table>';

    const printWindow = window.open('', '', 'height=400,width=600');
    printWindow.document.write('<html><head><title>Print Data</title>');
    printWindow.document.write('</head><body >');
    printWindow.document.write(table);
    printWindow.document.write('</body></html>');
    printWindow.document.close();
    printWindow.print();
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
        membersList = membersData;

        gridOptions = {
            columnDefs: [
                {
                    'field': "NO",
                    'headerCheckboxSelection': true,
                    'checkboxSelection': true,
                },
                {
                    'field': "NAME",
                    'editable': true,
                },
                {
                    'field': "DOB",
                    'headerName': 'Date of Birth',
                    'editable': true,
                    'filter': 'agDateColumnFilter',
                    'cellEditor': 'datePicker'
                },
                {
                    'field': "FATHER",
                    'editable': true,
                },
                {
                    'field': "MOTHER",
                    'editable': true,
                },
                {
                    'field': "HOME_ADDRESS",
                    'headerName': "HOME ADDRESS",
                    'editable': true,
                },
                {
                    'field': "OUTSTATION",
                    'headerCheckboxSelection': true,
                    'checkboxSelection': true,
                    'editable': true,
                },
                {
                    'field': "SCC",
                    'headerCheckboxSelection': true,
                    'checkboxSelection': true,
                    'editable': true,
                },
                {
                    'field': 'GENDER',
                    'cellEditor': "agSelectCellEditor"
                },
                {
                    'headerName': 'Actions',
                    'field': 'actions',
                    'cellRenderer': actionCellRenderer,
                    'editable': false,
                    'sortable': false,
                    'filter': false
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
            rowData: membersList,

            onRowDoubleClicked: (ev) => {
                const memberDetails = ev.data;
                const memberViewTable = createTable(memberDetails)
                const div = CREATE_ELEMENT('div')
                div.style.padding = '20px';
                div.classList.add('flex-column', 'full-width', 'full-height')

                const pdfPrintButton = CREATE_ELEMENT('img');
                pdfPrintButton.classList.add('icon')
                pdfPrintButton.src = '../../resources/icons/pdf.png';
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

                for (const key in memberDetails) {
                    if (Object.hasOwnProperty.call(memberDetails, key)) {
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

                ModalExpertise.ShowModal((memberDetails['NAME']).toUpperCase(), memberViewTable, {
                    'modalChildStylesClassList': [],
                    titleColor: 'black',
                    headingColor: '#efc9c9',
                    TopButton: pdfPrintButton,
                    topButtonToolip: 'Print Member Card'
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
    div.id = 'member-card';
    div.style.height = '500px';
    div.style.paddingTop = '15px';
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
    const nameHeading = CREATE_ELEMENT('h3');
    nameHeading.innerText = obj['NAME'].toUpperCase();
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
    for (let i = 0; i < selectedRows.length; i++) {
        delete selectedRows[i]['_id'];
    }

    if (!selectedRows || selectedRows.length < 1) {
        return MessegePopup.ShowMessegePuppy('you need to select some data in order to export to spreadsheets')
    }

    const getFileName = prompt('enter a name for the file under which to save and download the data');
    var fileName = !getFileName ? 'data.csv' : getFileName + '.csv';

    const params = {
        fileName: fileName,
        onlySelected: true
    };

    gridOptions.api.exportDataAsCsv(params);
}
